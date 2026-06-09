import { getEntitiesByBlock } from "@/4-entities/tenant-content";
import type { AwardItemWithTranslation } from "@/5-shared/types/tenants/entities";
import type { BlockProps } from "../../../config/types";

export async function AwardsBlock({ block, locale }: BlockProps) {
  const rows = (await getEntitiesByBlock(block.id, locale)) as AwardItemWithTranslation[];

  if (!rows.length) {
    return (
      <section className="py-16 px-6 text-center">
        <h2 className="text-xl font-bold mb-2">Awards</h2>
        <p className="text-zinc-400 text-sm">No awards to display yet.</p>
      </section>
    );
  }

  return (
    <section className="py-16 px-6">
      <h2 className="text-xl font-bold mb-6 text-center">Awards</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {rows.map(({ entity, translation }) => {
          const payload = translation?.payload as { title?: string; description?: string } | null;
          const title = payload?.title ?? entity.slug ?? entity.id;
          const description = payload?.description;
          return (
            <article
              key={entity.id}
              className="rounded-lg border border-zinc-200 overflow-hidden hover:shadow-md transition-shadow bg-white p-4 flex flex-col gap-2"
            >
              <h3 className="font-semibold text-zinc-900 line-clamp-2 text-lg">{title}</h3>
              {description && <p className="text-sm text-zinc-500 line-clamp-3">{description}</p>}
            </article>
          );
        })}
      </div>
    </section>
  );
}
