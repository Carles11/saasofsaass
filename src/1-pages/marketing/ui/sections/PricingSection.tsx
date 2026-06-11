import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { resolveTranslation, type TranslationDict } from "@/5-shared/lib/translations/resolve";

interface PricingSectionProps {
  translations?: TranslationDict;
}

export function PricingSection({ translations }: PricingSectionProps) {
  const badge = resolveTranslation(translations, "badge", "Pricing");
  const title = resolveTranslation(translations, "title", "Plans that grow with your practice.");
  const subtitle = resolveTranslation(
    translations,
    "subtitle",
    "Start free. Add sites as your client list grows.",
  );
  const popularBadge = resolveTranslation(translations, "popular-badge", "Most Popular");
  const monthLabel = resolveTranslation(translations, "month", "/month");

  const tiers = [
    {
      name: resolveTranslation(translations, "tier.starter.name", "Starter"),
      price: "$29",
      description: resolveTranslation(translations, "tier.starter.description", "For professionals just starting out."),
      features: [
        resolveTranslation(translations, "tier.starter.feature.0", "Up to 3 client sites"),
        resolveTranslation(translations, "tier.starter.feature.1", "All block types"),
        resolveTranslation(translations, "tier.starter.feature.2", "AI translations (8 languages)"),
        resolveTranslation(translations, "tier.starter.feature.3", "Custom branding per site"),
      ],
      popular: false,
    },
    {
      name: resolveTranslation(translations, "tier.professional.name", "Professional"),
      price: "$79",
      description: resolveTranslation(translations, "tier.professional.description", "For growing practices and agencies."),
      features: [
        resolveTranslation(translations, "tier.professional.feature.0", "Up to 15 client sites"),
        resolveTranslation(translations, "tier.professional.feature.1", "Custom domains for each client"),
        resolveTranslation(translations, "tier.professional.feature.2", "Priority support"),
        resolveTranslation(translations, "tier.professional.feature.3", "Team member access"),
      ],
      popular: true,
    },
    {
      name: resolveTranslation(translations, "tier.enterprise.name", "Enterprise"),
      price: "$199",
      description: resolveTranslation(translations, "tier.enterprise.description", "For agencies managing at scale."),
      features: [
        resolveTranslation(translations, "tier.enterprise.feature.0", "Unlimited client sites"),
        resolveTranslation(translations, "tier.enterprise.feature.1", "White-label platform"),
        resolveTranslation(translations, "tier.enterprise.feature.2", "Dedicated account support"),
        resolveTranslation(translations, "tier.enterprise.feature.3", "Early access to new features"),
      ],
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="px-6 py-24 md:py-32 bg-muted/30">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">{badge}</p>
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
            {title}
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid gap-6 md:grid-cols-3 items-start">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative rounded-2xl border bg-background p-8 flex flex-col gap-6 transition-shadow ${
                tier.popular
                  ? "border-primary ring-1 ring-primary shadow-lg shadow-primary/10"
                  : "border-border/60 hover:shadow-md"
              }`}
            >
              {/* Popular badge — inside, not clipping */}
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-primary-foreground">
                    {popularBadge}
                  </span>
                </div>
              )}

              {/* Tier header */}
              <div>
                <h3 className="text-base font-semibold text-foreground">{tier.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{tier.description}</p>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-foreground">{tier.price}</span>
                <span className="text-sm text-muted-foreground">{monthLabel}</span>
              </div>

              {/* Divider */}
              <div className="h-px bg-border/50" />

              {/* Features */}
              <ul className="flex flex-col gap-3 flex-1">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Button
                className="w-full mt-2"
                variant={tier.popular ? "default" : "outline"}
                size="lg"
              >
                {resolveTranslation(translations, "cta", "Get started with {name}", { name: tier.name })}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}