import { getTenantByDomain, getTenantSeoBase } from '@/4-entities/tenant'
import { getPublishedEntities } from '@/4-entities/entity'
import { BlogList } from '@/2-widgets/tenant/BlogList'
import { getPlatformTranslations, resolveTranslation } from '@/5-shared/lib/db/platform-translations'
import type { PageContextTypes, SupportedLocaleType } from '@/5-shared/types'
import type { BlogPostPayload } from '@/5-shared/types/tenants/entities'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

export async function generateBlogListMetadata(
  context: PageContextTypes,
): Promise<Metadata> {
  const { tenant: tenantKey, domain, locale, isSubdomain } = context
  const tenant = await getTenantByDomain({ tenant: tenantKey, domain, isSubdomain })
  if (!tenant) return {}

  const { baseUrl, indexable } = await getTenantSeoBase(tenant, domain)
  const description = `Read the latest articles from ${tenant.name}`

  return {
    title: `Blog | ${tenant.name}`,
    description,
    alternates: {
      canonical: `${baseUrl}/${locale}/blog`,
      languages: Object.fromEntries(
        (tenant.locales ?? ['en']).map((l: string) => [l, `${baseUrl}/${l}/blog`]),
      ),
    },
    openGraph: {
      title: `Blog | ${tenant.name}`,
      description,
      url: `${baseUrl}/${locale}/blog`,
      siteName: tenant.name,
      locale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Blog | ${tenant.name}`,
      description,
    },
    robots: {
      index: indexable,
      follow: indexable,
    },
  }
}

export async function BlogListPage({ context }: { context: PageContextTypes }) {
  const { tenant: tenantKey, domain, locale, isSubdomain } = context
  const tenant = await getTenantByDomain({ tenant: tenantKey, domain, isSubdomain })
  if (!tenant) notFound()

  const [items, navT, { baseUrl, indexable }] = await Promise.all([
    getPublishedEntities('blog_post', tenant.id, locale as SupportedLocaleType, { limit: 50 }),
    getPlatformTranslations('tenant.nav', locale),
    getTenantSeoBase(tenant, domain),
  ])

  return (
    <>
      {indexable && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'CollectionPage',
              name: `Blog | ${tenant.name}`,
              description: `Read the latest articles from ${tenant.name}`,
              url: `${baseUrl}/${locale}/blog`,
              mainEntity: {
                '@type': 'ItemList',
                itemListElement: items.slice(0, 10).map(({ entity, translation }, i) => ({
                  '@type': 'ListItem',
                  position: i + 1,
                  url: `${baseUrl}/${locale}/blog/${entity.slug}`,
                  item: {
                    '@type': 'BlogPosting',
                    headline: (translation?.payload as BlogPostPayload | null)?.title ?? entity.slug ?? entity.id,
                    ...(entity.publishedAt ? { datePublished: entity.publishedAt.toISOString?.() } : {}),
                  },
                })),
              },
            }),
          }}
        />
      )}
      <BlogList
        items={items}
        locale={locale as SupportedLocaleType}
        tenant={tenant}
        heading={resolveTranslation(navT, 'blog', 'Blog')}
        backLabel={resolveTranslation(navT, 'back', 'Back')}
        emptyLabel={resolveTranslation(navT, 'empty', 'Nothing here yet.')}
      />
    </>
  )
}
