import { db } from '@/5-shared/lib/db'
import { tenantEntities, tenantTranslations } from '@/5-shared/lib/db/schema'
import { eq, and, asc } from 'drizzle-orm'
import { SupportedLocaleType } from '@/5-shared/types'
import { EntityKind } from '@/5-shared/types/tenants/entities'

interface GetEntitiesByTenantOptions {
  tenantId: string
  locale: SupportedLocaleType
  /** Optionally filter by a single kind */
  kind?: EntityKind
  /** Pass null or omit to return all statuses (dashboard). Default is 'published' for public pages. */
  status?: 'draft' | 'published' | 'archived' | null
}

/**
 * Fetch entities for a tenant with their translations.
 * Used by the dashboard (all statuses) and the public site (published only).
 * Single bounded JOIN — no N+1.
 */
export async function getEntitiesByTenant({
  tenantId,
  locale,
  kind,
  status,
}: GetEntitiesByTenantOptions) {
  const conditions = [eq(tenantEntities.tenantId, tenantId)]
  if (kind)   conditions.push(eq(tenantEntities.kind, kind))
  if (status != null) conditions.push(eq(tenantEntities.status, status))

  return db
    .select({
      entity:      tenantEntities,
      translation: tenantTranslations,
    })
    .from(tenantEntities)
    .leftJoin(
      tenantTranslations,
      and(
        eq(tenantTranslations.entityId, tenantEntities.id),
        eq(tenantTranslations.locale, locale)
      )
    )
    .where(and(...conditions))
    .orderBy(asc(tenantEntities.order))
}
