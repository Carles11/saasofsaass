// ── Translation fallback chain ─────────────────────────────────────────────────

import { SupportedLocaleType } from "@/5-shared/types/languages/supportedLocales";

// Priority: requested locale → tenant.defaultLocale → 'en' → {}
export function resolveBlockT(
  translations: unknown,
  locale: SupportedLocaleType,
  defaultLocale: string
): Record<string, string> {
  const map = (translations ?? {}) as Record<string, Record<string, string>>;
  return map[locale] ?? map[defaultLocale] ?? map["en"] ?? {};
}
