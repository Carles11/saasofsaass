import { getEntitiesByBlock } from "@/4-entities/tenant-content";
import type { BlockProps } from "../../../config/types";

interface BlogFeedConfig {
  maxItems?: number;
}

export async function BlogFeedBlock({ block, config, locale }: BlockProps) {
  const { maxItems = 9 } = config as BlogFeedConfig;
  const rows = await getEntitiesByBlock(block.id, locale);
  const items = rows.slice(0, maxItems);

  if (items.length === 0) {
    return (
      <section className="py-16 px-6 text-center">
        <p className="text-muted-foreground text-sm">No posts published yet.</p>
      </section>
    );
  }

  return (
    <section className="py-16 px-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {items.map(({ entity, translation }) => {
          const payload = translation?.payload as {
            title?: string;
            excerpt?: string;
            localizedSlug?: string;
          } | null;
          const title = payload?.title ?? entity.slug ?? entity.id;
          const excerpt = payload?.excerpt;
          const slug = payload?.localizedSlug ?? entity.slug;

          return (
            <article
              key={entity.id}
              className="rounded-lg border border-border overflow-hidden hover:shadow-md transition-shadow"
            >
              {entity.coverImageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={entity.coverImageUrl}
                  alt={title}
                  loading="lazy"
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <h2 className="font-semibold text-card-foreground line-clamp-2">{title}</h2>
                {excerpt && <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{excerpt}</p>}
                {slug && (
                  <a
                    href={`/blog/${slug}`}
                    className="mt-3 inline-block text-sm font-medium hover:underline"
                    style={{ color: "hsl(var(--primary))" }}
                  >
                    Read more →
                  </a>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
