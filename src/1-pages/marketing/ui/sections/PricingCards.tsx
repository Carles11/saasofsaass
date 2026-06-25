"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { formatPrice } from "@/5-shared/lib/billing/prices";

export interface PricingTier {
  id: string;
  name: string;
  description: string;
  monthly: number;
  annual: number;
  currency: string;
  features: string[];
  popular: boolean;
  ctaHref: string;
}

interface PricingCardsProps {
  tiers: PricingTier[];
  labels: {
    popular: string;
    perMonth: string;
    billedAnnually: string;
    monthly: string;
    annual: string;
    save: string;
    getStarted: string;
  };
  locale: string;
}

export function PricingCards({ tiers, labels, locale }: PricingCardsProps) {
  const [annual, setAnnual] = useState(false);

  return (
    <>
      {/* Cadence toggle */}
      <div className="flex items-center justify-center gap-3 mb-12">
        <span className={`text-sm ${!annual ? "text-foreground font-medium" : "text-muted-foreground"}`}>
          {labels.monthly}
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={annual}
          onClick={() => setAnnual((a) => !a)}
          className="relative h-6 w-11 rounded-full bg-muted transition-colors data-[on=true]:bg-primary"
          data-on={annual}
        >
          <span
            className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-background shadow transition-transform"
            style={{ transform: annual ? "translateX(20px)" : "translateX(0)" }}
          />
        </button>
        <span className={`text-sm ${annual ? "text-foreground font-medium" : "text-muted-foreground"}`}>
          {labels.annual} <span className="text-primary">{labels.save}</span>
        </span>
      </div>

      <div className="grid gap-6 md:grid-cols-3 items-start">
        {tiers.map((tier) => {
          const amount = annual ? tier.annual : tier.monthly;
          const isPaid = tier.monthly > 0 || tier.annual > 0;
          return (
            <div
              key={tier.id}
              className={`relative rounded-2xl border bg-background p-8 flex flex-col gap-6 transition-shadow ${
                tier.popular
                  ? "border-primary ring-1 ring-primary shadow-lg shadow-primary/10"
                  : "border-border/60 hover:shadow-md"
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-primary-foreground">
                    {labels.popular}
                  </span>
                </div>
              )}

              <div>
                <h3 className="text-base font-semibold text-foreground">{tier.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{tier.description}</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-foreground">{formatPrice(amount, tier.currency, locale)}</span>
                {isPaid && (
                  <span className="text-sm text-muted-foreground">
                    {annual ? labels.billedAnnually : labels.perMonth}
                  </span>
                )}
              </div>

              <div className="h-px bg-border/50" />

              <ul className="flex flex-col gap-3 flex-1">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>

              <Button className="w-full mt-2" variant={tier.popular ? "default" : "outline"} size="lg" asChild>
                <a href={tier.ctaHref}>{labels.getStarted}</a>
              </Button>
            </div>
          );
        })}
      </div>
    </>
  );
}
