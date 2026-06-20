import { NextRequest, NextResponse } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'
import { neon } from '@neondatabase/serverless'
import { routing } from './5-shared/lib/i18n/routing'
import { parseDomain, normalizeHostname } from './5-shared/lib/next/domain-parser'
import { tenantCache } from './5-shared/lib/next/tenant-cache'

// ── Constants — resolved once per worker instance ──────────────────────────────
const rootDomain   = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'saasofsaass.com').toLowerCase()
const appDomain    = (process.env.NEXT_PUBLIC_APP_DOMAIN  || `app.${rootDomain}`).toLowerCase()
const TENANT_NOT_FOUND_URL = `https://${rootDomain}`
const TENANT_CACHE_TTL_MS  = 5 * 60 * 1000 // 5 minutes

// Edge-compatible Neon HTTP client (instantiated once, reused across requests)
const sql = process.env.DATABASE_URL
  ? neon(process.env.DATABASE_URL)
  : null

const intlMiddleware = createIntlMiddleware(routing)

const localePattern = new RegExp(`^/(${routing.locales.join('|')})(/|$)`)

// ── Tenant existence check with cache ──────────────────────────────────────────
async function isTenantActive(
  tenantKey: string,
  isSubdomain: boolean
): Promise<boolean> {
  const cached = await tenantCache.get(tenantKey)
  if (cached !== null) return cached.exists

  if (!sql) return true // No DB configured — let the page handle it

  try {
    // neon driver requires tagged template literals
    const rows = isSubdomain
      ? await sql`SELECT id FROM tenants WHERE slug   = ${tenantKey} AND is_active = true LIMIT 1`
      : await sql`
          SELECT t.id
          FROM tenants t
          LEFT JOIN tenant_domains td ON td.tenant_id = t.id
          WHERE t.is_active = true
            AND (t.domain = ${tenantKey} OR (td.domain = ${tenantKey} AND td.status = 'verified'))
          LIMIT 1
        `
    const exists = rows.length > 0
    await tenantCache.set(tenantKey, { exists }, TENANT_CACHE_TTL_MS)
    return exists
  } catch {
    // DB error: fail open — TenantPage.notFound() handles the miss gracefully
    return true
  }
}

// ── Middleware config ──────────────────────────────────────────────────────────
export const config = {
  matcher: ['/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)'],
}

export default async function middleware(req: NextRequest) {
  const rawHostname = req.headers.get('host') || rootDomain
  const { pathname } = req.nextUrl

  // ── Step 1: next-intl locale redirect (must run first) ────────────────────
  const intlResponse = intlMiddleware(req)
  if (intlResponse.status === 307 || intlResponse.status === 308) {
    return intlResponse
  }

  // ── Step 2: Strip locale prefix for clean path rewriting ──────────────────
  // e.g. /en/dashboard → /dashboard, /ca/about → /about
  const strippedPath = pathname.replace(localePattern, '/') || '/'
  const headers = intlResponse.headers

  // ── Step 3: Resolve locale from pathname (reliable: we only reach here if
  //    intlMiddleware did not 307/308, meaning the locale prefix is present) ──
  const localeMatch = pathname.match(localePattern)
  const locale = localeMatch?.[1] ?? routing.defaultLocale

  // ── Step 4: Classify hostname → route to correct app section ──────────────
  // Route groups (marketing), (dashboard), (tenants) are transparent to URLs —
  // Next.js resolves them from the filesystem. Do NOT include them in rewrites.
  const parsed = parseDomain(rawHostname, rootDomain, appDomain)

  switch (parsed.type) {
    case 'MARKETING': {
      const url = req.nextUrl.clone()
      url.pathname = `/${locale}${strippedPath === '/' ? '' : strippedPath}`
      return NextResponse.rewrite(url, { headers })
    }

    case 'DASHBOARD': {
      const url = req.nextUrl.clone()
      // Bare root '/' has no page — dashboard home lives at /{locale}/dashboard.
      // All other sub-paths (e.g. /dashboard/site-builder/123) pass through as-is.
      url.pathname = `/${locale}${strippedPath === '/' ? '/dashboard' : strippedPath}`
      return NextResponse.rewrite(url, { headers })
    }

    case 'TENANT_SUBDOMAIN':
    case 'TENANT_CUSTOM': {
      const tenantKey  = parsed.tenantKey!
      const isSubdomain = parsed.type === 'TENANT_SUBDOMAIN'

      const exists = await isTenantActive(tenantKey, isSubdomain)
      if (!exists) {
        // Unknown/inactive domain → send to marketing root
        return NextResponse.redirect(TENANT_NOT_FOUND_URL, { status: 302 })
      }

      // Use the normalized hostname as the [domain] route param so
      // params.domain in Server Components always receives the real value.
      const normalizedHost = normalizeHostname(rawHostname)
      const url = req.nextUrl.clone()
      url.pathname = `/${locale}/${normalizedHost}${strippedPath === '/' ? '' : strippedPath}`
      return NextResponse.rewrite(url, { headers })
    }
  }
}