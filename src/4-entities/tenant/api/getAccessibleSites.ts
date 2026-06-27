import { db } from "@/5-shared/lib/db";
import { tenants, workspaces, type Tenant } from "@/5-shared/lib/db/schema";
import { workspaceMemberships, membershipSites } from "@/5-shared/lib/db/schema/auth";
import { eq, inArray } from "drizzle-orm";

export type AccessibleSiteRole = "owner" | "webmaster" | "editor";

export interface AccessibleSite {
  tenant: Tenant;
  role: AccessibleSiteRole;
}

/**
 * Every site a profile can access, with their effective role on each — resolved
 * from the workspace model (owned workspace → owner; memberships → webmaster/
 * editor by scope). Owner role wins on any overlap. This is the canonical source
 * for the dashboard site list under the new team model.
 */
export async function getAccessibleSites(profileId: string): Promise<AccessibleSite[]> {
  const byTenant = new Map<string, AccessibleSite>();

  // 1. Owned workspace → all its sites as owner.
  const [owned] = await db
    .select({ id: workspaces.id })
    .from(workspaces)
    .where(eq(workspaces.ownerProfileId, profileId))
    .limit(1);
  if (owned) {
    const ownedTenants = await db
      .select()
      .from(tenants)
      .where(eq(tenants.workspaceId, owned.id));
    for (const t of ownedTenants) byTenant.set(t.id, { tenant: t, role: "owner" });
  }

  // 2. Memberships → webmaster/editor, by scope.
  const memberships = await db
    .select({
      id: workspaceMemberships.id,
      workspaceId: workspaceMemberships.workspaceId,
      role: workspaceMemberships.role,
      siteScope: workspaceMemberships.siteScope,
    })
    .from(workspaceMemberships)
    .where(eq(workspaceMemberships.profileId, profileId));

  for (const m of memberships) {
    const role = m.role as AccessibleSiteRole;
    let scopedTenants: Tenant[] = [];
    if (m.siteScope === "all") {
      scopedTenants = await db
        .select()
        .from(tenants)
        .where(eq(tenants.workspaceId, m.workspaceId));
    } else {
      const links = await db
        .select({ tenantId: membershipSites.tenantId })
        .from(membershipSites)
        .where(eq(membershipSites.membershipId, m.id));
      const ids = links.map((l) => l.tenantId);
      if (ids.length > 0) {
        scopedTenants = await db.select().from(tenants).where(inArray(tenants.id, ids));
      }
    }
    for (const t of scopedTenants) {
      if (!byTenant.has(t.id)) byTenant.set(t.id, { tenant: t, role });
    }
  }

  return [...byTenant.values()];
}
