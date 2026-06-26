// ============================================================================
// PRICING CONTENT — single source of truth for the marketing pricing surfaces
// (home PricingSection + the public /pricing page). Everything derives from
// PLANS in `plans.ts`; nothing here hardcodes a limit. Feature bullet copy is
// resolved through translations by the caller where a dict is available.
// ============================================================================

import { PLANS, PLAN_ORDER, isUnlimited, type PlanId } from "./plans";
import type { PriceMap } from "./prices";

export const PLAN_DESCRIPTIONS: Record<PlanId, string> = {
  free: "Build and launch your first site, free forever.",
  pro: "For professionals offering sites to their clients.",
  enterprise: "For agencies managing sites at scale.",
};

function num(n: number): string {
  return isUnlimited(n) ? "Unlimited" : String(n);
}

/** Feature bullet list for a plan card. English fallback copy. */
export function featuresFor(planId: PlanId): string[] {
  const { limits, features } = PLANS[planId];
  return [
    `${num(limits.publishedSites)} published site${limits.publishedSites === 1 ? "" : "s"}`,
    "Unlimited draft sites",
    "Free *.saasofsaass.com subdomain",
    features.customDomains ? "Custom domains" : "Custom domains — Pro+",
    features.searchIndexing
      ? "Indexed on Google & AI search"
      : "Search engine visibility — Pro+",
    isUnlimited(limits.aiBlocksLifetime)
      ? "Unlimited AI translations"
      : `${limits.aiBlocksLifetime} AI translations (trial)`,
    `${num(limits.teamMembers)} team member${limits.teamMembers === 1 ? "" : "s"}`,
    `${num(limits.languagesPerSite)} languages per site`,
    ...(features.branding === "none"
      ? ["Fully unbranded — no badge"]
      : features.branding === "minimal"
        ? ["Discreet badge only"]
        : []),
    features.prioritySupport ? "Priority support" : "Community support",
  ];
}

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

/**
 * Build the card tiers shared by every pricing surface.
 * `describe` resolves a per-plan description (caller wires translations);
 * `ctaHref` builds the call-to-action target per plan id.
 */
export function buildPricingTiers(
  prices: PriceMap,
  describe: (id: PlanId) => string,
  ctaHref: (id: PlanId) => string,
): PricingTier[] {
  return PLAN_ORDER.map((id) => ({
    id,
    name: PLANS[id].label,
    description: describe(id),
    monthly: prices[id].monthly,
    annual: prices[id].annual,
    currency: prices[id].currency,
    features:
      id === "pro"
        ? featuresFor(id).map((f, i) => (i === 0 ? `${f} (+ €19/site for more)` : f))
        : featuresFor(id),
    popular: id === "pro",
    ctaHref: ctaHref(id),
  }));
}

// ── Feature comparison table ─────────────────────────────────────────────────
// Row values are derived from PLANS so the table never drifts. `labelKey` is a
// translation key (namespace `marketing.pricing`) with an English `fallback`.

export interface ComparisonRow {
  labelKey: string;
  fallback: string;
  /** Cell value per plan: a string (limit) or boolean (feature check/cross). */
  value: (id: PlanId) => string | boolean;
}

function limitText(n: number): string {
  return isUnlimited(n) ? "∞" : String(n);
}

export const COMPARISON_ROWS: ComparisonRow[] = [
  {
    labelKey: "compare.published-sites",
    fallback: "Published sites",
    value: (id) => limitText(PLANS[id].limits.publishedSites),
  },
  {
    labelKey: "compare.draft-sites",
    fallback: "Draft sites",
    value: () => "∞",
  },
  {
    labelKey: "compare.languages",
    fallback: "Languages per site",
    value: (id) => limitText(PLANS[id].limits.languagesPerSite),
  },
  {
    labelKey: "compare.team-members",
    fallback: "Team members",
    value: (id) => limitText(PLANS[id].limits.teamMembers),
  },
  {
    labelKey: "compare.ai-translations",
    fallback: "AI translations",
    value: (id) =>
      isUnlimited(PLANS[id].limits.aiBlocksLifetime)
        ? "∞"
        : `${PLANS[id].limits.aiBlocksLifetime} (trial)`,
  },
  {
    labelKey: "compare.custom-domains",
    fallback: "Custom domains",
    value: (id) => PLANS[id].features.customDomains,
  },
  {
    labelKey: "compare.search-indexing",
    fallback: "Search engine indexing (Google & AI)",
    value: (id) => PLANS[id].features.searchIndexing,
  },
  {
    labelKey: "compare.share-preview",
    fallback: "Shareable preview links",
    value: (id) => {
      const d = PLANS[id].features.previewLinkMaxDays;
      return d === null ? false : `Up to ${d} days`;
    },
  },
  {
    labelKey: "compare.unbranded",
    fallback: "Fully unbranded (no badge)",
    value: (id) => PLANS[id].features.branding === "none",
  },
  {
    labelKey: "compare.priority-support",
    fallback: "Priority support",
    value: (id) => PLANS[id].features.prioritySupport,
  },
];
