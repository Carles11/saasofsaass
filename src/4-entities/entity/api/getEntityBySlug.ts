import { db } from '@/5-shared/lib/db'
import { tenantEntities, tenantTranslations } from '@/5-shared/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { SupportedLocaleType } from '@/5-shared/types'
import type { EntityKind } from '@/5-shared/types/tenants/entities'
import type { PublishedEntityRowByKind } from './getPublishedEntities'

export async function getEntityBySlug<K extends EntityKind>(
  kind: K,
  tenantId: string,
  slug: string,
  locale: SupportedLocaleType,
): Promise<PublishedEntityRowByKind[K] | null> {
  const [row] = await db
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
        eq(tenantEntities.slug, slug),
        eq(tenantEntities.status, 'published'),
      ),
    )
    .limit(1)

  return (row ?? null) as PublishedEntityRowByKind[K] | null
}
