import { getEntitiesByBlock } from "@/4-entities/tenant-content";
import { PodcastCard } from "@/5-shared/ui/PodcastCard";
import type { BlockProps } from "../../../config/types";
import type { PodcastEntity, PodcastEpisodePayload } from "@/5-shared/types/tenants/entities";

interface PodcastFeedConfig {
  maxItems?: number;
  archivePath?: string;
}

export async function PodcastFeedBlock({ block, config, locale, blockId }: BlockProps) {
  const { maxItems = 9, archivePath = "/podcast" } = config as PodcastFeedConfig;
  const rows = await getEntitiesByBlock(block.id, locale);
  const items = rows.slice(0, maxItems);

  if (items.length === 0) {
    return (
      <section id={blockId} className="py-16 px-6 text-center">
        <h2 className="text-xl font-bold mb-2">Podcast Feed</h2>
        <p className="text-muted-foreground text-sm">
          No podcast episodes published yet.
        </p>
      </section>
    );
  }

  return (
    <section id={blockId} className="py-16 px-6">
      <h2 className="text-xl font-bold mb-6 text-center">Podcast Feed</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {rows.map(({ entity, translation }) => {
          const payload = translation?.payload as PodcastEpisodePayload | null;
          const title = payload?.title ?? entity.slug ?? entity.id;
          const slug = payload?.localizedSlug ?? entity.slug;
          const meta = entity.metadata as PodcastEntity['metadata'] | null;

          return (
            <PodcastCard
              key={entity.id}
              title={title}
              slug={slug ?? ""}
              href={`/podcast/${slug}`}
              description={payload?.description}
              coverImageUrl={entity.coverImageUrl}
              durationSeconds={meta?.durationSeconds}
              publishedAt={entity.publishedAt}
              locale={locale}
            />
          );
        })}
      </div>
      {rows.length > maxItems && (
        <div className="mt-8 text-center">
          <a
            href={archivePath}
            className="inline-block text-sm font-medium hover:underline px-4 py-2 rounded-xs transition-colors"
            style={{ color: "hsl(var(--primary))" }}
          >
            View all episodes &rarr;
          </a>
        </div>
      )}
    </section>
  );
}
