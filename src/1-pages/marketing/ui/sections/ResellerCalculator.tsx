"use client";

import { useState } from "react";

interface ResellerCalculatorProps {
  /** Live plan amounts (monthly, in the display currency). */
  proMonthly: number;
  enterpriseMonthly: number;
  extraSitePrice: number;
  currency: string;
  labels: {
    sites: string;
    pricePerSite: string;
    revenue: string;
    planCost: string;
    profit: string;
    margin: string;
    perMonth: string;
    planNote: string;
  };
}

function fmt(amount: number, currency: string): string {
  const symbol = currency === "EUR" ? "€" : currency === "USD" ? "$" : `${currency} `;
  return `${symbol}${Math.round(amount).toLocaleString()}`;
}

export function ResellerCalculator({
  proMonthly,
  enterpriseMonthly,
  extraSitePrice,
  currency,
  labels,
}: ResellerCalculatorProps) {
  const [sites, setSites] = useState(3);
  const [price, setPrice] = useState(200);

  const revenue = sites * price;

  // Cheapest way to host `sites`: Pro (3 incl. + add-ons) vs Enterprise (unlimited).
  const proCost = proMonthly + Math.max(0, sites - 3) * extraSitePrice;
  const planCost = Math.min(proCost, enterpriseMonthly);
  const onEnterprise = enterpriseMonthly < proCost;

  const profit = revenue - planCost;
  const margin = revenue > 0 ? Math.round((profit / revenue) * 100) : 0;

  return (
    <div className="rounded-2xl border border-border/40 bg-card p-6 md:p-8">
      {/* Inputs */}
      <div className="grid gap-6 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-foreground">{labels.sites}</span>
          <span className="float-right text-sm font-bold text-primary">{sites}</span>
          <input
            type="range"
            min={1}
            max={25}
            value={sites}
            onChange={(e) => setSites(Number(e.target.value))}
            className="mt-3 w-full accent-[hsl(var(--primary))]"
            aria-label={labels.sites}
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-foreground">{labels.pricePerSite}</span>
          <span className="float-right text-sm font-bold text-primary">{fmt(price, currency)}</span>
          <input
            type="range"
            min={20}
            max={500}
            step={10}
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="mt-3 w-full accent-[hsl(var(--primary))]"
            aria-label={labels.pricePerSite}
          />
        </label>
      </div>

      {/* Results */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border/40 bg-background p-4 text-center">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{labels.revenue}</p>
          <p className="mt-1 text-2xl font-extrabold text-foreground">{fmt(revenue, currency)}</p>
          <p className="text-[11px] text-muted-foreground">{labels.perMonth}</p>
        </div>
        <div className="rounded-xl border border-border/40 bg-background p-4 text-center">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{labels.planCost}</p>
          <p className="mt-1 text-2xl font-extrabold text-muted-foreground">−{fmt(planCost, currency)}</p>
          <p className="text-[11px] text-muted-foreground">{labels.perMonth}</p>
        </div>
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-center">
          <p className="text-xs uppercase tracking-wide text-primary">{labels.profit}</p>
          <p className="mt-1 text-2xl font-extrabold text-primary">{fmt(profit, currency)}</p>
          <p className="text-[11px] text-primary/80">
            {labels.margin}: {margin}%
          </p>
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        {labels.planNote.replace("{plan}", onEnterprise ? "Enterprise" : "Pro")}
      </p>
    </div>
  );
}
