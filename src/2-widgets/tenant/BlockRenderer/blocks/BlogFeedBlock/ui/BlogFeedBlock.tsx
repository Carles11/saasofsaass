import { getEntitiesByBlock } from "@/4-entities/tenant-content";
import { BlogCard } from "@/5-shared/ui/BlogCard";
import type { BlockProps } from "../../../config/types";
import type { BlogPostEntity, BlogPostPayload } from "@/5-shared/types/tenants/entities";

interface BlogFeedConfig {
  maxItems?: number;
  archivePath?: string;
}

export async function BlogFeedBlock({ block, config, locale, blockId }: BlockProps) {
  const { maxItems = 9, archivePath = "/blog" } = config as BlogFeedConfig;
  const rows = await getEntitiesByBlock(block.id, locale);
  const items = rows.slice(0, maxItems);

  if (items.length === 0) {
    return (
      <section id={blockId} className="py-16 px-6 text-center">
        <p className="text-muted-foreground text-sm">No posts published yet.</p>
      </section>
    );
  }

  return (
    <section id={blockId} className="py-16 px-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {items.map(({ entity, translation }) => {
          const payload = translation?.payload as BlogPostPayload | null;
          const title = payload?.title ?? entity.slug ?? entity.id;
          const slug = payload?.localizedSlug ?? entity.slug;
          const meta = entity.metadata as BlogPostEntity['metadata'] | null;

          return (
            <BlogCard
              key={entity.id}
              title={title}
              slug={slug ?? ""}
              href={`/blog/${slug}`}
              excerpt={payload?.excerpt}
              coverImageUrl={entity.coverImageUrl}
              author={meta?.author}
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
            View all posts &rarr;
          </a>
        </div>
      )}
    </section>
  );
}
