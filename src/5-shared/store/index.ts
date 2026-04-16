import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { createTenantSlice } from "@/4-entities/tenant/model/tenant-slice";
import { createUISlice } from "./slices/ui-slice";
import type { TenantSlice } from "@/5-shared/types";

/**
 * SOOS ROOT STORE
 * Combines entity logic (Tenant) with UI logic.
 * Note: We removed the i18n dictionary here because next-intl handles it.
 */

export type RootState = TenantSlice & {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
};

export const useStore = create<RootState>()(
  devtools(
    (set, get, store) => ({
      ...createTenantSlice(set, get, store),
      ...createUISlice(set, get, store),
    }),
    { name: "SoSS_Engine_Store" }
  )
);