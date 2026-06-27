import type { ResolvedRoles } from "./types"

export type Permission =
  | "viewDashboard"
  | "manageSites"
  | "createSite"
  | "deleteSite"
  | "manageTeam"
  | "inviteWebmaster"
  | "inviteEditor"
  | "manageBilling"
  | "manageWorkspace"
  | "viewAccount"
  | "viewSettings"
  | "manageDomains"
  | "manageTemplate"
  | "editContent"
  | "accessAdminPanel"

export const ROLE_PERMISSIONS: Record<
  string,
  Partial<Record<Permission, boolean>>
> = {
  super_admin: {
    viewDashboard: true,
    manageSites: true,
    createSite: true,
    deleteSite: true,
    manageTeam: true,
    inviteWebmaster: true,
    inviteEditor: true,
    manageBilling: true,
    manageWorkspace: true,
    viewAccount: true,
    viewSettings: true,
    manageDomains: true,
    manageTemplate: true,
    editContent: true,
    accessAdminPanel: true,
  },
  workspace_owner: {
    viewDashboard: true,
    manageSites: true,
    createSite: true,
    manageTeam: true,
    inviteWebmaster: true,
    inviteEditor: true,
    manageBilling: true,
    viewAccount: true,
    viewSettings: true,
    manageDomains: true,
    manageTemplate: true,
    editContent: true,
  },
  tenant_webmaster: {
    viewDashboard: true,
    manageSites: true,
    manageTeam: true,
    inviteEditor: true,
    viewAccount: true,
    viewSettings: true,
    manageDomains: true,
    manageTemplate: true,
    editContent: true,
  },
  tenant_editor: {
    viewDashboard: true,
    manageSites: true,
    viewAccount: true,
    editContent: true,
  },
}

export function can(
  user: ResolvedRoles,
  permission: Permission,
): boolean {
  if (user.isSuperAdmin) return true
  return user.roles.some(
    (role) => ROLE_PERMISSIONS[role]?.[permission],
  )
}

export function requirePermission(
  user: ResolvedRoles,
  permission: Permission,
): void {
  if (!can(user, permission)) {
    throw new Error(`Access denied: ${permission}`)
  }
}
