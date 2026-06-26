import { LayoutGrid, Globe, Users, CreditCard, User, Cog } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { Permission } from "../permissions/permissions"

export interface SidebarTab {
  id: string
  label: string
  icon: LucideIcon
  href: string
  permission: Permission
}

export const SIDEBAR_TABS: SidebarTab[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutGrid,
    href: "/dashboard",
    permission: "viewDashboard",
  },
  {
    id: "sites",
    label: "Sites",
    icon: Globe,
    href: "/sites",
    permission: "manageSites",
  },
  {
    id: "team",
    label: "Team",
    icon: Users,
    href: "/team",
    permission: "manageTeam",
  },
  {
    id: "billing",
    label: "Billing",
    icon: CreditCard,
    href: "/billing",
    permission: "manageBilling",
  },
  {
    id: "account",
    label: "Account",
    icon: User,
    href: "/account",
    permission: "viewAccount",
  },
  {
    id: "settings",
    label: "Settings",
    icon: Cog,
    href: "/settings",
    permission: "viewSettings",
  },
]
