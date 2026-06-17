import { db } from '@/5-shared/lib/db'
import { tenants, tenantDomains } from '@/5-shared/lib/db/schema'
import { eq, and } from 'drizzle-orm'

interface LookupParams {
  tenant: string
  domain: string
  isSubdomain: boolean
}

export async function getTenantByDomain({ tenant, domain, isSubdomain }: LookupParams) {
  if (isSubdomain) {
    const result = await db
      .select()
      .from(tenants)
      .where(eq(tenants.slug, tenant))
      .limit(1)
    return result[0] ?? null
  }

  // Custom domain: resolve via tenantDomains (status = verified)
  const [domainRow] = await db
    .select({ tenantId: tenantDomains.tenantId })
    .from(tenantDomains)
    .where(
      and(
        eq(tenantDomains.domain, domain),
        eq(tenantDomains.status, 'verified'),
      ),
    )
    .limit(1)

  if (!domainRow) return null

  const [t] = await db
    .select()
    .from(tenants)
    .where(eq(tenants.id, domainRow.tenantId))
    .limit(1)

  return t ?? null
}
