import { getEntitiesByBlock } from "@/4-entities/tenant-content";
import type { TestimonialWithTranslation } from "@/5-shared/types/tenants/entities";
import type { BlockProps } from "../../../config/types";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          className={`h-4 w-4 ${i < rating ? "text-yellow-500" : "text-muted-foreground/30"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export async function TestimonialsBlock({ block, locale, blockId, t }: BlockProps) {
  const rows = (await getEntitiesByBlock(block.id, locale)) as TestimonialWithTranslation[];

  const heading = t.heading;

  if (!rows.length && !heading) return null;

  const emptyText = t.emptyState || "No testimonials to display yet.";

  return (
    <section id={blockId} className="py-16 px-6">
      {heading && (
        <h2 className="text-xl font-bold mb-6 text-center">{heading}</h2>
      )}

      {rows.length === 0 ? (
        <p className="text-muted-foreground text-sm text-center">{emptyText}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {rows.map(({ entity, translation }) => {
            const payload = translation?.payload as { title?: string; quote?: string } | null;
            const meta = entity.metadata as { authorRole?: string; rating?: number } | null;
            const quote = payload?.quote;
            const author = payload?.title ?? entity.slug ?? entity.id;
            const role = meta?.authorRole;
            const rating = meta?.rating;

            return (
              <article
                key={entity.id}
                className="rounded-lg border border-border overflow-hidden hover:shadow-md transition-shadow bg-card p-5 flex flex-col gap-3"
              >
                {rating != null && rating > 0 && (
                  <StarRating rating={Math.min(Math.max(Math.round(rating), 0), 5)} />
                )}

                {quote && (
                  <blockquote className="text-sm text-card-foreground leading-relaxed italic line-clamp-4">
                    &ldquo;{quote}&rdquo;
                  </blockquote>
                )}

                <footer className="mt-auto pt-2 border-t border-border/50">
                  <div className="flex flex-col">
                    <cite className="not-italic font-semibold text-sm text-card-foreground">
                      {author}
                    </cite>
                    {role && (
                      <span className="text-xs text-muted-foreground">{role}</span>
                    )}
                  </div>
                </footer>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
