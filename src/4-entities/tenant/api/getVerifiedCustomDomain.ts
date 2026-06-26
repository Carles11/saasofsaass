import { db } from '@/5-shared/lib/db'
import { tenantDomains } from '@/5-shared/lib/db/schema'
import { and, eq } from 'drizzle-orm'

/**
 * The tenant's verified custom domain (the apex — www is a Vercel redirect, not a
 * stored row), or null if none is verified. Used to canonicalize SEO to the
 * tenant's primary domain so the subdomain doesn't compete as duplicate content.
 */
export async function getVerifiedCustomDomain(tenantId: string): Promise<string | null> {
  const [row] = await db
    .select({ domain: tenantDomains.domain })
    .from(tenantDomains)
    .where(and(eq(tenantDomains.tenantId, tenantId), eq(tenantDomains.status, 'verified')))
    .limit(1)
  return row?.domain ?? null
}
