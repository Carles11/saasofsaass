import type { Tenant } from "@/5-shared/lib/db/schema";

export interface TenantSlice {
  activeTenant: Tenant | null;
  isTranslating: boolean;
  translationProgress: number;
  setTenant: (tenant: Tenant | null) => void;
  updateTranslationStatus: (isTranslating: boolean, progress?: number) => void;
  resetTenant: () => void;
}

export interface UISlice {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}