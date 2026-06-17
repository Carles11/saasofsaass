/**
 * Tenant resolution cache — adapter interface with in-process TTL default.
 *
 * Swap the exported `tenantCache` to an Edge Config / Upstash Redis
 * implementation without touching the middleware or any call sites.
 */

export interface TenantCacheAdapter {
  get(key: string): Promise<{ exists: boolean } | null>
  set(key: string, value: { exists: boolean }, ttlMs: number): Promise<void>
  delete(key: string): Promise<void>
}

// ── Default: in-process Map (per edge-worker instance) ────────────────────────
// TTL is enforced lazily on read. This is a best-effort cache; a fresh worker
// instance begins with an empty store and will query Neon once per unique key.

interface Entry {
  exists: boolean
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
    return { exists: entry.exists }
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
