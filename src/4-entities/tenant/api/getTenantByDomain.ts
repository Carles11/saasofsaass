import { db } from '@/5-shared/lib/db'
import { tenants } from '@/5-shared/lib/db/schema'
import { eq } from 'drizzle-orm'

interface LookupParams {
  tenant: string
  domain: string
  isSubdomain: boolean
}

export async function getTenantByDomain({ tenant, domain, isSubdomain }: LookupParams) {
  const condition = isSubdomain
    ? eq(tenants.slug, tenant)
    : eq(tenants.domain, domain)

  const result = await db
    .select()
    .from(tenants)
    .where(condition)
    .limit(1)

  return result[0] ?? null
}
