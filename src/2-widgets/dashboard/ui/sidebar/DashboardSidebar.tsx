"use client";

import { useStore } from "@/5-shared/store/index";
import { motion } from "framer-motion";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import type { AuthSession } from "@/5-shared/lib/auth/server";
import { SIDEBAR_TABS } from "@/5-shared/config/sidebar-tabs";
import { can } from "@/5-shared/config/permissions";
import type { ResolvedRoles } from "@/5-shared/config/permissions";
import { LogOutButton } from "@/components/ui/log-out-button";

interface DashboardSidebarProps {
  session: AuthSession;
  resolvedRoles: ResolvedRoles;
}

export const DashboardSidebar = ({
  session,
  resolvedRoles,
}: DashboardSidebarProps) => {
  const isOpen = useStore((state) => state.isSidebarOpen);
  const toggle = useStore((state) => state.toggleSidebar);
  const params = useParams();
  const pathname = usePathname();
  const locale = (params.locale as string) || "en";

  const user = session?.user;
  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() ?? "?";

  const visibleTabs = SIDEBAR_TABS.filter((tab) =>
    can(resolvedRoles, tab.permission),
  );

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
              className="font-black tracking-tighter text-xl cursor-pointer"
            >
              SoSs
            </motion.span>
          </Link>
        )}
        <button
          onClick={toggle}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
          aria-label={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
        >
          {isOpen ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          )}
        </button>
      </div>

      {user && (
        <div className="flex items-center gap-3 px-2 mb-6">
          <div className="h-9 w-9 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shrink-0">
            {initials}
          </div>
          {isOpen && (
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{user.name || user.email}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
              <LogOutButton size="xs" className="mt-1 h-6 px-2 text-[10px]" label="Sign out" />
            </div>
          )}
        </div>
      )}

      <nav className="flex-1 space-y-2">
        {visibleTabs.map((tab) => {
          const href = `/${locale}${tab.href}`;
          const isActive = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={tab.id}
              href={href}
              className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-colors group ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-white/5 text-foreground"
              }`}
            >
              <span className="text-xl w-6 flex justify-center group-hover:scale-110 transition-transform font-mono">
                {tab.icon}
              </span>
              {isOpen && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-sm font-medium tracking-tight"
                >
                  {tab.label}
                </motion.span>
              )}
            </Link>
          );
        })}
      </nav>

      {isOpen && (
        <div className="p-4 bg-white/5 rounded-3xl border border-white/10">
          <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-bold mb-1">
            Active Engine
          </p>
          <p className="text-xs font-mono text-emerald-400">v16.2.0-turbo</p>
        </div>
      )}
    </motion.aside>
  );
};
