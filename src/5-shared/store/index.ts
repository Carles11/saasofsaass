import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {  createI18nSlice } from "./slices/i18n-slice";
import { I18nSlice } from "@/5-shared/types";

export type RootState = I18nSlice;

export const useStore = create<RootState>()(
  devtools((...a) => ({
    ...createI18nSlice(a[0]),
  }), { name: 'SoSSStore' })
);
