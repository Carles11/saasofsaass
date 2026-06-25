import { getStripe } from "./stripe";
import { PLANS, PLAN_ORDER, type Cadence, type PlanId } from "./plans";

export interface DisplayPrice {
  monthly: number;
  annual: number;
  currency: string;
}

export type PriceMap = Record<PlanId, DisplayPrice>;

const cache = new Map<string, { at: number; data: PriceMap }>();
const TTL_MS = 10 * 60 * 1000;

// Stripe zero-decimal currencies: unit_amount is the actual amount (no ×100).
const ZERO_DECIMAL = new Set([
  "BIF","CLP","DJF","GNF","JPY","KMF","KRW","MGA",
  "PYG","RWF","UGX","VND","VUV","XAF","XOF","XPF",
]);

function toMajor(unitAmount: number, currency: string): number {
  return ZERO_DECIMAL.has(currency.toUpperCase()) ? unitAmount : unitAmount / 100;
}

function cacheKey(currency: string | undefined): string {
  return currency ?? "base";
}

async function fetchAmount(
  priceId: string | null,
  currency?: string,
): Promise<{ amount: number; currency: string } | null> {
  if (!priceId) return null;
  try {
    const price = await getStripe().prices.retrieve(priceId, {
      expand: ["currency_options"],
    });
    if (price.unit_amount == null) return null;

    if (currency) {
      const opts = price.currency_options?.[currency.toLowerCase()];
      if (opts?.unit_amount != null) {
        return { amount: toMajor(opts.unit_amount, currency), currency: currency.toUpperCase() };
      }
    }

    const cur = (price.currency ?? "eur").toUpperCase();
    return { amount: toMajor(price.unit_amount, cur), currency: cur };
  } catch (err) {
    console.error("[prices] fetchAmount failed", priceId, currency, err);
    return null;
  }
}

/**
 * Live plan amounts from Stripe (cached per currency). Falls back to PLANS[].fallbackPrice
 * when Stripe is unconfigured or a price can't be fetched, so the pricing UI
 * always renders. Stripe is the source of truth once price IDs are set.
 * When `currency` is provided, tries `currency_options` first; falls back to base price.
 */
export async function getStripePrices(currency?: string): Promise<PriceMap> {
  const key = cacheKey(currency);
  const entry = cache.get(key);
  if (entry && Date.now() - entry.at < TTL_MS) return entry.data;

  const data = {} as PriceMap;
  let hasLive = false;
  for (const id of PLAN_ORDER) {
    const plan = PLANS[id];
    const [monthly, annual] = await Promise.all([
      fetchAmount(plan.stripePriceIds.monthly, currency),
      fetchAmount(plan.stripePriceIds.annual, currency),
    ]);
    if (monthly || annual) hasLive = true;
    data[id] = {
      monthly: monthly?.amount ?? plan.fallbackPrice.monthly,
      annual: annual?.amount ?? plan.fallbackPrice.annual,
      currency: monthly?.currency ?? annual?.currency ?? "EUR",
    };
  }

  if (hasLive) cache.set(key, { at: Date.now(), data });
  return data;
}

export function formatPrice(
  amount: number,
  currency = "EUR",
  locale = "en",
): string {
  if (amount === 0) {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(0);
  }
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

export type { Cadence };
