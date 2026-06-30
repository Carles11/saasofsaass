import { SupportedLocaleType } from '@/5-shared/types'
import { TenantEntity, TenantTranslation } from '@/5-shared/lib/db/schema'

// ── Kind & status enums ────────────────────────────────────────────────────────
export type EntityKind = 'blog_post' | 'podcast_episode' | 'award_item' | 'testimonial' | 'sponsor'
export type EntityStatus = 'draft' | 'published' | 'archived'
export type TranslationStatus = 'pending' | 'translated' | 'failed' | 'locked'

// ── kind-specific metadata (non-translatable, stored in entity.metadata) ──────
export interface BlogPostMeta {
  author?: string
  readingTimeMinutes?: number
}

export interface PodcastEpisodeMeta {
  /** Primary media URL (YouTube, Vimeo, Spotify, direct audio, …). */
  url?: string
  youtubeId?: string
  durationSeconds?: number
  spotifyUrl?: string
}

export interface AwardItemMeta {
  awardYear?: number
  issuingOrg?: string
  awardUrl?: string
}

export interface TestimonialMeta {
  authorRole?: string
  rating?: number
}

export interface SponsorMeta {
  type: 'sponsor' | 'collaborator' | 'partner' | 'media' | 'supporter'
  url?: string
}

export type EntityMeta = BlogPostMeta | PodcastEpisodeMeta | AwardItemMeta | TestimonialMeta | SponsorMeta

// ── Translation payload shapes (stored in translation.payload) ─────────────────
export interface BlogPostPayload {
  title: string
  excerpt?: string
  body?: string
}

export interface PodcastEpisodePayload {
  title: string
  description?: string
}

export interface AwardItemPayload {
  title: string
  description?: string
}

export interface TestimonialPayload {
  title: string
  quote?: string
}

export interface SponsorPayload {
  title: string
  description?: string
}

export type TranslationPayload = BlogPostPayload | PodcastEpisodePayload | AwardItemPayload | TestimonialPayload | SponsorPayload

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
export type TestimonialEntity  = TypedTenantEntity<'testimonial', TestimonialMeta>
export type SponsorEntity      = TypedTenantEntity<'sponsor', SponsorMeta>

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
export type TestimonialWithTranslation  = EntityWithTranslation<TestimonialEntity, TestimonialPayload>
export type SponsorWithTranslation      = EntityWithTranslation<SponsorEntity, SponsorPayload>
