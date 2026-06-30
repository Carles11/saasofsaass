import { MarketingHeader } from "./sections/MarketingHeader";
import { CtaSection } from "./sections/CtaSection";
import { FooterSection } from "./sections/FooterSection";
import { PricingCheckoutCards } from "./sections/PricingCheckoutCards";
import { PricingComparison } from "./sections/PricingComparison";
import { PricingJsonLd } from "./sections/PricingJsonLd";
import { getPlatformTranslationsByNamespaces } from "@/5-shared/lib/db/platform-translations";
import { getLocale } from "next-intl/server";
import { detectCountry } from "@/5-shared/lib/geo/detect";
import { countryToCurrency } from "@/5-shared/lib/geo/currency";
import { getStripePrices } from "@/5-shared/lib/billing/prices";
import { buildPricingTiers, PLAN_DESCRIPTIONS } from "@/5-shared/lib/billing/pricing-content";
import type { PlanId } from "@/5-shared/lib/billing/plans";
import { appAuthUrl } from "@/5-shared/lib/auth/auth-urls";
import { resolveTranslation } from "@/5-shared/lib/translations/resolve";

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "saasofsaass.com";

export async function PricingPage({ ccOverride }: { ccOverride?: string }) {
  const locale = await getLocale();
  const country = await detectCountry(ccOverride ?? null);
  const currency = countryToCurrency(country);
  const prices = await getStripePrices(currency);

  const ns = await getPlatformTranslationsByNamespaces(
    ["marketing.header", "marketing.pricing", "marketing.cta", "marketing.footer"],
    locale,
  );
  const t = ns["marketing.pricing"];

  const tiers = buildPricingTiers(
    prices,
    (id: PlanId) => resolveTranslation(t, `tier.${id}.description`, PLAN_DESCRIPTIONS[id] ?? ""),
    () => appAuthUrl("sign-up", locale),
  );

  const labels = {
    popular: resolveTranslation(t, "popular-badge", "Most Popular"),
    perMonth: resolveTranslation(t, "month", "/month"),
    billedAnnually: resolveTranslation(t, "billed-annually", "/year"),
    monthly: resolveTranslation(t, "cadence.monthly", "Monthly"),
    annual: resolveTranslation(t, "cadence.annual", "Annual"),
    save: resolveTranslation(t, "cadence.save", "(2 months free)"),
    getStarted: resolveTranslation(t, "cta.short", "Get started"),
  };

  const pageTitle = resolveTranslation(t, "page.title", "Simple pricing that scales with you");
  const pageSubtitle = resolveTranslation(
    t,
    "page.subtitle",
    "Start free and launch as many draft sites as you like. Pay only when you publish and grow — get found on Google and manage clients at scale. Custom domains included on all plans.",
  );

  return (
    <div className="min-h-screen bg-background">
      <PricingJsonLd prices={prices} baseUrl={`https://${ROOT_DOMAIN}`} locale={locale} />
      <MarketingHeader translations={ns["marketing.header"]} />
      <main>
        <section className="px-6 pt-20 pb-12 md:pt-28 text-center">
          <div className="mx-auto max-w-2xl">
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground">
              {pageTitle}
            </h1>
            <p className="mt-5 text-muted-foreground leading-relaxed">{pageSubtitle}</p>
          </div>
        </section>

        <section className="px-6 pb-8">
          <div className="mx-auto max-w-7xl">
            <PricingCheckoutCards
              tiers={tiers}
              labels={labels}
              locale={locale}
              signUpUrl={appAuthUrl("sign-up", locale)}
            />
          </div>
        </section>

        <PricingComparison translations={t} />

        <CtaSection translations={ns["marketing.cta"]} />
      </main>
      <FooterSection translations={ns["marketing.footer"]} locale={locale} />
    </div>
  );
}
