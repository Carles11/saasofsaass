import { db } from "@/5-shared/lib/db";
import { profiles } from "@/5-shared/lib/db/schema/auth";
import { eq } from "drizzle-orm";
import type { AuthSession } from "./server";

/**
 * Ensure a local profile exists for the authenticated Neon Auth user.
 * Matches by email so seed data and auth users stay linked regardless of
 * the Neon Auth user ID (which we can't predict).
 */
export async function syncProfile(session: AuthSession) {
  if (!session?.user?.email) return null;

  const [existing] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.email, session.user.email))
    .limit(1);

  if (existing) {
    const updates: Record<string, string | null> = {};
    if (session.user.name && session.user.name !== existing.name) updates.name = session.user.name;
    if (session.user.email !== existing.email) updates.email = session.user.email;
    if (session.user.image !== undefined && session.user.image !== existing.avatarUrl)
      updates.avatarUrl = session.user.image;
    if (Object.keys(updates).length > 0) {
      await db.update(profiles).set(updates).where(eq(profiles.email, session.user.email));
    }
    return existing;
  }

  const [profile] = await db
    .insert(profiles)
    .values({
      email: session.user.email,
      name: session.user.name ?? session.user.email.split("@")[0],
      avatarUrl: session.user.image ?? null,
      role: "user",
    })
    .returning();

  return profile;
}
