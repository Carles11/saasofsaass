import type { SupportedLocaleType } from "@/5-shared/types";
import type { Tenant } from "@/5-shared/lib/db/schema";
import type { AwardItemWithTranslation } from "@/5-shared/types/tenants/entities";
import { htmlToText } from "@/5-shared/lib/strings/slugify";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface AwardsListProps {
  items: AwardItemWithTranslation[];
  locale: SupportedLocaleType;
  tenant: Tenant;
  heading?: string;
  backLabel?: string;
  emptyLabel?: string;
}

export function AwardsList({ items, locale, heading, backLabel, emptyLabel }: AwardsListProps) {
  return (
    <section className="py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <Link
          href={`/${locale}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          {backLabel ?? "Back"}
        </Link>

        <h1
          className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-8"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {heading ?? "Awards"}
        </h1>

        {items.length === 0 ? (
          <p className="text-muted-foreground">{emptyLabel ?? "Nothing here yet."}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map(({ entity, translation }) => {
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
                    <h2 className="text-lg font-semibold text-card-foreground line-clamp-2">{title}</h2>
                    {description && <p className="text-sm text-muted-foreground line-clamp-4">{description}</p>}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
