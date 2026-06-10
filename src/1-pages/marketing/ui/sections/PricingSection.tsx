import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { resolveTranslation, type TranslationDict } from "@/5-shared/lib/translations/resolve";

interface PricingSectionProps {
  translations?: TranslationDict;
}

export function PricingSection({ translations }: PricingSectionProps) {
  const badge = resolveTranslation(translations, "badge", "Pricing");
  const title = resolveTranslation(translations, "title", "Simple, Transparent");
  const subtitle = resolveTranslation(
    translations,
    "subtitle",
    "Start free. Scale as you grow. No hidden fees.",
  );
  const popularBadge = resolveTranslation(translations, "popular-badge", "Most Popular");
  const monthLabel = resolveTranslation(translations, "month", "/month");

  const tiers = [
    {
      name: resolveTranslation(translations, "tier.starter.name", "Starter"),
      price: "$29",
      description: resolveTranslation(
        translations,
        "tier.starter.description",
        "Perfect for testing the waters.",
      ),
      features: [
        resolveTranslation(translations, "tier.starter.feature.0", "Up to 3 tenant sites"),
        resolveTranslation(translations, "tier.starter.feature.1", "All block types"),
        resolveTranslation(translations, "tier.starter.feature.2", "AI translations"),
        resolveTranslation(translations, "tier.starter.feature.3", "Basic support"),
      ],
    },
    {
      name: resolveTranslation(translations, "tier.professional.name", "Professional"),
      price: "$79",
      description: resolveTranslation(
        translations,
        "tier.professional.description",
        "For growing agencies.",
      ),
      features: [
        resolveTranslation(translations, "tier.professional.feature.0", "Up to 15 tenant sites"),
        resolveTranslation(translations, "tier.professional.feature.1", "Custom domains"),
        resolveTranslation(translations, "tier.professional.feature.2", "Priority support"),
        resolveTranslation(translations, "tier.professional.feature.3", "Team members"),
      ],
      popular: true,
    },
    {
      name: resolveTranslation(translations, "tier.enterprise.name", "Enterprise"),
      price: "$199",
      description: resolveTranslation(
        translations,
        "tier.enterprise.description",
        "For large-scale operations.",
      ),
      features: [
        resolveTranslation(translations, "tier.enterprise.feature.0", "Unlimited tenant sites"),
        resolveTranslation(translations, "tier.enterprise.feature.1", "White-label"),
        resolveTranslation(translations, "tier.enterprise.feature.2", "Dedicated support"),
        resolveTranslation(translations, "tier.enterprise.feature.3", "Early access"),
      ],
    },
  ];

  return (
    <section id="pricing" className="px-4 py-16 md:py-24 bg-muted/50">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">{badge}</Badge>
          <h2 className="text-3xl font-black tracking-tighter text-foreground md:text-4xl">
            {title}
          </h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3 items-start">
          {tiers.map((tier) => (
            <Card key={tier.name} className={tier.popular ? "border-primary shadow-lg relative" : ""}>
              {tier.popular && (
                <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2">{popularBadge}</Badge>
              )}
              <CardHeader>
                <CardTitle>{tier.name}</CardTitle>
                <CardDescription>{tier.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-black text-foreground">{tier.price}</span>
                  <span className="text-muted-foreground text-sm">{monthLabel}</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary shrink-0" />
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant={tier.popular ? "default" : "outline"}>
                  {resolveTranslation(translations, "cta", "Choose {name}", { name: tier.name })}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
