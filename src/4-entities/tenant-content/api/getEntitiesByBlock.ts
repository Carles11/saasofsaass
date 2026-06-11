import { db } from '@/5-shared/lib/db'
import { tenantEntities, tenantTranslations } from '@/5-shared/lib/db/schema'
import { eq, and, asc } from 'drizzle-orm'
import { SupportedLocaleType } from '@/5-shared/types'

/**
 * Fetch all published entities for a given block, with their translation
 * for the requested locale. A single JOIN — no N+1.
 *
 * Returns entities even when no translation row exists yet (LEFT JOIN),
 * so callers can apply the configured fallback chain.
 */
export async function getEntitiesByBlock(blockId: string, locale: SupportedLocaleType) {
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
    .where(
      and(
        eq(tenantEntities.blockId, blockId),
        eq(tenantEntities.status, 'published')
      )
    )
    .orderBy(asc(tenantEntities.order))
}
