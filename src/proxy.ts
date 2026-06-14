import createIntlMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";

import { neonAuthMiddleware } from "@neondatabase/auth/next/server";
import { neon } from "@neondatabase/serverless";
import { routing } from "./5-shared/lib/i18n/routing";
import {
  normalizeHostname,
  parseDomain,
} from "./5-shared/lib/next/domain-parser";
import { tenantCache } from "./5-shared/lib/next/tenant-cache";
import { SIDEBAR_TABS } from "./5-shared/config/sidebar-tabs";

// ── Constants — resolved once per worker instance ──────────────────────────────
const rootDomain = (
  process.env.NEXT_PUBLIC_ROOT_DOMAIN || "saasofsaass.com"
).toLowerCase();
const appDomain = (
  process.env.NEXT_PUBLIC_APP_DOMAIN || `app.${rootDomain}`
).toLowerCase();
const TENANT_NOT_FOUND_URL = `https://${rootDomain}`;
const TENANT_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// Dashboard route prefixes derived from the canonical sidebar-tabs config.
// Used to enforce domain isolation — these routes are only valid on DASHBOARD host.
const DASHBOARD_ROUTE_PREFIXES = SIDEBAR_TABS.map((tab) => tab.href);

// Edge-compatible Neon HTTP client (instantiated once, reused across requests)
const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;

const intlMiddleware = createIntlMiddleware(routing);
const localePattern = new RegExp(`^/(${routing.locales.join("|")})(/|$)`);

// ── Tenant existence check with cache ──────────────────────────────────────────
async function isTenantActive(
  tenantKey: string,
  isSubdomain: boolean,
): Promise<boolean> {
  const cached = await tenantCache.get(tenantKey);
  if (cached !== null) return cached.exists;

  if (!sql) return true; // No DB configured — let the page handle it

  try {
    // neon driver requires tagged template literals — use separate queries per lookup type
    const rows = isSubdomain
      ? await sql`SELECT id FROM tenants WHERE slug   = ${tenantKey} AND is_active = true LIMIT 1`
      : await sql`SELECT id FROM tenants WHERE domain = ${tenantKey} AND is_active = true LIMIT 1`;
    const exists = rows.length > 0;
    await tenantCache.set(tenantKey, { exists }, TENANT_CACHE_TTL_MS);
    return exists;
  } catch {
    // DB error: fail open — TenantPage.notFound() handles the miss gracefully
    return true;
  }
}

// ── Middleware config ──────────────────────────────────────────────────────────
export const config = {
  matcher: ["/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)"],
};

export default async function proxy(req: NextRequest) {
  const rawHostname = req.headers.get("host") || rootDomain;
  const { pathname } = req.nextUrl;

  // ── Step 1: next-intl locale redirect (must run first) ────────────────────
  const intlResponse = intlMiddleware(req);
  if (intlResponse.status === 307 || intlResponse.status === 308) {
    return intlResponse;
  }

  // ── Step 2: Strip locale prefix for clean path rewriting ──────────────────
  // e.g. /en/dashboard → /dashboard, /ca/about → /about
  const strippedPath = pathname.replace(localePattern, "/") || "/";

  // ── Step 3: Resolve locale from pathname (reliable: we only reach here if
  //    intlMiddleware did not 307/308, meaning the locale prefix is present) ──
  const localeMatch = pathname.match(localePattern);
  const locale = localeMatch?.[1] ?? routing.defaultLocale;

  // ── Step 4: Classify hostname → route to correct app section ──────────────
  // Route groups (marketing), (dashboard), (tenants) are transparent to URLs —
  // Next.js resolves them from the filesystem. Do NOT include them in rewrites.
  const parsed = parseDomain(rawHostname, rootDomain, appDomain);

  // Initialize the base headers wrapper from your localized internationalization response
  const headers = new Headers(intlResponse.headers);

  // ── Step 5: Neon Auth Network Interception (App Subdomain Only) ───────────
  // Protects everything running underneath app.saasofsaass.com (DASHBOARD)
  if (parsed.type === "DASHBOARD") {
    const runAuthMiddleware = neonAuthMiddleware({
      loginUrl: `/${locale}/auth/login`, // Dynamic localized path based on resolved step 3
    });
    const authResponse = await runAuthMiddleware(req);

    if (
      authResponse &&
      (authResponse.status === 307 || authResponse.status === 308)
    ) {
      return authResponse;
    }

    if (authResponse) {
      // Explicitly type value and key as strings to satisfy strict compiler rules
      authResponse.headers.forEach((value: string, key: string) => {
        headers.set(key, value);
      });
    }
  }

  // ── Step 6: Execute Target Path Rewrites ──────────────────────────────────
  switch (parsed.type) {
    case "MARKETING": {
      // Dashboard routes must never be served from the marketing domain.
      // Redirect to the canonical dashboard host, preserving locale and path.
      if (strippedPath !== "/") {
        const isDashboardRoute = DASHBOARD_ROUTE_PREFIXES.some(
          (prefix) => strippedPath === prefix || strippedPath.startsWith(prefix + "/"),
        );
        if (isDashboardRoute) {
          const url = req.nextUrl.clone();
          url.hostname = appDomain;
          url.pathname = `/${locale}${strippedPath}`;
          return NextResponse.redirect(url, { status: 308 });
        }
      }

      const url = req.nextUrl.clone();
      url.pathname = `/${locale}${strippedPath === "/" ? "" : strippedPath}`;
      return NextResponse.rewrite(url, { headers });
    }

    case "DASHBOARD": {
      const url = req.nextUrl.clone();
      // Bare /{locale} has no page — redirect to canonical /{locale}/dashboard.
      if (strippedPath === "/") {
        url.pathname = `/${locale}/dashboard`;
        return NextResponse.redirect(url, { status: 308 });
      }
      url.pathname = `/${locale}${strippedPath}`;
      return NextResponse.rewrite(url, { headers });
    }

    case "TENANT_SUBDOMAIN":
    case "TENANT_CUSTOM": {
      const tenantKey = parsed.tenantKey!;
      const isSubdomain = parsed.type === "TENANT_SUBDOMAIN";

      const exists = await isTenantActive(tenantKey, isSubdomain);
      if (!exists) {
        // Unknown/inactive domain → send to marketing root
        return NextResponse.redirect(TENANT_NOT_FOUND_URL, { status: 302 });
      }

      // Use the normalized hostname as the [domain] route param so
      // params.domain in Server Components always receives the real value.
      const normalizedHost = normalizeHostname(rawHostname);
      const url = req.nextUrl.clone();
      url.pathname = `/${locale}/${normalizedHost}${strippedPath === "/" ? "" : strippedPath}`;
      return NextResponse.rewrite(url, { headers });
    }
  }
}
