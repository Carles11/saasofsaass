import { getStripe } from "./stripe";
import { PLANS, PLAN_ORDER, type Cadence, type PlanId } from "./plans";

export interface DisplayPrice {
  monthly: number;
  annual: number;
  currency: string;
}

export type PriceMap = Record<PlanId, DisplayPrice>;

let cache: { at: number; data: PriceMap } | null = null;
const TTL_MS = 10 * 60 * 1000; // 10 minutes

async function fetchAmount(priceId: string | null): Promise<{ amount: number; currency: string } | null> {
  if (!priceId) return null;
  try {
    const price = await getStripe().prices.retrieve(priceId);
    if (price.unit_amount == null) return null;
    return { amount: price.unit_amount / 100, currency: (price.currency ?? "eur").toUpperCase() };
  } catch {
    return null;
  }
}

/**
 * Live plan amounts from Stripe (cached). Falls back to PLANS[].fallbackPrice
 * when Stripe is unconfigured or a price can't be fetched, so the pricing UI
 * always renders. Stripe is the source of truth once price IDs are set.
 */
export async function getStripePrices(): Promise<PriceMap> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.data;

  const data = {} as PriceMap;
  for (const id of PLAN_ORDER) {
    const plan = PLANS[id];
    const [monthly, annual] = await Promise.all([
      fetchAmount(plan.stripePriceIds.monthly),
      fetchAmount(plan.stripePriceIds.annual),
    ]);
    data[id] = {
      monthly: monthly?.amount ?? plan.fallbackPrice.monthly,
      annual: annual?.amount ?? plan.fallbackPrice.annual,
      currency: monthly?.currency ?? annual?.currency ?? "EUR",
    };
  }

  cache = { at: Date.now(), data };
  return data;
}

export function formatPrice(amount: number, currency = "EUR"): string {
  if (amount === 0) return "€0";
  const symbol = currency === "EUR" ? "€" : currency === "USD" ? "$" : `${currency} `;
  return `${symbol}${amount}`;
}

export type { Cadence };
