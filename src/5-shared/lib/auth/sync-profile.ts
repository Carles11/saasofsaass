import { db } from "@/5-shared/lib/db";
import { profiles } from "@/5-shared/lib/db/schema/auth";
import { eq } from "drizzle-orm";
import type { AuthSession } from "./server";

/**
 * Ensure a local profile exists for the authenticated Neon Auth user.
 *
 * Match strategy (in order):
 *  1. `profiles.authUserId === session.user.id` — stable id, survives email changes.
 *  2. `profiles.email === session.user.email` — fallback for seed rows, invite
 *     stubs, and pre-migration rows that don't have authUserId set yet.
 *
 * On the email-fallback match the row's `authUserId` is backfilled so future
 * lookups use the stable id. On insert the authUserId is set immediately.
 */
export async function syncProfile(session: AuthSession) {
  if (!session?.user) return null;

  const authId: string | undefined = (session.user as { id?: string }).id;
  const email: string | undefined = (session.user as { email?: string }).email;

  if (!authId && !email) return null;

  let existing: typeof profiles.$inferSelect | undefined;

  // 1. Match by stable auth id
  if (authId) {
    const [byId] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.authUserId, authId))
      .limit(1);
    existing = byId;
  }

  // 2. Fall back to email match
  if (!existing && email) {
    const [byEmail] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.email, email))
      .limit(1);

    if (byEmail) {
      existing = byEmail;
      // Backfill authUserId so future lookups are stable.
      if (authId && byEmail.authUserId !== authId) {
        await db
          .update(profiles)
          .set({ authUserId: authId, updatedAt: new Date() })
          .where(eq(profiles.id, byEmail.id));
        existing = { ...byEmail, authUserId: authId };
      }
    }
  }

  if (existing) {
    const updates: Record<string, string | null | Date> = {};
    const stubName = (email ?? "").split("@")[0];
    const nameIsStub = existing.name === stubName || existing.name === "";
    if (
      (session.user as { name?: string }).name &&
      ((session.user as { name?: string }).name !== existing.name || nameIsStub)
    ) {
      updates.name = (session.user as { name?: string }).name!;
    }
    if (email && email !== existing.email) updates.email = email;
    if (
      (session.user as { image?: string | null }).image !== undefined &&
      (session.user as { image?: string | null }).image !== existing.avatarUrl
    )
      updates.avatarUrl = (session.user as { image?: string | null }).image ?? null;
    if (Object.keys(updates).length > 0) {
      updates.updatedAt = new Date();
      await db.update(profiles).set(updates).where(eq(profiles.id, existing.id));
      return { ...existing, ...updates } as typeof profiles.$inferSelect;
    }
    return existing;
  }

  // 3. Insert brand-new profile
  const [profile] = await db
    .insert(profiles)
    .values({
      email: email ?? "",
      name: (session.user as { name?: string }).name ?? (email ?? "").split("@")[0],
      avatarUrl: (session.user as { image?: string | null }).image ?? null,
      authUserId: authId ?? null,
      role: "user",
    })
    .returning();

  return profile;
}
