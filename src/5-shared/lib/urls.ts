/**
 * Build a locale-prefixed relative dashboard URL.
 * Example: dashboardUrl("en", "dashboard") → "/en/dashboard"
 */
export function dashboardUrl(locale: string, path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `/${locale}${p}`;
}
