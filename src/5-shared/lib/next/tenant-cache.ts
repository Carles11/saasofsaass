/**
 * Tenant resolution cache — adapter interface with in-process TTL default.
 *
 * Swap the exported `tenantCache` to an Edge Config / Upstash Redis
 * implementation without touching the middleware or any call sites.
 */

/** Resolution state of a tenant host: published (serve it), unpublished
 * (exists but draft), or missing (no such tenant). */
export type TenantState = 'published' | 'unpublished' | 'missing'

/** Cached resolution result. `tenantId` is null for missing hosts and
 * unverified custom domains; it lets the proxy bind a preview token to the
 * exact tenant being visited. */
export interface TenantCacheValue {
  state: TenantState
  tenantId: string | null
}

export interface TenantCacheAdapter {
  get(key: string): Promise<TenantCacheValue | null>
  set(key: string, value: TenantCacheValue, ttlMs: number): Promise<void>
  delete(key: string): Promise<void>
}

// ── Default: in-process Map (per edge-worker instance) ────────────────────────
// TTL is enforced lazily on read. This is a best-effort cache; a fresh worker
// instance begins with an empty store and will query Neon once per unique key.

interface Entry {
  state: TenantState
  tenantId: string | null
  expiresAt: number
}

const store = new Map<string, Entry>()

export const inMemoryCache: TenantCacheAdapter = {
  async get(key) {
    const entry = store.get(key)
    if (!entry) return null
    if (Date.now() > entry.expiresAt) {
      store.delete(key)
      return null
    }
    return { state: entry.state, tenantId: entry.tenantId }
  },
  async set(key, value, ttlMs) {
    store.set(key, { ...value, expiresAt: Date.now() + ttlMs })
  },
  async delete(key) {
    store.delete(key)
  },
}

/**
 * Active adapter. To switch backends:
 *   export const tenantCache: TenantCacheAdapter = upstashAdapter
 */
export const tenantCache: TenantCacheAdapter = inMemoryCache
