"use client";

import { useStore } from "@/5-shared/store/index";
import { motion } from "framer-motion";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { ChevronDown, LogOut, PanelRightOpen, PanelRightClose } from "lucide-react";
import type { AuthSession } from "@/5-shared/lib/auth/server";
import { SIDEBAR_TABS } from "@/5-shared/config/sidebar-tabs";
import { can } from "@/5-shared/config/permissions";
import type { ResolvedRoles } from "@/5-shared/config/permissions";
import { authClient } from "@/5-shared/lib/auth/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/5-shared/lib/utils";

interface DashboardSidebarProps {
  session: AuthSession;
  resolvedRoles: ResolvedRoles;
  planLabel?: string | null;
}

export const DashboardSidebar = ({
  session,
  resolvedRoles,
  planLabel,
}: DashboardSidebarProps) => {
  const isOpen = useStore((state) => state.isSidebarOpen);
  const toggle = useStore((state) => state.toggleSidebar);
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const locale = (params.locale as string) || "en";

  const user = session?.user;
  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() ?? "?";

  const visibleTabs = SIDEBAR_TABS.filter((tab) =>
    can(resolvedRoles, tab.permission),
  );

  async function handleSignOut() {
    await authClient.signOut();
    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "localhost";
    const isDev = process.env.NODE_ENV === "development";
    const base = isDev ? `http://${rootDomain}:3000` : `https://${rootDomain}`;
    window.location.href = `${base}/${locale}`;
  }

  return (
    <motion.aside
      initial={false}
      animate={{ width: isOpen ? 280 : 80 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="h-screen bg-background text-foreground p-4 border-r border-border flex flex-col overflow-hidden max-md:hidden"
    >
      <div className="flex items-center justify-between mb-8 px-2">
        {isOpen && (
          <Link href={`/${locale}/dashboard`}>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-semibold tracking-tight text-lg cursor-pointer"
            >
              SoSs
            </motion.span>
          </Link>
        )}
        <button
          onClick={toggle}
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          aria-label={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
        >
          {isOpen ? (
            <PanelRightOpen className="h-4 w-4" />
          ) : (
            <PanelRightClose className="h-4 w-4" />
          )}
        </button>
      </div>

      {user && (
        <div className="flex items-center gap-3 px-2 mb-6">
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium shrink-0">
            {initials}
          </div>
          {isOpen && (
            <div className="min-w-0 flex-1 flex items-center justify-between gap-1">
              <div className="truncate">
                <p className="text-sm font-medium truncate">{user.name || user.email}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" sideOffset={4} className="w-56">
                  {planLabel && (
                    <>
                      <div className="px-2 py-1.5">
                        <p className="text-xs font-medium text-muted-foreground">{planLabel}</p>
                      </div>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <div className="px-2 py-1.5">
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-sm cursor-pointer">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      )}

      <nav className="flex-1 space-y-1">
        {visibleTabs.map((tab) => {
          const href = `/${locale}${tab.href}`;
          const isActive = pathname === href || pathname.startsWith(`${href}/`);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.id}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md transition-colors group",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {isOpen && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-sm font-medium"
                >
                  {tab.label}
                </motion.span>
              )}
            </Link>
          );
        })}
      </nav>

      {isOpen && (
        <div className="p-3 rounded-lg border border-border">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-1">
            Active Engine
          </p>
          <p className="text-xs text-muted-foreground font-mono">v16.2.0-turbo</p>
        </div>
      )}
    </motion.aside>
  );
};
