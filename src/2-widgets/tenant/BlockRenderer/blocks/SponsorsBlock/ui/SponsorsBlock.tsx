import { getEntitiesByBlock } from "@/4-entities/tenant-content";
import { getPlatformTranslations, resolveTranslation } from "@/5-shared/lib/db/platform-translations";
import type { SponsorWithTranslation } from "@/5-shared/types/tenants/entities";
import type { BlockProps } from "../../../config/types";

const TYPE_ORDER = ["sponsor", "collaborator", "partner", "media", "supporter"] as const;
const TYPE_KEYS: Record<string, string> = {
  sponsor: "sponsor.sponsors",
  collaborator: "sponsor.collaborators",
  partner: "sponsor.partners",
  media: "sponsor.media-partners",
  supporter: "sponsor.supporters",
};

function groupByType(
  rows: SponsorWithTranslation[],
): [string, SponsorWithTranslation[]][] {
  const groups = new Map<string, SponsorWithTranslation[]>();
  for (const row of rows) {
    const meta = row.entity.metadata as { type?: string; url?: string } | null;
    const type = meta?.type ?? "sponsor";
    if (!groups.has(type)) groups.set(type, []);
    groups.get(type)!.push(row);
  }
  return TYPE_ORDER
    .filter((t) => groups.has(t))
    .map((t) => [t, groups.get(t)!]);
}

export async function SponsorsBlock({ block, locale, blockId, t }: BlockProps) {
  const rows = (await getEntitiesByBlock(block.id, locale)) as SponsorWithTranslation[];
  const blocksT = await getPlatformTranslations("tenant.blocks", locale);
  const sponsorLabels: Record<string, string> = {};
  for (const typeKey of TYPE_ORDER) {
    const seedKey = TYPE_KEYS[typeKey];
    sponsorLabels[typeKey] = resolveTranslation(blocksT, seedKey, typeKey);
  }
  const emptyCtaLabel = resolveTranslation(blocksT, "sponsor.empty-cta", "Want to support us?");
  const emptyContactLabel = resolveTranslation(blocksT, "sponsor.empty-contact", "Get in touch");

  if (!rows.length) return null;
  const heading = t.heading;

  const grouped = groupByType(rows);

  return (
    <section id={blockId} className="py-20 sm:py-28 px-6 bg-secondary/30">
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

        {grouped.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center">
            {emptyCtaLabel}{" "}
            <a
              href="#contact"
              className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
            >
              {emptyContactLabel}
            </a>
          </p>
        ) : (
          <div className="flex flex-col gap-14">
            {grouped.map(([typeKey, items]) => {
              const sectionLabel = sponsorLabels[typeKey] ?? typeKey;
              return (
                <div key={typeKey}>
                  <h3 className="text-sm font-semibold text-center text-muted-foreground mb-8 uppercase tracking-widest">
                    {sectionLabel}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center justify-items-center">
                    {items.map(({ entity, translation }) => {
                      const meta = entity.metadata as {
                        type?: string;
                        url?: string;
                      } | null;
                      const name =
                        (translation?.payload as { title?: string } | null)
                          ?.title ?? entity.slug ?? entity.id;
                      const logo = entity.coverImageUrl;
                      const sponsorUrl = meta?.url;

                      const img = logo ? (
                        <img
                          src={logo}
                          alt={name}
                          className="max-h-16 w-auto grayscale hover:grayscale-0 transition-all duration-300"
                        />
                      ) : (
                        <span className="text-lg font-semibold text-muted-foreground">
                          {name}
                        </span>
                      );

                      return (
                        <figure
                          key={entity.id}
                          className="flex flex-col items-center gap-2 group"
                        >
                          {sponsorUrl ? (
                            <a
                              href={sponsorUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center h-20 w-32 p-2 rounded-[var(--radius)] border border-border bg-card hover:shadow-md transition-shadow"
                            >
                              {img}
                            </a>
                          ) : (
                            <div className="flex items-center justify-center h-20 w-32 p-2 rounded-[var(--radius)] border border-border bg-card">
                              {img}
                            </div>
                          )}
                          <figcaption className="text-xs text-muted-foreground text-center opacity-0 group-hover:opacity-100 transition-opacity">
                            {name}
                          </figcaption>
                        </figure>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
