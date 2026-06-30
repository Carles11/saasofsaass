import type { SupportedLocaleType } from '@/5-shared/types'
import type { Tenant } from '@/5-shared/lib/db/schema'
import type { EntityWithTranslation, BlogPostEntity, BlogPostPayload } from '@/5-shared/types/tenants/entities'
import { RichTextRenderer } from '@/5-shared/ui/RichTextRenderer'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

type BlogPostRow = EntityWithTranslation<BlogPostEntity, BlogPostPayload>

interface BlogDetailProps {
  data: BlogPostRow
  locale: SupportedLocaleType
  tenant: Tenant
}

function formatDate(date: Date | string, locale: SupportedLocaleType) {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' })
}

export function BlogDetail({ data, locale }: BlogDetailProps) {
  const { entity, translation } = data
  const payload = translation?.payload ?? ({} as BlogPostPayload)
  const title = payload.title ?? entity.slug ?? entity.id
  const meta = entity.metadata as BlogPostEntity['metadata'] | null

  return (
    <article className="py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <Link
          href={`/${locale}/blog`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>

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

        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-8 pb-6 border-b border-border">
          {entity.publishedAt && (
            <time dateTime={entity.publishedAt.toISOString()}>
              {formatDate(entity.publishedAt, locale)}
            </time>
          )}
          {meta?.author && (
            <span>by {meta.author}</span>
          )}
          {meta?.readingTimeMinutes && (
            <span>{meta.readingTimeMinutes} min read</span>
          )}
        </div>

        {payload.body && (
          /<[a-z][\s\S]*>/i.test(payload.body) ? (
            <RichTextRenderer html={payload.body} />
          ) : (
            <div className="max-w-none leading-relaxed text-foreground [&_p]:mb-4">
              {payload.body.split('\n').map((paragraph, i) =>
                paragraph.trim() ? <p key={i}>{paragraph}</p> : null,
              )}
            </div>
          )
        )}
      </div>
    </article>
  )
}
