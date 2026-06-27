import { db } from "@/5-shared/lib/db"
import { profiles, workspaceMemberships, membershipSites } from "@/5-shared/lib/db/schema/auth"
import { workspaces } from "@/5-shared/lib/db/schema"
import { eq } from "drizzle-orm"
import { authServer, type AuthSession } from "@/5-shared/lib/auth/server"
import type { ResolvedRoles, TenantRole } from "./types"

export async function resolveRoles(
  session?: AuthSession,
): Promise<ResolvedRoles | null> {
  const s = session ?? (await authServer.getSession()).data
  if (!s?.user?.email) return null

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.email, s.user.email))
    .limit(1)

  if (!profile) return null

  const isSuperAdmin = profile.role === "super_admin"

  const [workspace] = await db
    .select({ id: workspaces.id })
    .from(workspaces)
    .where(eq(workspaces.ownerProfileId, profile.id))
    .limit(1)

  const workspaceId = workspace?.id ?? null
  const isWorkspaceOwner = !!workspace

  const memberships = await db
    .select({
      role: workspaceMemberships.role,
      siteScope: workspaceMemberships.siteScope,
    })
    .from(workspaceMemberships)
    .where(eq(workspaceMemberships.profileId, profile.id))

  const hasWebmaster = memberships.some((m) => m.role === "webmaster")
  const hasEditor = memberships.some((m) => m.role === "editor")

  // Per-site roles for specific-scope memberships. Owner-of-workspace and
  // all-scope memberships are resolved on demand via getTenantRole rather than
  // enumerated here (would require listing every tenant in the workspace).
  const tenantRoles: Record<string, TenantRole> = {}
  if (memberships.some((m) => m.siteScope === "specific")) {
    const links = await db
      .select({ tenantId: membershipSites.tenantId, role: workspaceMemberships.role })
      .from(membershipSites)
      .innerJoin(workspaceMemberships, eq(membershipSites.membershipId, workspaceMemberships.id))
      .where(eq(workspaceMemberships.profileId, profile.id))
    for (const l of links) tenantRoles[l.tenantId] = l.role as TenantRole
  }

  const roles: string[] = []
  if (isSuperAdmin) roles.push("super_admin")
  if (isWorkspaceOwner) roles.push("workspace_owner")
  if (hasWebmaster) roles.push("tenant_webmaster")
  if (hasEditor) roles.push("tenant_editor")

  return {
    profileId: profile.id,
    profileName: profile.name,
    profileEmail: profile.email,
    workspaceId,
    isSuperAdmin,
    isWorkspaceOwner,
    tenantRoles,
    roles,
  }
}
