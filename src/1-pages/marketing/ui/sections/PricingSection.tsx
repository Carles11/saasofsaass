import { resolveTranslation, type TranslationDict } from "@/5-shared/lib/translations/resolve";
import { PLAN_DESCRIPTIONS, buildPricingTiers } from "@/5-shared/lib/billing/pricing-content";
import type { PlanId } from "@/5-shared/lib/billing/plans";
import { getStripePrices } from "@/5-shared/lib/billing/prices";
import { appAuthUrl } from "@/5-shared/lib/auth/auth-urls";
import { PricingCards } from "./PricingCards";

interface PricingSectionProps {
  translations?: TranslationDict;
  locale?: string;
  currency?: string;
}

export async function PricingSection({ translations, locale, currency }: PricingSectionProps) {
  const prices = await getStripePrices(currency);

  const badge = resolveTranslation(translations, "badge", "Pricing");
  const title = resolveTranslation(translations, "title", "Plans that grow with your practice.");
  const subtitle = resolveTranslation(
    translations,
    "subtitle",
    "Start free — every plan includes a custom domain. Paid plans add search-engine visibility and more published sites.",
  );

  const tiers = buildPricingTiers(
    prices,
    (id: PlanId) =>
      resolveTranslation(translations, `tier.${id}.description`, PLAN_DESCRIPTIONS[id] ?? ""),
    () => appAuthUrl("sign-up", locale ?? "en"),
  );

  const labels = {
    popular: resolveTranslation(translations, "popular-badge", "Most Popular"),
    perMonth: resolveTranslation(translations, "month", "/month"),
    billedAnnually: resolveTranslation(translations, "billed-annually", "/year"),
    monthly: resolveTranslation(translations, "cadence.monthly", "Monthly"),
    annual: resolveTranslation(translations, "cadence.annual", "Annual"),
    save: resolveTranslation(translations, "cadence.save", "(2 months free)"),
    getStarted: resolveTranslation(translations, "cta.short", "Get started"),
  };

  return (
    <section id="pricing" className="px-6 py-24 md:py-32 bg-muted/30">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">{badge}</p>
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">{title}</h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto leading-relaxed">{subtitle}</p>
        </div>

        <PricingCards tiers={tiers} labels={labels} locale={locale ?? "en"} />
      </div>
    </section>
  );
}
