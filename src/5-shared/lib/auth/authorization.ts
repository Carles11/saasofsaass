import { db } from "@/5-shared/lib/db"
import { profiles, tenantMemberships } from "@/5-shared/lib/db/schema/auth"
import { eq, and } from "drizzle-orm"
import { authServer, type AuthSession } from "./server"

export type TenantRole = "owner" | "editor"

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

/** Get the caller's role for a specific tenant. Returns null if no membership. */
export async function getTenantRole(
  tenantId: string,
  profileId?: string,
): Promise<TenantRole | null> {
  const pid = profileId ?? (await requireProfile()).id

  const [membership] = await db
    .select({ role: tenantMemberships.role })
    .from(tenantMemberships)
    .where(
      and(
        eq(tenantMemberships.tenantId, tenantId),
        eq(tenantMemberships.profileId, pid),
      ),
    )
    .limit(1)

  return (membership?.role as TenantRole) ?? null
}

/**
 * Assert the caller has at least the given role for a tenant.
 * Super admins bypass this check entirely.
 */
export async function assertTenantRole(
  tenantId: string,
  minimumRole: TenantRole,
  profileId?: string,
): Promise<void> {
  const profile = profileId
    ? (await db.select().from(profiles).where(eq(profiles.id, profileId)).limit(1))[0] ?? null
    : await requireProfile()

  if (!profile) throw new Error("Unauthorized")
  if (profile.role === "super_admin") return

  const role = await getTenantRole(tenantId, profile.id)
  if (!role) throw new Error("You are not a member of this tenant")

  if (minimumRole === "owner" && role !== "owner") {
    throw new Error("Only tenant owners can perform this action")
  }
}

/**
 * Assert the caller can view/manage content on this tenant.
 * Requires at least 'editor' role (which includes owners).
 */
export async function assertCanEditContent(tenantId: string): Promise<void> {
  return assertTenantRole(tenantId, "editor")
}

/**
 * Assert the caller can change block structure / settings on this tenant.
 * Requires 'owner' role.
 */
export async function assertCanManageStructure(tenantId: string): Promise<void> {
  return assertTenantRole(tenantId, "owner")
}
