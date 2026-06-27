import { db } from "@/5-shared/lib/db";
import { tenants, workspaces } from "@/5-shared/lib/db/schema";
import {
  workspaceMemberships,
  membershipSites,
  type Profile,
} from "@/5-shared/lib/db/schema/auth";
import { and, eq } from "drizzle-orm";

export type WorkspaceCallerRole = "owner" | "webmaster" | "editor";

/**
 * Resolve a caller's role within a specific workspace.
 * owner = super_admin or the workspace's ownerProfileId; otherwise the
 * workspace_memberships role (webmaster|editor), or null when not a member.
 */
export async function getWorkspaceRoleForCaller(
  workspaceId: string,
  profile: Pick<Profile, "id" | "role">,
): Promise<WorkspaceCallerRole | null> {
  if (profile.role === "super_admin") return "owner";

  const [ws] = await db
    .select({ ownerProfileId: workspaces.ownerProfileId })
    .from(workspaces)
    .where(eq(workspaces.id, workspaceId))
    .limit(1);
  if (ws?.ownerProfileId === profile.id) return "owner";

  const [m] = await db
    .select({ role: workspaceMemberships.role })
    .from(workspaceMemberships)
    .where(
      and(
        eq(workspaceMemberships.workspaceId, workspaceId),
        eq(workspaceMemberships.profileId, profile.id),
      ),
    )
    .limit(1);

  return (m?.role as WorkspaceCallerRole) ?? null;
}

export interface ActiveTeamWorkspace {
  workspaceId: string;
  callerRole: "owner" | "webmaster";
  plan: string;
}

/**
 * The workspace a caller manages a team in: their owned workspace if they own
 * one, otherwise the (first) workspace where they are a web-master. Editors and
 * users with no team access get null.
 */
export async function getActiveTeamWorkspace(
  profile: Pick<Profile, "id">,
): Promise<ActiveTeamWorkspace | null> {
  const [owned] = await db
    .select({ id: workspaces.id, plan: workspaces.plan })
    .from(workspaces)
    .where(eq(workspaces.ownerProfileId, profile.id))
    .limit(1);
  if (owned) return { workspaceId: owned.id, callerRole: "owner", plan: owned.plan };

  const [m] = await db
    .select({ workspaceId: workspaceMemberships.workspaceId })
    .from(workspaceMemberships)
    .where(
      and(
        eq(workspaceMemberships.profileId, profile.id),
        eq(workspaceMemberships.role, "webmaster"),
      ),
    )
    .limit(1);
  if (!m) return null;

  const [ws] = await db
    .select({ plan: workspaces.plan })
    .from(workspaces)
    .where(eq(workspaces.id, m.workspaceId))
    .limit(1);
  return { workspaceId: m.workspaceId, callerRole: "webmaster", plan: ws?.plan ?? "free" };
}

/** Tenant ids a web-master can access within a workspace (for scope validation). */
export async function getWebmasterAccessibleTenantIds(
  workspaceId: string,
  profileId: string,
): Promise<string[]> {
  const [m] = await db
    .select({ id: workspaceMemberships.id, siteScope: workspaceMemberships.siteScope })
    .from(workspaceMemberships)
    .where(
      and(
        eq(workspaceMemberships.workspaceId, workspaceId),
        eq(workspaceMemberships.profileId, profileId),
      ),
    )
    .limit(1);
  if (!m) return [];

  if (m.siteScope === "all") {
    const rows = await db
      .select({ id: tenants.id })
      .from(tenants)
      .where(eq(tenants.workspaceId, workspaceId));
    return rows.map((r) => r.id);
  }

  const rows = await db
    .select({ tenantId: membershipSites.tenantId })
    .from(membershipSites)
    .where(eq(membershipSites.membershipId, m.id));
  return rows.map((r) => r.tenantId);
}
