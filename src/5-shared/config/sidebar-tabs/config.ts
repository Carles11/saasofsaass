import type { Permission } from "../permissions/permissions"

export interface SidebarTab {
  id: string
  label: string
  icon: string
  href: string
  permission: Permission
}

export const SIDEBAR_TABS: SidebarTab[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: "⊞",
    href: "/dashboard",
    permission: "viewDashboard",
  },
  {
    id: "sites",
    label: "Sites",
    icon: "◎",
    href: "/sites",
    permission: "manageSites",
  },
  {
    id: "team",
    label: "Team",
    icon: "👥",
    href: "/team",
    permission: "manageTeam",
  },
  {
    id: "billing",
    label: "Billing",
    icon: "💳",
    href: "/billing",
    permission: "manageBilling",
  },
  {
    id: "account",
    label: "Account",
    icon: "⚙️",
    href: "/account",
    permission: "viewAccount",
  },
  {
    id: "settings",
    label: "Settings",
    icon: "🔧",
    href: "/settings",
    permission: "viewSettings",
  },
]
