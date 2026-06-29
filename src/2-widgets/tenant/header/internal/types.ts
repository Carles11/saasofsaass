import type { Tenant } from "@/5-shared/lib/db/schema";
import type { ReactNode } from "react";
import type { NavLink } from "./shared";

export interface HeaderVariantProps {
  tenant: Tenant;
  navLinks: NavLink[];
  locale: string;
  isSubdomain: boolean;
  brandMark: ReactNode;
  logoHref: string;
  tenantLogoUrl: string | null;
  hasLocales: boolean;
}
