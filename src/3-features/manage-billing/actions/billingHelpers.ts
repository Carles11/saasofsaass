import { db } from "@/5-shared/lib/db";
import { workspaces, tenants } from "@/5-shared/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";

export interface WorkspaceInfo {
  id: string;
  plan: string;
  siteLimit: number;
  subscriptionStatus: string | null;
  stripeCustomerId: string | null;
}

export async function getWorkspaceByProfileId(
  profileId: string,
): Promise<WorkspaceInfo | null> {
  const [ws] = await db
    .select({
      id: workspaces.id,
      plan: workspaces.plan,
      siteLimit: workspaces.siteLimit,
      subscriptionStatus: workspaces.subscriptionStatus,
      stripeCustomerId: workspaces.stripeCustomerId,
    })
    .from(workspaces)
    .where(eq(workspaces.ownerProfileId, profileId))
    .limit(1);

  return ws ?? null;
}

export async function countPublishedTenants(workspaceId: string): Promise<number> {
  const [result] = await db
    .select({ count: sql<number>`count(*)` })
    .from(tenants)
    .where(
      and(eq(tenants.workspaceId, workspaceId), eq(tenants.status, "published")),
    );

  return Number(result?.count ?? 0);
}
