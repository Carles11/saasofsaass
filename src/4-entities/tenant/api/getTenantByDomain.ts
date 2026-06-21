import { db } from '@/5-shared/lib/db'
import { tenants, tenantDomains } from '@/5-shared/lib/db/schema'
import { eq, or, and } from 'drizzle-orm'

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

  const result = await db
    .select()
    .from(tenants)
    .leftJoin(tenantDomains, eq(tenantDomains.tenantId, tenants.id))
    .where(
      or(
        eq(tenants.domain, domain),
        and(eq(tenantDomains.domain, domain), eq(tenantDomains.status, 'verified')),
      ),
    )
    .limit(1)

  return result[0]?.tenants ?? null
}
