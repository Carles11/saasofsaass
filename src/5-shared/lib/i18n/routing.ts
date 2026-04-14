import { defineRouting } from 'next-intl/routing'
import{SUPPORTED_LOCALES}from"@/5-shared/config/languages/supportedLanguages";

export const routing = defineRouting({
  locales: SUPPORTED_LOCALES,
  defaultLocale: 'en',
})