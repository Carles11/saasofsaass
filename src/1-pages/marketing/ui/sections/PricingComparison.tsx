import { Check, Minus } from "lucide-react";
import { PLAN_ORDER, PLANS, type PlanId } from "@/5-shared/lib/billing/plans";
import { COMPARISON_ROWS } from "@/5-shared/lib/billing/pricing-content";
import { resolveTranslation, type TranslationDict } from "@/5-shared/lib/translations/resolve";

interface PricingComparisonProps {
  translations?: TranslationDict;
}

/**
 * Full feature-comparison table. Server-rendered for SEO/GEO legibility — every
 * row is real, crawlable text derived from PLANS (no client JS, no fabrication).
 */
export function PricingComparison({ translations }: PricingComparisonProps) {
  const heading = resolveTranslation(
    translations,
    "compare.heading",
    "Compare all features",
  );
  const featureCol = resolveTranslation(translations, "compare.feature-col", "Feature");

  return (
    <section className="px-6 py-20 md:py-28">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground text-center mb-10">
          {heading}
        </h2>

        <div className="overflow-x-auto rounded-2xl border border-border/60">
          <table className="w-full text-sm">
            <caption className="sr-only">{heading}</caption>
            <thead>
              <tr className="border-b border-border/60 bg-muted/40">
                <th scope="col" className="px-4 py-3 text-left font-medium text-muted-foreground">
                  {featureCol}
                </th>
                {PLAN_ORDER.map((id) => (
                  <th
                    key={id}
                    scope="col"
                    className="px-4 py-3 text-center font-semibold text-foreground"
                  >
                    {PLANS[id].label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row) => (
                <tr key={row.labelKey} className="border-b border-border/40 last:border-0">
                  <th scope="row" className="px-4 py-3 text-left font-normal text-muted-foreground">
                    {resolveTranslation(translations, row.labelKey, row.fallback)}
                  </th>
                  {PLAN_ORDER.map((id: PlanId) => {
                    const v = row.value(id);
                    return (
                      <td key={id} className="px-4 py-3 text-center text-foreground">
                        {typeof v === "boolean" ? (
                          v ? (
                            <Check className="mx-auto h-4 w-4 text-primary" aria-label="Included" />
                          ) : (
                            <Minus className="mx-auto h-4 w-4 text-muted-foreground/50" aria-label="Not included" />
                          )
                        ) : (
                          v
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
