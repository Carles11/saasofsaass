import { db } from "@/5-shared/lib/db"
import { profiles, tenantMemberships } from "@/5-shared/lib/db/schema/auth"
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
    .select()
    .from(tenantMemberships)
    .where(eq(tenantMemberships.profileId, profile.id))

  const tenantRoles: Record<string, TenantRole> = {}
  for (const m of memberships) {
    tenantRoles[m.tenantId] = m.role as TenantRole
  }

  const roles: string[] = []
  if (isSuperAdmin) roles.push("super_admin")
  if (isWorkspaceOwner) roles.push("workspace_owner")
  if (Object.values(tenantRoles).includes("owner")) roles.push("tenant_owner")
  if (Object.values(tenantRoles).includes("editor")) roles.push("tenant_editor")

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
