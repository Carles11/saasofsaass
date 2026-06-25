import type { SupportedLocaleType } from '@/5-shared/types'
import type { Tenant } from '@/5-shared/lib/db/schema'
import type { EntityWithTranslation, PodcastEntity, PodcastEpisodePayload } from '@/5-shared/types/tenants/entities'

type PodcastRow = EntityWithTranslation<PodcastEntity, PodcastEpisodePayload>

interface PodcastDetailProps {
  data: PodcastRow
  locale: SupportedLocaleType
  tenant: Tenant
}

function formatDate(date: Date | string, locale: SupportedLocaleType) {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' })
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  if (m >= 60) {
    const h = Math.floor(m / 60)
    return `${h}h ${m % 60}m`
  }
  return `${m}m${s > 0 ? ` ${s}s` : ''}`
}

export function PodcastDetail({ data, locale }: PodcastDetailProps) {
  const { entity, translation } = data
  const payload = translation?.payload ?? ({} as PodcastEpisodePayload)
  const title = payload.title ?? entity.slug ?? entity.id
  const meta = entity.metadata as PodcastEntity['metadata'] | null

  return (
    <article className="py-16 px-6">
      <div className="max-w-3xl mx-auto">
        {entity.coverImageUrl && (
          <div className="relative w-full aspect-[2/1] mb-8 overflow-hidden rounded-xs">
            <img
              src={entity.coverImageUrl}
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
          {title}
        </h1>

        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-6 pb-6 border-b border-border">
          {entity.publishedAt && (
            <time dateTime={entity.publishedAt.toISOString()}>
              {formatDate(entity.publishedAt, locale)}
            </time>
          )}
          {meta?.durationSeconds && meta.durationSeconds > 0 && (
            <span>{formatDuration(meta.durationSeconds)}</span>
          )}
        </div>

        {payload.description && (
          <p className="text-base text-foreground leading-relaxed mb-6">
            {payload.description}
          </p>
        )}

        {(meta?.spotifyUrl || meta?.youtubeId) && (
          <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t border-border">
            {meta?.spotifyUrl && (
              <a
                href={meta.spotifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xs text-sm font-medium transition-colors"
                style={{ backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                </svg>
                Listen on Spotify
              </a>
            )}
            {meta?.youtubeId && (
              <a
                href={`https://www.youtube.com/watch?v=${meta.youtubeId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xs text-sm font-medium transition-colors"
                style={{ backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                Watch on YouTube
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  )
}
