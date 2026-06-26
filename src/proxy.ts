import createIntlMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";

import { neonAuthMiddleware } from "@neondatabase/auth/next/server";
import { neon } from "@neondatabase/serverless";
import { routing } from "./5-shared/lib/i18n/routing";
import {
  normalizeHostname,
  parseDomain,
} from "./5-shared/lib/next/domain-parser";
import { tenantCache, type TenantState } from "./5-shared/lib/next/tenant-cache";
import { SIDEBAR_TABS } from "./5-shared/config/sidebar-tabs";

// ── Constants — resolved once per worker instance ──────────────────────────────
const rootDomain = (
  process.env.NEXT_PUBLIC_ROOT_DOMAIN || "saasofsaass.com"
).toLowerCase();
const appDomain = (
  process.env.NEXT_PUBLIC_APP_DOMAIN || `app.${rootDomain}`
).toLowerCase();
const TENANT_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// Dashboard route prefixes derived from the canonical sidebar-tabs config.
// Used to enforce domain isolation — these routes are only valid on DASHBOARD host.
const DASHBOARD_ROUTE_PREFIXES = SIDEBAR_TABS.map((tab) => tab.href);

// Edge-compatible Neon HTTP client (instantiated once, reused across requests)
const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;

const intlMiddleware = createIntlMiddleware(routing);
const localePattern = new RegExp(`^/(${routing.locales.join("|")})(/|$)`);

// ── Tenant resolution with cache ────────────────────────────────────────────────
// Returns the host's state so the proxy can serve the site (published), or rewrite
// to the localized "site unavailable" page for draft (unpublished) vs unknown
// (missing) hosts. Custom domains are never "missing" — an unverified custom
// domain is treated as "unpublished".
async function resolveTenantState(
  tenantKey: string,
  isSubdomain: boolean,
): Promise<TenantState> {
  const cacheKey = isSubdomain ? `slug:${tenantKey}` : `domain:${tenantKey}`;
  const cached = await tenantCache.get(cacheKey);
  if (cached !== null) return cached.state;

  if (!sql) return "published"; // No DB configured — let the page handle it

  try {
    // neon driver requires tagged template literals — use separate queries per lookup type
    let state: TenantState;
    if (isSubdomain) {
      const rows = await sql`SELECT status FROM tenants WHERE slug = ${tenantKey} LIMIT 1`;
      state =
        rows.length === 0
          ? "missing"
          : rows[0].status === "published"
            ? "published"
            : "unpublished";
    } else {
      const rows = await sql`SELECT td.tenant_id FROM tenant_domains td WHERE td.domain = ${tenantKey} AND td.status = 'verified' LIMIT 1`;
      state = rows.length > 0 ? "published" : "unpublished";
    }
    await tenantCache.set(cacheKey, { state }, TENANT_CACHE_TTL_MS);
    return state;
  } catch {
    // DB error: fail open — serve the tenant route, which notFound()s gracefully.
    return "published";
  }
}

// ── Middleware config ──────────────────────────────────────────────────────────
export const config = {
  matcher: ["/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+|.*\\.[a-z0-9]{2,5}$).*)"],
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
    // Auth pages are publicly accessible — skip the middleware so /auth/sign-in,
    // /auth/sign-up etc. don't get redirected to loginUrl before they can render.
    const isAuthPath = strippedPath === "/auth" || strippedPath.startsWith("/auth/");

    if (!isAuthPath) {
      const runAuthMiddleware = neonAuthMiddleware({
        loginUrl: `/${locale}/auth/sign-in`,
      });
      const authResponse = await runAuthMiddleware(req);

      if (
        authResponse &&
        (authResponse.status === 307 || authResponse.status === 308)
      ) {
        return authResponse;
      }

      if (authResponse) {
        authResponse.headers.forEach((value: string, key: string) => {
          headers.set(key, value);
        });
      }
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

      const state = await resolveTenantState(tenantKey, isSubdomain);
      if (state !== "published") {
        // Draft or unknown host → rewrite (URL stays on the subdomain) to the
        // localized status page. "missing" returns 404; "unpublished" returns 200.
        const url = req.nextUrl.clone();
        url.pathname = `/${locale}/site-unavailable`;
        url.search = "";
        url.searchParams.set("reason", state === "missing" ? "missing" : "draft");
        url.searchParams.set("slug", tenantKey);
        return NextResponse.rewrite(url, {
          status: state === "missing" ? 404 : 200,
          headers,
        });
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
