import { useTranslations } from "next-intl";

/**
 * HOOK: useTranslation
 * Wrapper around next-intl's client hook.
 *
 * Note: platform translations loaded from the DB are resolved server-side
 * in page components and passed down as props. This hook is only for
 * next-intl dictionaries and does not query Neon directly.
 */
export function useTranslation(namespace?: string) {
  // next-intl provides namespace-scoped lookup in client components.
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