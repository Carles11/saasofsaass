import { db } from "@/5-shared/lib/db";
import { tenants, workspaces } from "@/5-shared/lib/db/schema";
import { workspaceMemberships } from "@/5-shared/lib/db/schema/auth";
import { eq, sql } from "drizzle-orm";
import { getSiteLimit, getLimit, isUnlimited } from "./plans";

/**
 * Ensure the given profile owns a workspace, creating a free one if missing.
 * Every registered user owns exactly one workspace (unique constraint on
 * workspaces.owner_profile_id). Safe to call on every dashboard visit — a fast
 * no-op once the workspace exists.
 */
export async function ensureWorkspace(profileId: string, profileName?: string | null) {
  const [existing] = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.ownerProfileId, profileId))
    .limit(1);

  if (existing) return existing;

  const name = profileName ? `${profileName}'s Account` : "My Account";
  try {
    const [ws] = await db
      .insert(workspaces)
      .values({
        name,
        ownerProfileId: profileId,
        plan: "free",
        siteLimit: getSiteLimit("free"),
      })
      .returning();
    return ws;
  } catch (error: any) {
    // Unique violation (23505) — a concurrent request created it first.
    if (error?.cause?.code === "23505") {
      const [ws] = await db
        .select()
        .from(workspaces)
        .where(eq(workspaces.ownerProfileId, profileId))
        .limit(1);
      if (ws) return ws;
    }
    throw error;
  }
}

/**
 * The user's own workspace for the dashboard chrome.
 * - Returns their owned workspace if it exists.
 * - For a brand-new user who isn't collaborating anywhere, lazily creates a Free
 *   workspace so they can start building.
 * - For a pure collaborator (member of someone else's workspace, owns none),
 *   returns null — they shouldn't accrue a stray workspace or plan badge. They
 *   can still create their own site, which provisions a workspace on demand.
 */
export async function getOwnWorkspaceForDashboard(
  profileId: string,
  profileName?: string | null,
) {
  const [existing] = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.ownerProfileId, profileId))
    .limit(1);
  if (existing) return existing;

  const [membership] = await db
    .select({ id: workspaceMemberships.id })
    .from(workspaceMemberships)
    .where(eq(workspaceMemberships.profileId, profileId))
    .limit(1);
  if (membership) return null;

  return ensureWorkspace(profileId, profileName);
}

/** Resolve a workspace's plan slug, defaulting to "free" when absent. */
export async function getPlanForWorkspace(workspaceId: string | null): Promise<string> {
  if (!workspaceId) return "free";
  const [ws] = await db
    .select({ plan: workspaces.plan })
    .from(workspaces)
    .where(eq(workspaces.id, workspaceId))
    .limit(1);
  return ws?.plan ?? "free";
}

export interface AiQuota {
  workspaceId: string | null;
  /** -1 = unlimited */
  limit: number;
  used: number;
  /** Number.POSITIVE_INFINITY when unlimited */
  remaining: number;
}

/** Resolve the AI-translation quota for a tenant's owning workspace. */
export async function getAiQuota(tenantId: string): Promise<AiQuota> {
  const [row] = await db
    .select({
      workspaceId: workspaces.id,
      plan: workspaces.plan,
      used: workspaces.aiBlocksUsed,
    })
    .from(tenants)
    .leftJoin(workspaces, eq(tenants.workspaceId, workspaces.id))
    .where(eq(tenants.id, tenantId))
    .limit(1);

  const plan = row?.plan ?? "free";
  const used = row?.used ?? 0;
  const limit = getLimit(plan, "aiBlocksLifetime");
  const remaining = isUnlimited(limit) ? Number.POSITIVE_INFINITY : Math.max(0, limit - used);
  return { workspaceId: row?.workspaceId ?? null, limit, used, remaining };
}

/** Increment the lifetime AI-translated-blocks counter. No-op for n <= 0. */
export async function incrementAiBlocksUsed(workspaceId: string, n: number): Promise<void> {
  if (n <= 0) return;
  await db
    .update(workspaces)
    .set({ aiBlocksUsed: sql`${workspaces.aiBlocksUsed} + ${n}` })
    .where(eq(workspaces.id, workspaceId));
}
