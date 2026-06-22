import { getEntitiesByBlock } from "@/4-entities/tenant-content";
import type { PodcastWithTranslation } from "@/5-shared/types/tenants/entities";
import type { BlockProps } from "../../../config/types";

export async function PodcastFeedBlock({ block, locale }: BlockProps) {
  const rows = (await getEntitiesByBlock(
    block.id,
    locale,
  )) as PodcastWithTranslation[];

  if (!rows.length) {
    return (
      <section className="py-16 px-6 text-center">
        <h2 className="text-xl font-bold mb-2">Podcast Feed</h2>
        <p className="text-muted-foreground text-sm">
          No podcast episodes published yet.
        </p>
      </section>
    );
  }

  return (
    <section className="py-16 px-6">
      <h2 className="text-xl font-bold mb-6 text-center">Podcast Feed</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {rows.map(({ entity, translation }) => {
          const payload = translation?.payload as {
            title?: string;
            description?: string;
            localizedSlug?: string;
          } | null;
          const title = payload?.title ?? entity.slug ?? entity.id;
          const description = payload?.description;
          const slug = payload?.localizedSlug ?? entity.slug;
          return (
            <article
              key={entity.id}
              className="rounded-xs border border-border overflow-hidden hover:shadow-md transition-shadow bg-card p-4 flex flex-col gap-2"
            >
              <h3 className="font-semibold text-card-foreground line-clamp-2 text-lg">
                {title}
              </h3>
              {description && (
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {description}
                </p>
              )}
              {slug && (
                <a
                  href={`/podcast/${slug}`}
                  className="mt-3 inline-block text-sm font-medium hover:underline"
                  style={{ color: "hsl(var(--primary))" }}
                >
                  Listen →
                </a>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
