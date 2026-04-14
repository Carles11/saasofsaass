import { SupportedLocaleType } from '@/5-shared/types'
import { TenantEntity, TenantTranslation } from '@/5-shared/lib/db/schema'

// ── Kind & status enums ────────────────────────────────────────────────────────
export type EntityKind = 'blog_post' | 'podcast_episode' | 'award_item'
export type EntityStatus = 'draft' | 'published' | 'archived'
export type TranslationStatus = 'pending' | 'translated' | 'failed' | 'locked'

// ── kind-specific metadata (non-translatable, stored in entity.metadata) ──────
export interface BlogPostMeta {
  author?: string
  readingTimeMinutes?: number
}

export interface PodcastEpisodeMeta {
  youtubeId?: string
  durationSeconds?: number
  spotifyUrl?: string
}

export interface AwardItemMeta {
  awardYear?: number
  issuingOrg?: string
  awardUrl?: string
}

export type EntityMeta = BlogPostMeta | PodcastEpisodeMeta | AwardItemMeta

// ── Translation payload shapes (stored in translation.payload) ─────────────────
export interface BlogPostPayload {
  title: string
  excerpt?: string
  body?: string
  localizedSlug?: string
}

export interface PodcastEpisodePayload {
  title: string
  description?: string
  localizedSlug?: string
}

export interface AwardItemPayload {
  title: string
  description?: string
}

export type TranslationPayload = BlogPostPayload | PodcastEpisodePayload | AwardItemPayload

// ── Typed entity helpers ───────────────────────────────────────────────────────

/** TenantEntity with its metadata cast to the correct shape for its kind */
export type TypedTenantEntity<TKind extends EntityKind, TMeta extends EntityMeta> =
  Omit<TenantEntity, 'kind' | 'metadata'> & {
    kind: TKind
    metadata: TMeta
  }

export type BlogPostEntity   = TypedTenantEntity<'blog_post', BlogPostMeta>
export type PodcastEntity    = TypedTenantEntity<'podcast_episode', PodcastEpisodeMeta>
export type AwardItemEntity  = TypedTenantEntity<'award_item', AwardItemMeta>

/** TenantTranslation with its payload cast to the correct shape */
export type TypedTranslation<TPayload extends TranslationPayload> =
  Omit<TenantTranslation, 'payload' | 'translationStatus' | 'locale'> & {
    locale: SupportedLocaleType
    payload: TPayload
    translationStatus: TranslationStatus
  }

// ── Composed read model (used by entity APIs and BlockRenderer) ────────────────
export interface EntityWithTranslation<TEntity extends TenantEntity, TPayload extends TranslationPayload> {
  entity: TEntity
  /** null when no translation exists for the requested locale — caller must apply fallback */
  translation: (Omit<TenantTranslation, 'payload' | 'translationStatus'> & {
    payload: TPayload
    translationStatus: TranslationStatus
  }) | null
}

export type BlogPostWithTranslation   = EntityWithTranslation<BlogPostEntity, BlogPostPayload>
export type PodcastWithTranslation    = EntityWithTranslation<PodcastEntity, PodcastEpisodePayload>
export type AwardItemWithTranslation  = EntityWithTranslation<AwardItemEntity, AwardItemPayload>
