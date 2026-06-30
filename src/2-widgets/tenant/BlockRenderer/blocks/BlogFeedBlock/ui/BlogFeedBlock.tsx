import { getEntitiesByBlock } from "@/4-entities/tenant-content";
import { getPlatformTranslations, resolveTranslation } from "@/5-shared/lib/db/platform-translations";
import { BlogCard } from "@/5-shared/ui/BlogCard";
import { CardCarousel } from "@/5-shared/ui/CardCarousel";
import Link from "next/link";
import type { BlockProps } from "../../../config/types";
import type { BlogPostEntity, BlogPostPayload } from "@/5-shared/types/tenants/entities";

interface BlogFeedConfig {
  maxItems?: number;
  viewMode?: "grid" | "slider";
}

export async function BlogFeedBlock({ block, config, locale, blockId, t }: BlockProps) {
  const { maxItems = 9, viewMode = "grid" } = config as BlogFeedConfig;
  const rows = await getEntitiesByBlock(block.id, locale);
  const items = rows.slice(0, maxItems);
  const navT = await getPlatformTranslations("tenant.nav", locale);
  const seeAllLabel = resolveTranslation(navT, "see-all", "See all");
  const heading = t.heading || resolveTranslation(navT, "blog", "Blog");

  if (items.length === 0) return null;

  const cards = items.map(({ entity, translation }) => {
    const payload = translation?.payload as BlogPostPayload | null;
    const title = payload?.title ?? entity.slug ?? entity.id;
    const slug = entity.slug;
    const meta = entity.metadata as BlogPostEntity["metadata"] | null;
    return (
      <BlogCard
        key={entity.id}
        title={title}
        slug={slug ?? ""}
        href={`/${locale}/blog/${slug}`}
        excerpt={payload?.excerpt}
        coverImageUrl={entity.coverImageUrl}
        author={meta?.author}
        publishedAt={entity.publishedAt}
        locale={locale}
      />
    );
  });

  return (
    <section id={blockId} className="py-20 sm:py-28 px-6">
      <div className="max-w-6xl mx-auto">
        {heading && (
          <div className="flex flex-col items-center text-center mb-12">
            <span aria-hidden className="block h-1 w-12 rounded-full bg-primary mb-6" />
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {heading}
            </h2>
          </div>
        )}

        {viewMode === "slider" && items.length > 1 ? (
          <CardCarousel>{cards}</CardCarousel>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">{cards}</div>
        )}

        {rows.length > maxItems && (
          <div className="mt-10 text-center">
            <Link
              href={`/${locale}/blog`}
              className="inline-block text-sm font-medium text-primary hover:underline"
            >
              {seeAllLabel} &rarr;
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
