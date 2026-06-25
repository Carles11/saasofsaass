import { db } from '@/5-shared/lib/db'
import { tenantEntities, tenantTranslations } from '@/5-shared/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { SupportedLocaleType } from '@/5-shared/types'
import type {
  EntityKind,
  EntityWithTranslation,
  BlogPostEntity,
  BlogPostPayload,
  PodcastEntity,
  PodcastEpisodePayload,
  AwardItemEntity,
  AwardItemPayload,
  TestimonialEntity,
  TestimonialPayload,
} from '@/5-shared/types/tenants/entities'

/** Maps an entity kind to its typed read model. The runtime WHERE clause
 *  guarantees the row's kind matches, so the cast below is sound. */
export interface PublishedEntityRowByKind {
  blog_post: EntityWithTranslation<BlogPostEntity, BlogPostPayload>
  podcast_episode: EntityWithTranslation<PodcastEntity, PodcastEpisodePayload>
  award_item: EntityWithTranslation<AwardItemEntity, AwardItemPayload>
  testimonial: EntityWithTranslation<TestimonialEntity, TestimonialPayload>
}

export interface GetPublishedEntitiesOptions {
  limit?: number
}

export async function getPublishedEntities<K extends EntityKind>(
  kind: K,
  tenantId: string,
  locale: SupportedLocaleType,
  options: GetPublishedEntitiesOptions = {},
): Promise<PublishedEntityRowByKind[K][]> {
  const { limit = 50 } = options

  const rows = await db
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

  return rows as PublishedEntityRowByKind[K][]
}
