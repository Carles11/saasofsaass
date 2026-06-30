import { BlogCard } from '@/5-shared/ui/BlogCard'
import type { SupportedLocaleType } from '@/5-shared/types'
import type { Tenant } from '@/5-shared/lib/db/schema'
import type { EntityWithTranslation, BlogPostEntity, BlogPostPayload } from '@/5-shared/types/tenants/entities'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

type BlogPostRow = EntityWithTranslation<BlogPostEntity, BlogPostPayload>

interface BlogListProps {
  items: BlogPostRow[]
  locale: SupportedLocaleType
  tenant: Tenant
  heading?: string
  backLabel?: string
  emptyLabel?: string
}

export function BlogList({ items, locale, heading, backLabel, emptyLabel }: BlogListProps) {
  return (
    <section className="py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <Link
          href={`/${locale}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          {backLabel ?? 'Back'}
        </Link>

        <h1
          className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-8"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          {heading ?? 'Blog'}
        </h1>

        {items.length === 0 ? (
          <p className="text-muted-foreground">{emptyLabel ?? 'Nothing here yet.'}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map(({ entity, translation }) => {
              const payload = translation?.payload ?? ({} as BlogPostPayload)
              const title = payload.title ?? entity.slug ?? entity.id
              const slug = entity.slug
              const meta = entity.metadata as BlogPostEntity['metadata'] | null

              return (
                <BlogCard
                  key={entity.id}
                  title={title}
                  slug={slug ?? ''}
                  href={`/${locale}/blog/${slug}`}
                  excerpt={payload.excerpt}
                  coverImageUrl={entity.coverImageUrl}
                  author={meta?.author}
                  publishedAt={entity.publishedAt}
                  locale={locale}
                />
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
