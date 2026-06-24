const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN ?? "app.localhost";
const IS_DEV = APP_DOMAIN.includes("localhost");
const APP_BASE = IS_DEV ? `http://${APP_DOMAIN}:3000` : `https://${APP_DOMAIN}`;

export function appAuthUrl(path: "sign-in" | "sign-up" | "login", locale: string): string {
  return `${APP_BASE}/${locale}/auth/${path}`;
}

export function appDashboardUrl(locale: string): string {
  return `${APP_BASE}/${locale}/dashboard`;
}
