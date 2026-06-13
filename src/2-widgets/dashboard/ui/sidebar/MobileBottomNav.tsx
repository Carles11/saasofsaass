"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { SIDEBAR_TABS } from "@/5-shared/config/sidebar-tabs";
import { can } from "@/5-shared/config/permissions";
import type { ResolvedRoles } from "@/5-shared/config/permissions";

interface MobileBottomNavProps {
  resolvedRoles: ResolvedRoles;
}

export function MobileBottomNav({ resolvedRoles }: MobileBottomNavProps) {
  const params = useParams();
  const pathname = usePathname();
  const locale = (params.locale as string) || "en";

  const visibleTabs = SIDEBAR_TABS.filter((tab) =>
    can(resolvedRoles, tab.permission),
  );

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border">
      <div className="flex overflow-x-auto gap-1 px-2 py-2 scrollbar-none">
        {visibleTabs.map((tab) => {
          const href = `/${locale}${tab.href}`;
          const isActive = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={tab.id}
              href={href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg whitespace-nowrap text-xs font-medium transition-colors shrink-0 ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
