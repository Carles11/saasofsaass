const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN ?? "app.localhost";
const IS_DEV = APP_DOMAIN.includes("localhost");
const APP_BASE = IS_DEV ? `http://${APP_DOMAIN}:3000` : `https://${APP_DOMAIN}`;

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "saasofsaass.com";
const MARKETING_BASE = IS_DEV ? "http://localhost:3000" : `https://${ROOT_DOMAIN}`;

export function appAuthUrl(path: "sign-in" | "sign-up", locale: string): string {
  return `${APP_BASE}/${locale}/auth/${path}`;
}

export function appDashboardUrl(locale: string): string {
  return `${APP_BASE}/${locale}/dashboard`;
}

/** Public URL where an invitee lands to view + accept a team invitation. */
export function appInviteUrl(token: string, locale: string): string {
  return `${APP_BASE}/${locale}/invite/${token}`;
}

/** Absolute URL to a page on the public marketing domain (e.g. the pricing page).
 * Used to cross from the app domain to marketing. `path` may include a query string. */
export function marketingUrl(path: string, locale: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${MARKETING_BASE}/${locale}${clean}`;
}
