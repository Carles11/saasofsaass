import { resolveTranslation, type TranslationDict } from "@/5-shared/lib/translations/resolve";
import { PLANS, PLAN_ORDER, isUnlimited } from "@/5-shared/lib/billing/plans";
import { getStripePrices } from "@/5-shared/lib/billing/prices";
import { appAuthUrl } from "@/5-shared/lib/auth/auth-urls";
import { PricingCards, type PricingTier } from "./PricingCards";

interface PricingSectionProps {
  translations?: TranslationDict;
  locale?: string;
  currency?: string;
}

const DESCRIPTIONS: Record<string, string> = {
  free: "Build and launch your first site, free forever.",
  pro: "For professionals offering sites to their clients.",
  enterprise: "For agencies managing sites at scale.",
};

function num(n: number): string {
  return isUnlimited(n) ? "Unlimited" : String(n);
}

function featuresFor(planId: keyof typeof PLANS): string[] {
  const { limits, features } = PLANS[planId];
  return [
    `${num(limits.publishedSites)} published site${limits.publishedSites === 1 ? "" : "s"}`,
    "Unlimited draft sites",
    "Free *.saasofsaass.com subdomain",
    features.customDomains ? "Custom domains" : "Custom domains — Pro+",
    isUnlimited(limits.aiBlocksLifetime)
      ? "Unlimited AI translations"
      : `${limits.aiBlocksLifetime} AI translations (trial)`,
    `${num(limits.teamMembers)} team member${limits.teamMembers === 1 ? "" : "s"}`,
    `${num(limits.languagesPerSite)} languages per site`,
    ...(features.removeBranding ? ['Remove "Made with" badge'] : []),
    features.prioritySupport ? "Priority support" : "Community support",
  ];
}

export async function PricingSection({ translations, locale, currency }: PricingSectionProps) {
  const prices = await getStripePrices(currency);

  const badge = resolveTranslation(translations, "badge", "Pricing");
  const title = resolveTranslation(translations, "title", "Plans that grow with your practice.");
  const subtitle = resolveTranslation(
    translations,
    "subtitle",
    "Start free. Publish more sites and unlock custom domains as your client list grows.",
  );

  const tiers: PricingTier[] = PLAN_ORDER.map((id) => ({
    id,
    name: PLANS[id].label,
    description: resolveTranslation(translations, `tier.${id}.description`, DESCRIPTIONS[id] ?? ""),
    monthly: prices[id].monthly,
    annual: prices[id].annual,
    currency: prices[id].currency,
    features: id === "pro"
      ? featuresFor(id).map((f, i) => i === 0 ? `${f} (+ €19/site for more)` : f)
      : featuresFor(id),
    popular: id === "pro",
    ctaHref: appAuthUrl("sign-up", locale ?? "en"),
  }));

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
