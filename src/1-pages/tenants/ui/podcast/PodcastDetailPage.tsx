import { getTenantByDomain, getTenantSeoBase } from '@/4-entities/tenant'
import { getEntityBySlug } from '@/4-entities/entity'
import { PodcastDetail } from '@/2-widgets/tenant/PodcastList'
import { getPlatformTranslations, resolveTranslation } from '@/5-shared/lib/db/platform-translations'
import type { PageContextTypes, SupportedLocaleType } from '@/5-shared/types'
import type { PodcastEntity, PodcastEpisodePayload } from '@/5-shared/types/tenants/entities'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

interface PodcastDetailParams {
  context: PageContextTypes
  slug: string
}

export async function generatePodcastDetailMetadata({
  context,
  slug,
}: PodcastDetailParams): Promise<Metadata> {
  const { tenant: tenantKey, domain, locale, isSubdomain } = context
  const tenant = await getTenantByDomain({ tenant: tenantKey, domain, isSubdomain })
  if (!tenant) return {}

  const row = await getEntityBySlug(
    'podcast_episode',
    tenant.id,
    slug,
    locale as SupportedLocaleType,
  )
  if (!row) return {}

  const { entity, translation } = row
  const payload = translation?.payload as PodcastEpisodePayload | null
  const meta = entity.metadata as PodcastEntity['metadata'] | null
  const title = payload?.title ?? entity.slug ?? entity.id
  const description = payload?.description ?? `Listen to ${title} on ${tenant.name}`
  const { baseUrl, indexable } = await getTenantSeoBase(tenant, domain)

  return {
    title: `${title} | Podcast | ${tenant.name}`,
    description,
    alternates: {
      canonical: `${baseUrl}/${locale}/podcast/${slug}`,
      languages: Object.fromEntries(
        (tenant.locales ?? ['en']).map((l: string) => [l, `${baseUrl}/${l}/podcast/${slug}`]),
      ),
    },
    openGraph: {
      title: `${title} | Podcast | ${tenant.name}`,
      description,
      url: `${baseUrl}/${locale}/podcast/${slug}`,
      siteName: tenant.name,
      locale,
      type: 'article',
      ...(entity.coverImageUrl ? { images: [{ url: entity.coverImageUrl }] } : {}),
      publishedTime: entity.publishedAt?.toISOString?.() ?? undefined,
      modifiedTime: entity.updatedAt?.toISOString?.() ?? undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | Podcast | ${tenant.name}`,
      description,
      ...(entity.coverImageUrl ? { images: [entity.coverImageUrl] } : {}),
    },
    robots: {
      index: indexable,
      follow: indexable,
    },
    other: {
      'article:published_time': entity.publishedAt?.toISOString?.() ?? '',
    },
  }
}

export async function PodcastDetailPage({ context, slug }: PodcastDetailParams) {
  const { tenant: tenantKey, domain, locale, isSubdomain } = context
  const tenant = await getTenantByDomain({ tenant: tenantKey, domain, isSubdomain })
  if (!tenant) notFound()

  const row = await getEntityBySlug(
    'podcast_episode',
    tenant.id,
    slug,
    locale as SupportedLocaleType,
  )
  if (!row) notFound()

  const meta = row.entity.metadata as PodcastEntity['metadata'] | null
  const [navT, { baseUrl, indexable }] = await Promise.all([
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
              '@type': 'PodcastEpisode',
              name: (row.translation?.payload as PodcastEpisodePayload | null)?.title ?? row.entity.slug,
              description: (row.translation?.payload as PodcastEpisodePayload | null)?.description ?? '',
              image: row.entity.coverImageUrl,
              timeRequired: meta?.durationSeconds ? `PT${meta.durationSeconds}S` : undefined,
              datePublished: row.entity.publishedAt?.toISOString?.() ?? undefined,
              associatedMedia: meta?.spotifyUrl
                ? { '@type': 'MediaObject', contentUrl: meta.spotifyUrl }
                : undefined,
              partOfSeries: {
                '@type': 'PodcastSeries',
                name: `${tenant.name} Podcast`,
                url: `${baseUrl}/${locale}/podcast`,
              },
            }),
          }}
        />
      )}
      <PodcastDetail
        data={row}
        locale={locale as SupportedLocaleType}
        tenant={tenant}
        backLabel={resolveTranslation(navT, 'back', 'Back')}
        listenLabel={resolveTranslation(navT, 'listen', 'Listen')}
      />
    </>
  )
}
