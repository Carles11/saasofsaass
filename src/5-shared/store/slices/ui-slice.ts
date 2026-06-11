import { UISlice } from "@/5-shared/types";
import { StateCreator } from "zustand";

/**
 * SHARED SLICE: UI
 * Manages global interface states like sidebars and layout visibility.
 * Follows the StateCreator pattern for easy combination in the root store.
 */
export const createUISlice: StateCreator<UISlice> = (set) => ({
  isSidebarOpen: true,

  /**
   * Toggles the dashboard/builder sidebar.
   */
  toggleSidebar: () =>
    set((state: UISlice) => ({
      isSidebarOpen: !state.isSidebarOpen,
    })),
});
