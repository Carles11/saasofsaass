import { getEntitiesByBlock } from "@/4-entities/tenant-content";
import type { AwardItemWithTranslation } from "@/5-shared/types/tenants/entities";
import type { BlockProps } from "../../../config/types";

export async function AwardsBlock({ block, locale, blockId }: BlockProps) {
  const rows = (await getEntitiesByBlock(block.id, locale)) as AwardItemWithTranslation[];

  if (!rows.length) {
    return (
      <section id={blockId} className="py-16 px-6 text-center">
        <h2 className="text-xl font-bold mb-2">Awards</h2>
        <p className="text-muted-foreground text-sm">No awards to display yet.</p>
      </section>
    );
  }

  return (
    <section id={blockId} className="py-16 px-6">
      <h2 className="text-xl font-bold mb-6 text-center">Awards</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {rows.map(({ entity, translation }) => {
          const payload = translation?.payload as { title?: string; description?: string } | null;
          const title = payload?.title ?? entity.slug ?? entity.id;
          const description = payload?.description;
          return (
            <article
              key={entity.id}
              className="rounded-lg border border-border overflow-hidden hover:shadow-md transition-shadow bg-card p-4 flex flex-col gap-2"
            >
              <h3 className="font-semibold text-card-foreground line-clamp-2 text-lg">{title}</h3>
              {description && <p className="text-sm text-muted-foreground line-clamp-3">{description}</p>}
            </article>
          );
        })}
      </div>
    </section>
  );
}
