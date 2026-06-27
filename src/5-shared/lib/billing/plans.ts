// ============================================================================
// PLANS — single source of truth for limits, features, and Stripe price IDs.
// Prices (amounts) live in Stripe and are fetched via getStripePrices(); the
// `fallbackPrice` here is only used for display before Stripe is configured.
// `-1` means "unlimited" everywhere.
// ============================================================================

export type Cadence = "monthly" | "annual";

export interface PlanLimits {
  publishedSites: number;
  teamMembers: number;
  languagesPerSite: number;
  aiBlocksLifetime: number;
}

/** Platform branding shown on a tenant's public site:
 * - `full`    — fixed corner badge + a "Powered by" footer strip (Free).
 * - `minimal` — fixed corner badge only (Pro): a discreet, dofollow backlink.
 * - `none`    — fully unbranded / white-label (Enterprise). */
export type BrandingLevel = "full" | "minimal" | "none";

export interface PlanFeatures {
  customDomains: boolean;
  branding: BrandingLevel;
  /** Whether sites on this plan are eligible to be indexed by search/AI engines.
   * Free sites are never indexed (domain-reputation hygiene); paid plans are
   * indexed by default and may opt out via the per-site `seoEnabled` flag. */
  searchIndexing: boolean;
  prioritySupport: boolean;
  /** Max days a share-preview link can be valid. null = feature unavailable.
   * Always a finite number when present — preview links never live forever, so
   * a leaked URL is always bound in time. */
  previewLinkMaxDays: number | null;
}

export interface PlanConfig {
  label: string;
  stripePriceIds: { monthly: string | null; annual: string | null };
  /** Display-only fallback (EUR) used before Stripe prices are configured. */
  fallbackPrice: { monthly: number; annual: number };
  limits: PlanLimits;
  features: PlanFeatures;
}

export const PLANS = {
  free: {
    label: "Free",
    stripePriceIds: { monthly: null, annual: null },
    fallbackPrice: { monthly: 0, annual: 0 },
    limits: {
      publishedSites: 1,
      teamMembers: 1,
      languagesPerSite: 2,
      aiBlocksLifetime: 2,
    },
    features: {
      customDomains: false,
      branding: "full",
      searchIndexing: false,
      prioritySupport: false,
      previewLinkMaxDays: null,
    },
  },
  pro: {
    label: "Pro",
    stripePriceIds: {
      monthly: process.env.STRIPE_PRICE_ID_PRO_MONTHLY ?? null,
      annual: process.env.STRIPE_PRICE_ID_PRO_ANNUAL ?? null,
    },
    fallbackPrice: { monthly: 79, annual: 790 },
    limits: {
      publishedSites: 3,
      teamMembers: 10,
      languagesPerSite: -1,
      aiBlocksLifetime: -1,
    },
    features: {
      customDomains: true,
      branding: "minimal",
      searchIndexing: true,
      prioritySupport: false,
      previewLinkMaxDays: 7,
    },
  },
  enterprise: {
    label: "Enterprise",
    stripePriceIds: {
      monthly: process.env.STRIPE_PRICE_ID_ENTERPRISE_MONTHLY ?? null,
      annual: process.env.STRIPE_PRICE_ID_ENTERPRISE_ANNUAL ?? null,
    },
    fallbackPrice: { monthly: 199, annual: 1990 },
    limits: {
      publishedSites: -1,
      teamMembers: -1,
      languagesPerSite: -1,
      aiBlocksLifetime: -1,
    },
    features: {
      customDomains: true,
      branding: "none",
      searchIndexing: true,
      prioritySupport: true,
      previewLinkMaxDays: 180,
    },
  },
} as const satisfies Record<string, PlanConfig>;

export type PlanId = keyof typeof PLANS;

export const PLAN_ORDER: PlanId[] = ["free", "pro", "enterprise"];

export const PLAN_LABELS: Record<PlanId, string> = {
  free: PLANS.free.label,
  pro: PLANS.pro.label,
  enterprise: PLANS.enterprise.label,
};

function isPlanId(plan: string): plan is PlanId {
  return plan in PLANS;
}

export function getPlan(plan: string): PlanConfig {
  if (!isPlanId(plan)) throw new Error(`Unknown plan: "${plan}"`);
  return PLANS[plan];
}

/** True when a limit value represents "unlimited". */
export function isUnlimited(n: number): boolean {
  return n < 0;
}

/** Read a numeric limit for a plan. */
export function getLimit(plan: string, key: keyof PlanLimits): number {
  return getPlan(plan).limits[key];
}

type BooleanFeatureKeys = {
  [K in keyof PlanFeatures]: PlanFeatures[K] extends boolean ? K : never;
}[keyof PlanFeatures];

/** Read a boolean feature flag for a plan. */
export function hasFeature(plan: string, key: BooleanFeatureKeys): boolean {
  return getPlan(plan).features[key] as boolean;
}

/** Read the max days allowed for a share-preview link. null = feature unavailable. */
export function getPreviewLinkMaxDays(plan: string): number | null {
  return getPlan(plan).features.previewLinkMaxDays;
}

/** Max published sites = base plan limit + purchased add-on sites (unless unlimited). */
export function getEffectiveSiteLimit(plan: string, addonSites = 0): number {
  const base = getLimit(plan, "publishedSites");
  return isUnlimited(base) ? -1 : base + Math.max(0, addonSites);
}

/** Base published-site limit for a plan. Kept for the Stripe webhook. */
export function getSiteLimit(plan: string): number {
  return getLimit(plan, "publishedSites");
}

export function getTeamLimit(plan: string): number {
  return getLimit(plan, "teamMembers");
}

/** Whether a plan permits inviting team members at all (Free is solo-owner only). */
export function planAllowsTeam(plan: string): boolean {
  const limit = getTeamLimit(plan);
  return isUnlimited(limit) || limit > 1;
}

export function planAllowsCustomDomains(plan: string): boolean {
  return hasFeature(plan, "customDomains");
}

/** Platform-branding level for a plan (full / minimal / none). */
export function getBranding(plan: string): BrandingLevel {
  return getPlan(plan).features.branding;
}

/** Whether the fixed corner badge shows (Free + Pro). */
export function showsCornerBadge(plan: string): boolean {
  return getBranding(plan) !== "none";
}

/** Whether the "Powered by" footer strip shows (Free only). */
export function showsFooterBadge(plan: string): boolean {
  return getBranding(plan) === "full";
}

/** Whether a tenant site should be indexed: its own SEO toggle must be on AND
 * the plan must permit indexing. Free sites are never indexed. */
export function isTenantIndexable(
  seoEnabled: boolean | null | undefined,
  plan: string,
): boolean {
  return seoEnabled !== false && hasFeature(plan, "searchIndexing");
}

export function getNextPlan(currentPlan: string): PlanId | null {
  const idx = PLAN_ORDER.indexOf(currentPlan as PlanId);
  if (idx === -1 || idx >= PLAN_ORDER.length - 1) return null;
  return PLAN_ORDER[idx + 1];
}

export function getStripePriceId(
  plan: string,
  cadence: Cadence = "monthly",
): string {
  const id = getPlan(plan).stripePriceIds[cadence];
  if (!id)
    throw new Error(`Missing Stripe price ID for plan "${plan}" (${cadence})`);
  return id;
}
