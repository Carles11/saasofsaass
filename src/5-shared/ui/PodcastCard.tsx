import type { SupportedLocaleType } from '@/5-shared/types'

export interface PodcastCardProps {
  title: string
  slug: string
  href: string
  description?: string | null
  coverImageUrl?: string | null
  durationSeconds?: number | null
  publishedAt?: Date | string | null
  locale: SupportedLocaleType
  listenLabel?: string
  readMoreLabel?: string
  byLabel?: string
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

export function PodcastCard({
  title,
  description,
  href,
  coverImageUrl,
  durationSeconds,
  publishedAt,
  locale,
  listenLabel,
  readMoreLabel = "Read more",
  byLabel = "by",
}: PodcastCardProps) {
  return (
    <article className="rounded-xs border border-border overflow-hidden hover:shadow-md transition-shadow bg-card flex flex-col">
      {coverImageUrl && (
        <div className="relative w-full h-48 overflow-hidden">
          <img
            src={coverImageUrl}
            alt={title}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <h2 className="font-semibold text-card-foreground line-clamp-2 text-lg">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground line-clamp-3">{description}</p>
        )}
        <div className="mt-auto flex items-center gap-3 text-xs text-muted-foreground pt-2">
          {publishedAt && (
            <time dateTime={typeof publishedAt === 'string' ? publishedAt : publishedAt.toISOString()}>
              {formatDate(publishedAt, locale)}
            </time>
          )}
          {durationSeconds && durationSeconds > 0 && (
            <span className="inline-flex items-center gap-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              {formatDuration(durationSeconds)}
            </span>
          )}
        </div>
        <a
          href={href}
          className="mt-2 inline-block text-sm font-medium text-primary hover:underline"
        >
          {listenLabel ?? 'Listen'} &rarr;
        </a>
      </div>
    </article>
  )
}
