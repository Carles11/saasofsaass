/**
 * Domain Parser — Pure utility, safe for edge runtime & server components.
 * Single source of truth for hostname classification across middleware,
 * server params, and dashboard UI.
 */

export type DomainType =
  | 'MARKETING'         // saasofsaass.com / localhost
  | 'DASHBOARD'         // app.saasofsaass.com / app.localhost
  | 'TENANT_SUBDOMAIN'  // slug.saasofsaass.com
  | 'TENANT_CUSTOM'     // any other hostname (custom domain)

export interface ParsedDomain {
  type: DomainType
  /**
   * TENANT_SUBDOMAIN → slug only (e.g. "acme")
   * TENANT_CUSTOM    → full normalized hostname (e.g. "agora.org")
   * MARKETING / DASHBOARD → null
   */
  tenantKey: string | null
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** Normalize a raw hostname: lowercase, strip port. */
export function normalizeHostname(rawHostname: string): string {
  return rawHostname.toLowerCase().trim().replace(/:\d+$/, '')
}

/**
 * Classify a hostname into one of the four domain types.
 *
 * @param rawHostname  – value from the `Host` header (may include port)
 * @param rootDomain   – e.g. "saasofsaass.com"
 * @param appDomain    – e.g. "app.saasofsaass.com"
 * @param devRootDomain – optional secondary root for local dev (e.g. "lvh.me")
 */
export function parseDomain(
  rawHostname: string,
  rootDomain: string,
  appDomain: string,
  devRootDomain?: string
): ParsedDomain {
  const hostname = normalizeHostname(rawHostname)
  const root = rootDomain.toLowerCase()
  const app  = appDomain.toLowerCase()

  // ── Dashboard ──────────────────────────────────────────────────────────────
  if (hostname === app || hostname === 'app.localhost') {
    return { type: 'DASHBOARD', tenantKey: null }
  }

  // ── Marketing (apex root) ──────────────────────────────────────────────────
  if (hostname === root || hostname === 'localhost') {
    return { type: 'MARKETING', tenantKey: null }
  }

  // ── Dev tenant subdomain: <slug>.localhost ─────────────────────────────────
  // Handles local dev where devRootDomain may not cover bare 'localhost' subdomains.
  const localhostSubMatch = hostname.match(/^([a-z0-9][a-z0-9-]{0,61}[a-z0-9]?)\.localhost$/)
  if (localhostSubMatch) {
    return { type: 'TENANT_SUBDOMAIN', tenantKey: localhostSubMatch[1] }
  }

  // ── Production tenant subdomain: <slug>.saasofsaass.com ───────────────────
  // Allows single-label subdomains only (no nested: app.acme.saasofsaass.com)
  const subdomainPattern = new RegExp(
    `^([a-z0-9][a-z0-9-]{0,61}[a-z0-9]?)\\.${escapeRegex(root)}$`
  )
  const prodMatch = hostname.match(subdomainPattern)
  if (prodMatch) {
    return { type: 'TENANT_SUBDOMAIN', tenantKey: prodMatch[1] }
  }

  // ── Dev tenant subdomain: <slug>.lvh.me (or custom devRootDomain) ─────────
  if (devRootDomain) {
    const devRoot = devRootDomain.toLowerCase()
    const devPattern = new RegExp(
      `^([a-z0-9][a-z0-9-]{0,61}[a-z0-9]?)\\.${escapeRegex(devRoot)}$`
    )
    const devMatch = hostname.match(devPattern)
    if (devMatch) {
      return { type: 'TENANT_SUBDOMAIN', tenantKey: devMatch[1] }
    }
  }

  // ── Custom domain: anything else ───────────────────────────────────────────
  return { type: 'TENANT_CUSTOM', tenantKey: hostname }
}
