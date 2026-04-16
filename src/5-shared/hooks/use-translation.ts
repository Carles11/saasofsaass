import { useTranslations } from "next-intl";

/**
 * HOOK: useTranslation
 * Refactored for the "Bentley" Engine.
 * * Since platform translations (UI labels, etc.) are now handled by next-intl 
 * and fetched from the platform_translations table, we no longer store 
 * the dictionary in Zustand.
 * * This hook bridges the gap, providing the 't' function with native 
 * dot-notation support and server-side optimization.
 */
export function useTranslation(namespace?: string) {
  // next-intl's useTranslations is our new source of truth.
  // It handles the cache and the Neon DB handshake automatically.
  const t = useTranslations(namespace);

  /**
   * Translates a key using next-intl.
   * next-intl natively supports dot notation (e.g., 'dashboard.nav.home'),
   * so the old getNestedValue utility is no longer required.
   */
  const translate = (key: string): string => {
    try {
      return t(key);
    } catch {
      // Fallback to the key itself if the translation is missing
      return key;
    }
  };

  return { 
    t: translate,
    // You can also expose the raw next-intl hook features if needed
  };
}