import type { StateCreator } from "zustand";
import type { Tenant } from "@/5-shared/lib/db/schema";
import type { TenantSlice } from "@/5-shared/types";

/**
 * ENTITY SLICE: Tenant
 * Handles the active tenant context and AI translation tracking.
 */
export const createTenantSlice: StateCreator<TenantSlice> = (set) => ({
  activeTenant: null,
  isTranslating: false,
  translationProgress: 0,

  setTenant: (tenant) => set({ activeTenant: tenant }),
  
  updateTranslationStatus: (isTranslating, progress = 0) => 
    set({ isTranslating, translationProgress: progress }),

  resetTenant: () => set({ activeTenant: null, translationProgress: 0 }),
});