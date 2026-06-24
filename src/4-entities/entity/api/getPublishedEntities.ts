import { db } from '@/5-shared/lib/db'
import { tenantEntities, tenantTranslations } from '@/5-shared/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { SupportedLocaleType } from '@/5-shared/types'
import { EntityKind } from '@/5-shared/types/tenants/entities'

export interface GetPublishedEntitiesOptions {
  limit?: number
}

export async function getPublishedEntities(
  kind: EntityKind,
  tenantId: string,
  locale: SupportedLocaleType,
  options: GetPublishedEntitiesOptions = {},
) {
  const { limit = 50 } = options

  return db
    .select({
      entity: tenantEntities,
      translation: tenantTranslations,
    })
    .from(tenantEntities)
    .leftJoin(
      tenantTranslations,
      and(
        eq(tenantTranslations.entityId, tenantEntities.id),
        eq(tenantTranslations.locale, locale),
      ),
    )
    .where(
      and(
        eq(tenantEntities.kind, kind),
        eq(tenantEntities.tenantId, tenantId),
        eq(tenantEntities.status, 'published'),
      ),
    )
    .orderBy(desc(tenantEntities.publishedAt))
    .limit(limit)
}
