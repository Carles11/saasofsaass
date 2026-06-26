import { PLAN_ORDER, PLANS } from "@/5-shared/lib/billing/plans";
import type { PriceMap } from "@/5-shared/lib/billing/prices";
import { PLAN_DESCRIPTIONS } from "@/5-shared/lib/billing/pricing-content";

interface PricingJsonLdProps {
  prices: PriceMap;
  baseUrl: string;
  locale: string;
}

/**
 * Emits schema.org Product/Offer structured data for each plan so search and AI
 * answer engines can read the catalogue. Only fields we genuinely have are
 * included — no fabricated ratings. Annual amounts are the yearly total.
 */
export function PricingJsonLd({ prices, baseUrl, locale }: PricingJsonLdProps) {
  const data = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: PLAN_ORDER.map((id, idx) => {
      const p = prices[id];
      const offers = [
        { amount: p.monthly, unit: "MONTH" as const },
        { amount: p.annual, unit: "ANNUAL" as const },
      ].map((o) => ({
        "@type": "Offer",
        price: o.amount.toFixed(2),
        priceCurrency: p.currency,
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: o.amount.toFixed(2),
          priceCurrency: p.currency,
          billingDuration: o.unit === "MONTH" ? 1 : 12,
          billingIncrement: 1,
          unitCode: "MON",
        },
        url: `${baseUrl}/${locale}/pricing?plan=${id}&cadence=${o.unit === "MONTH" ? "monthly" : "annual"}`,
      }));

      return {
        "@type": "ListItem",
        position: idx + 1,
        item: {
          "@type": "Product",
          name: `SoSS Engine — ${PLANS[id].label}`,
          description: PLAN_DESCRIPTIONS[id],
          brand: { "@type": "Brand", name: "SoSS Engine" },
          offers,
        },
      };
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
