import { isTenantIndexable } from '@/5-shared/lib/billing/plans'
import { getPlanForWorkspace } from '@/5-shared/lib/billing/workspace'
import { getVerifiedCustomDomain } from './getVerifiedCustomDomain'
import type { Tenant } from '@/5-shared/lib/db/schema'

export interface TenantSeoBase {
  /** `https://<verified custom domain | requested domain>` — the canonical host. */
  baseUrl: string
  /** True only when the site's SEO toggle is on AND the plan permits indexing. */
  indexable: boolean
}

/**
 * Resolve the canonical base URL and indexability for a tenant's secondary
 * pages (blog / podcast / awards lists and details).
 *
 * Mirrors the gating the tenant homepage already applies in its
 * `generateMetadata`, so every tenant route obeys the same
 * `isTenantIndexable` rule — free sites stay `noindex` regardless of their own
 * SEO toggle — and canonicalizes to the verified custom domain instead of the
 * subdomain, preventing subdomain-vs-custom-domain duplicate content.
 */
export async function getTenantSeoBase(
  tenant: Pick<Tenant, 'id' | 'workspaceId' | 'seoEnabled'>,
  domain: string,
): Promise<TenantSeoBase> {
  const [plan, verifiedCustomDomain] = await Promise.all([
    getPlanForWorkspace(tenant.workspaceId),
    getVerifiedCustomDomain(tenant.id),
  ])

  return {
    baseUrl: `https://${verifiedCustomDomain ?? domain}`,
    indexable: isTenantIndexable(tenant.seoEnabled, plan),
  }
}
