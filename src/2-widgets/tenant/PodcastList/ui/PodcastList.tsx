import { PodcastCard } from '@/5-shared/ui/PodcastCard'
import type { SupportedLocaleType } from '@/5-shared/types'
import type { Tenant } from '@/5-shared/lib/db/schema'
import type { EntityWithTranslation, PodcastEntity, PodcastEpisodePayload } from '@/5-shared/types/tenants/entities'

type PodcastRow = EntityWithTranslation<PodcastEntity, PodcastEpisodePayload>

interface PodcastListProps {
  items: PodcastRow[]
  locale: SupportedLocaleType
  tenant: Tenant
}

export function PodcastList({ items, locale, tenant }: PodcastListProps) {
  if (items.length === 0) {
    return (
      <section className="py-16 px-6 text-center">
        <h1 className="text-3xl font-bold text-foreground mb-4">Podcast</h1>
        <p className="text-muted-foreground">No episodes published yet.</p>
      </section>
    )
  }

  return (
    <section className="py-16 px-6">
      <h1 className="text-3xl font-bold text-foreground mb-8 max-w-6xl mx-auto px-1">
        Podcast
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {items.map(({ entity, translation }) => {
          const payload = translation?.payload ?? ({} as PodcastEpisodePayload)
          const title = payload.title ?? entity.slug ?? entity.id
          const slug = payload.localizedSlug ?? entity.slug
          const meta = entity.metadata as PodcastEntity['metadata'] | null

          return (
            <PodcastCard
              key={entity.id}
              title={title}
              slug={slug ?? ''}
              href={`/podcast/${slug}`}
              description={payload.description}
              coverImageUrl={entity.coverImageUrl}
              durationSeconds={meta?.durationSeconds}
              publishedAt={entity.publishedAt}
              locale={locale}
            />
          )
        })}
      </div>
    </section>
  )
}
