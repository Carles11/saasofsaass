export type TenantRole = "owner" | "editor"

export interface ResolvedRoles {
  profileId: string
  profileName: string | null
  profileEmail: string
  workspaceId: string | null
  isSuperAdmin: boolean
  isWorkspaceOwner: boolean
  tenantRoles: Record<string, TenantRole>
  roles: string[]
}
