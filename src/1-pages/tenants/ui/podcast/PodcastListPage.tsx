import { getTenantByDomain, getTenantSeoBase } from '@/4-entities/tenant'
import { getPublishedEntities } from '@/4-entities/entity'
import { PodcastList } from '@/2-widgets/tenant/PodcastList'
import { getPlatformTranslations, resolveTranslation } from '@/5-shared/lib/db/platform-translations'
import type { PageContextTypes, SupportedLocaleType } from '@/5-shared/types'
import type { PodcastEpisodePayload } from '@/5-shared/types/tenants/entities'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

export async function generatePodcastListMetadata(
  context: PageContextTypes,
): Promise<Metadata> {
  const { tenant: tenantKey, domain, locale, isSubdomain } = context
  const tenant = await getTenantByDomain({ tenant: tenantKey, domain, isSubdomain })
  if (!tenant) return {}

  const { baseUrl, indexable } = await getTenantSeoBase(tenant, domain)
  const description = `Listen to the latest episodes from ${tenant.name}`

  return {
    title: `Podcast | ${tenant.name}`,
    description,
    alternates: {
      canonical: `${baseUrl}/${locale}/podcast`,
      languages: Object.fromEntries(
        (tenant.locales ?? ['en']).map((l: string) => [l, `${baseUrl}/${l}/podcast`]),
      ),
    },
    openGraph: {
      title: `Podcast | ${tenant.name}`,
      description,
      url: `${baseUrl}/${locale}/podcast`,
      siteName: tenant.name,
      locale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Podcast | ${tenant.name}`,
      description,
    },
    robots: {
      index: indexable,
      follow: indexable,
    },
  }
}

export async function PodcastListPage({ context }: { context: PageContextTypes }) {
  const { tenant: tenantKey, domain, locale, isSubdomain } = context
  const tenant = await getTenantByDomain({ tenant: tenantKey, domain, isSubdomain })
  if (!tenant) notFound()

  const [items, navT, { baseUrl, indexable }] = await Promise.all([
    getPublishedEntities('podcast_episode', tenant.id, locale as SupportedLocaleType, { limit: 50 }),
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
              name: `Podcast | ${tenant.name}`,
              description: `Listen to the latest episodes from ${tenant.name}`,
              url: `${baseUrl}/${locale}/podcast`,
              mainEntity: {
                '@type': 'ItemList',
                itemListElement: items.slice(0, 10).map(({ entity, translation }, i) => ({
                  '@type': 'ListItem',
                  position: i + 1,
                  url: `${baseUrl}/${locale}/podcast/${entity.slug}`,
                  item: {
                    '@type': 'PodcastEpisode',
                    name: (translation?.payload as PodcastEpisodePayload | null)?.title ?? entity.slug ?? entity.id,
                    ...(entity.publishedAt ? { datePublished: entity.publishedAt.toISOString?.() } : {}),
                  },
                })),
              },
            }),
          }}
        />
      )}
      <PodcastList
        items={items}
        locale={locale as SupportedLocaleType}
        tenant={tenant}
        heading={resolveTranslation(navT, 'podcast', 'Podcast')}
        backLabel={resolveTranslation(navT, 'back', 'Back')}
        emptyLabel={resolveTranslation(navT, 'empty', 'Nothing here yet.')}
        listenLabel={resolveTranslation(navT, 'listen', 'Listen')}
      />
    </>
  )
}
