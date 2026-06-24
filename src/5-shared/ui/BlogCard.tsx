import type { SupportedLocaleType } from '@/5-shared/types'

export interface BlogCardProps {
  title: string
  slug: string
  href: string
  excerpt?: string | null
  coverImageUrl?: string | null
  author?: string | null
  publishedAt?: Date | string | null
  locale: SupportedLocaleType
}

function formatDate(date: Date | string, locale: SupportedLocaleType) {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' })
}

export function BlogCard({
  title,
  excerpt,
  href,
  coverImageUrl,
  author,
  publishedAt,
  locale,
}: BlogCardProps) {
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
        <h2 className="font-semibold text-card-foreground line-clamp-2">{title}</h2>
        {excerpt && (
          <p className="text-sm text-muted-foreground line-clamp-3">{excerpt}</p>
        )}
        <div className="mt-auto flex items-center gap-2 text-xs text-muted-foreground pt-2">
          {publishedAt && (
            <time dateTime={typeof publishedAt === 'string' ? publishedAt : publishedAt.toISOString()}>
              {formatDate(publishedAt, locale)}
            </time>
          )}
          {author && (
            <span className="truncate">by {author}</span>
          )}
        </div>
        <a
          href={href}
          className="mt-2 inline-block text-sm font-medium hover:underline"
          style={{ color: 'hsl(var(--primary))' }}
        >
          Read more &rarr;
        </a>
      </div>
    </article>
  )
}
