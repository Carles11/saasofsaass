import { getEntitiesByBlock } from "@/4-entities/tenant-content";
import { getPlatformTranslations, resolveTranslation } from "@/5-shared/lib/db/platform-translations";
import { htmlToText } from "@/5-shared/lib/strings/slugify";
import { CardCarousel } from "@/5-shared/ui/CardCarousel";
import type { AwardItemWithTranslation } from "@/5-shared/types/tenants/entities";
import Link from "next/link";
import type { BlockProps } from "../../../config/types";

export async function AwardsBlock({ block, config, locale, blockId, t }: BlockProps) {
  const rows = (await getEntitiesByBlock(block.id, locale)) as AwardItemWithTranslation[];
  const maxItems = (config.maxItems as number) ?? 9;
  const viewMode = (config.viewMode as "grid" | "slider") ?? "grid";
  const items = rows.slice(0, maxItems);
  const navT = await getPlatformTranslations("tenant.nav", locale);
  const seeAllLabel = resolveTranslation(navT, "see-all", "See all");
  const heading = t.heading || resolveTranslation(navT, "awards", "Awards");

  if (!rows.length) return null;

  const cards = items.map(({ entity, translation }) => {
    const payload = translation?.payload as { title?: string; description?: string } | null;
    const title = payload?.title ?? entity.slug ?? entity.id;
    const description = htmlToText(payload?.description);
    return (
      <Link
        key={entity.id}
        href={`/${locale}/awards/${entity.slug}`}
        className="flex h-full flex-col overflow-hidden rounded-[var(--radius)] border border-border bg-card transition-shadow hover:shadow-md"
      >
        <div className="relative w-full aspect-[16/10] bg-muted">
          {entity.coverImageUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={entity.coverImageUrl} alt={title} className="h-full w-full object-cover" />
            </>
          ) : (
            <div aria-hidden className="h-full w-full bg-linear-to-br from-primary/25 via-secondary to-muted" />
          )}
        </div>
        <div className="flex flex-col gap-2 p-5">
          <h3 className="text-lg font-semibold text-card-foreground line-clamp-2">{title}</h3>
          {description && <p className="text-sm text-muted-foreground line-clamp-4">{description}</p>}
        </div>
      </Link>
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
              href={`/${locale}/awards`}
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
