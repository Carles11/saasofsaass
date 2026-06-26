"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { SIDEBAR_TABS } from "@/5-shared/config/sidebar-tabs";
import { can } from "@/5-shared/config/permissions";
import type { ResolvedRoles } from "@/5-shared/config/permissions";
import { cn } from "@/5-shared/lib/utils";

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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border pb-safe">
      <div className="flex overflow-x-auto gap-1 px-2 py-1.5 scrollbar-none">
        {visibleTabs.map((tab) => {
          const href = `/${locale}${tab.href}`;
          const isActive = pathname === href || pathname.startsWith(`${href}/`);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.id}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 whitespace-nowrap text-xs font-medium transition-colors shrink-0 relative",
                isActive
                  ? "text-foreground after:absolute after:top-0 after:left-1/2 after:-translate-x-1/2 after:h-0.5 after:w-6 after:bg-primary after:rounded-full"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
