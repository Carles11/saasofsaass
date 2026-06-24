import { getTenantByDomain } from '@/4-entities/tenant'
import { getEntityBySlug } from '@/4-entities/entity'
import { BlogDetail } from '@/2-widgets/tenant/BlogList'
import type { PageContextTypes, SupportedLocaleType } from '@/5-shared/types'
import type { BlogPostEntity, BlogPostPayload } from '@/5-shared/types/tenants/entities'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

interface BlogDetailParams {
  context: PageContextTypes
  slug: string
}

export async function generateBlogDetailMetadata({
  context,
  slug,
}: BlogDetailParams): Promise<Metadata> {
  const { tenant: tenantKey, domain, locale, isSubdomain } = context
  const tenant = await getTenantByDomain({ tenant: tenantKey, domain, isSubdomain })
  if (!tenant) return {}

  const row = await getEntityBySlug(
    'blog_post',
    tenant.id,
    slug,
    locale as SupportedLocaleType,
  )
  if (!row) return {}

  const { entity, translation } = row
  const payload = translation?.payload as BlogPostPayload | null
  const meta = entity.metadata as BlogPostEntity['metadata'] | null
  const title = payload?.title ?? entity.slug ?? entity.id
  const description = payload?.excerpt ?? `Read ${title} on ${tenant.name}`
  const baseUrl = `https://${domain}`

  return {
    title: `${title} | Blog | ${tenant.name}`,
    description,
    alternates: {
      canonical: `${baseUrl}/${locale}/blog/${slug}`,
      languages: Object.fromEntries(
        (tenant.locales ?? ['en']).map((l: string) => [l, `${baseUrl}/${l}/blog/${slug}`]),
      ),
    },
    openGraph: {
      title: `${title} | Blog | ${tenant.name}`,
      description,
      url: `${baseUrl}/${locale}/blog/${slug}`,
      siteName: tenant.name,
      locale,
      type: 'article',
      ...(entity.coverImageUrl ? { images: [{ url: entity.coverImageUrl }] } : {}),
      publishedTime: entity.publishedAt?.toISOString?.() ?? undefined,
      modifiedTime: entity.updatedAt?.toISOString?.() ?? undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | Blog | ${tenant.name}`,
      description,
      ...(entity.coverImageUrl ? { images: [entity.coverImageUrl] } : {}),
    },
    robots: {
      index: tenant.seoEnabled !== false,
      follow: tenant.seoEnabled !== false,
    },
    other: {
      'article:published_time': entity.publishedAt?.toISOString?.() ?? '',
      'article:modified_time': entity.updatedAt?.toISOString?.() ?? '',
      ...(meta?.author ? { 'article:author': meta.author } : {}),
    },
  }
}

export async function BlogDetailPage({ context, slug }: BlogDetailParams) {
  const { tenant: tenantKey, domain, locale, isSubdomain } = context
  const tenant = await getTenantByDomain({ tenant: tenantKey, domain, isSubdomain })
  if (!tenant) notFound()

  const row = await getEntityBySlug(
    'blog_post',
    tenant.id,
    slug,
    locale as SupportedLocaleType,
  )
  if (!row) notFound()

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: (row.translation?.payload as BlogPostPayload | null)?.title ?? row.entity.slug,
            description: (row.translation?.payload as BlogPostPayload | null)?.excerpt ?? '',
            image: row.entity.coverImageUrl,
            author: {
              '@type': 'Person',
              name: (row.entity.metadata as BlogPostEntity['metadata'] | null)?.author ?? tenant.name,
            },
            datePublished: row.entity.publishedAt?.toISOString?.() ?? undefined,
            dateModified: row.entity.updatedAt?.toISOString?.() ?? undefined,
            publisher: {
              '@type': 'Organization',
              name: tenant.name,
              url: `https://${domain}`,
            },
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': `https://${domain}/${locale}/blog/${slug}`,
            },
            articleBody: (row.translation?.payload as BlogPostPayload | null)?.body ?? '',
          }),
        }}
      />
      <BlogDetail data={row} locale={locale as SupportedLocaleType} tenant={tenant} />
    </>
  )
}
