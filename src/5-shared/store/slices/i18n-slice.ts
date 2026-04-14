import { I18nSlice } from "@/5-shared/types/languages/I18n";

export const createI18nSlice = (set: any): I18nSlice => ({
  locale: 'en',
  dictionary: {},
  isRTL: false,
  setI18n: (locale, dictionary, isRTL = false) => set({ locale, dictionary, isRTL }),
});
