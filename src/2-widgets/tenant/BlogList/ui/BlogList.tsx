import { BlogCard } from '@/5-shared/ui/BlogCard'
import type { SupportedLocaleType } from '@/5-shared/types'
import type { Tenant } from '@/5-shared/lib/db/schema'
import type { EntityWithTranslation, BlogPostEntity, BlogPostPayload } from '@/5-shared/types/tenants/entities'

type BlogPostRow = EntityWithTranslation<BlogPostEntity, BlogPostPayload>

interface BlogListProps {
  items: BlogPostRow[]
  locale: SupportedLocaleType
  tenant: Tenant
}

export function BlogList({ items, locale, tenant }: BlogListProps) {
  if (items.length === 0) {
    return (
      <section className="py-16 px-6 text-center">
        <h1 className="text-3xl font-bold text-foreground mb-4">Blog</h1>
        <p className="text-muted-foreground">No posts published yet.</p>
      </section>
    )
  }

  return (
    <section className="py-16 px-6">
      <h1 className="text-3xl font-bold text-foreground mb-8 max-w-6xl mx-auto px-1">
        Blog
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {items.map(({ entity, translation }) => {
          const payload = translation?.payload ?? ({} as BlogPostPayload)
          const title = payload.title ?? entity.slug ?? entity.id
          const slug = payload.localizedSlug ?? entity.slug
          const meta = entity.metadata as BlogPostEntity['metadata'] | null

          return (
            <BlogCard
              key={entity.id}
              title={title}
              slug={slug ?? ''}
              href={`/blog/${slug}`}
              excerpt={payload.excerpt}
              coverImageUrl={entity.coverImageUrl}
              author={meta?.author}
              publishedAt={entity.publishedAt}
              locale={locale}
            />
          )
        })}
      </div>
    </section>
  )
}
