import { db } from "@/5-shared/lib/db"
import { profiles, workspaceMemberships, membershipSites } from "@/5-shared/lib/db/schema/auth"
import { tenants, workspaces } from "@/5-shared/lib/db/schema"
import { eq, and } from "drizzle-orm"
import { authServer, type AuthSession } from "./server"
import type { TenantRole } from "@/5-shared/config/permissions/types"
import { TENANT_ROLE_RANK } from "@/5-shared/config/permissions/tenantRole"

export type { TenantRole }

/** Get the current user's profile from the DB, or null if not authenticated. */
export async function getCurrentProfile(session?: AuthSession) {
  const s = session ?? (await authServer.getSession()).data
  if (!s?.user?.email) return null

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.email, s.user.email))
    .limit(1)

  return profile ?? null
}

/** Require an authenticated user. Throws if not logged in. */
export async function requireProfile(session?: AuthSession) {
  const profile = await getCurrentProfile(session)
  if (!profile) throw new Error("Unauthorized")
  return profile
}

/** Load a profile's id + platform role by id (or null). */
async function loadProfile(profileId: string) {
  const [p] = await db
    .select({ id: profiles.id, role: profiles.role })
    .from(profiles)
    .where(eq(profiles.id, profileId))
    .limit(1)
  return p ?? null
}

/**
 * Resolve the caller's effective role on a specific tenant.
 *
 * Resolution order:
 *  1. super_admin                            → owner
 *  2. owner of the tenant's workspace        → owner
 *  3. workspace membership, scope = all      → membership role (webmaster|editor)
 *  4. workspace membership, scope = specific → membership role iff this tenant
 *                                              is in membership_sites, else null
 *
 * Returns null when the caller has no access.
 */
export async function getTenantRole(
  tenantId: string,
  profileId?: string,
): Promise<TenantRole | null> {
  const profile = profileId ? await loadProfile(profileId) : await requireProfile()
  if (!profile) return null
  if (profile.role === "super_admin") return "owner"

  // Tenant's workspace + that workspace's owner, in one hop.
  const [row] = await db
    .select({
      workspaceId: tenants.workspaceId,
      ownerProfileId: workspaces.ownerProfileId,
    })
    .from(tenants)
    .leftJoin(workspaces, eq(workspaces.id, tenants.workspaceId))
    .where(eq(tenants.id, tenantId))
    .limit(1)

  if (!row?.workspaceId) return null
  if (row.ownerProfileId === profile.id) return "owner"

  const [membership] = await db
    .select({
      id: workspaceMemberships.id,
      role: workspaceMemberships.role,
      siteScope: workspaceMemberships.siteScope,
    })
    .from(workspaceMemberships)
    .where(
      and(
        eq(workspaceMemberships.workspaceId, row.workspaceId),
        eq(workspaceMemberships.profileId, profile.id),
      ),
    )
    .limit(1)

  if (!membership) return null
  if (membership.siteScope === "all") return membership.role as TenantRole

  // Specific scope: the membership must be linked to this tenant.
  const [link] = await db
    .select({ tenantId: membershipSites.tenantId })
    .from(membershipSites)
    .where(
      and(
        eq(membershipSites.membershipId, membership.id),
        eq(membershipSites.tenantId, tenantId),
      ),
    )
    .limit(1)

  return link ? (membership.role as TenantRole) : null
}

/**
 * Assert the caller has at least the given role on a tenant.
 * Super admins bypass this check entirely.
 */
export async function assertTenantRole(
  tenantId: string,
  minimumRole: TenantRole,
  profileId?: string,
): Promise<void> {
  const profile = profileId ? await loadProfile(profileId) : await requireProfile()
  if (!profile) throw new Error("Unauthorized")
  if (profile.role === "super_admin") return

  const role = await getTenantRole(tenantId, profile.id)
  if (!role) throw new Error("You are not a member of this tenant")
  if (TENANT_ROLE_RANK[role] < TENANT_ROLE_RANK[minimumRole]) {
    throw new Error("You do not have permission to perform this action")
  }
}

/**
 * Assert the caller can view/manage content on this tenant.
 * Requires at least 'editor' (owner & webmaster included).
 */
export async function assertCanEditContent(tenantId: string): Promise<void> {
  return assertTenantRole(tenantId, "editor")
}

/**
 * Assert the caller can change a site's structure / settings.
 * Requires at least 'webmaster' (owner included; editors excluded).
 */
export async function assertCanManageStructure(tenantId: string): Promise<void> {
  return assertTenantRole(tenantId, "webmaster")
}

/**
 * Assert the caller owns the given workspace (or is super_admin).
 * Use for workspace-level, owner-only actions: billing, workspace settings,
 * create/delete site, managing web-masters, ownership transfer.
 */
export async function assertWorkspaceOwner(
  workspaceId: string,
  profileId?: string,
): Promise<void> {
  const profile = profileId ? await loadProfile(profileId) : await requireProfile()
  if (!profile) throw new Error("Unauthorized")
  if (profile.role === "super_admin") return

  const [ws] = await db
    .select({ ownerProfileId: workspaces.ownerProfileId })
    .from(workspaces)
    .where(eq(workspaces.id, workspaceId))
    .limit(1)

  if (!ws || ws.ownerProfileId !== profile.id) {
    throw new Error("Only the workspace owner can perform this action")
  }
}
