export const PLANS = {
  free: { siteLimit: 1 },
  starter: { siteLimit: 3 },
  pro: { siteLimit: 10 },
} as const

export type PlanId = keyof typeof PLANS

export const PLAN_ORDER: PlanId[] = ["free", "starter", "pro"]

export function getPlan(plan: string) {
  const cfg = PLANS[plan as PlanId]
  if (!cfg) throw new Error(`Unknown plan: "${plan}"`)
  return cfg
}

export function getSiteLimit(plan: string): number {
  return getPlan(plan).siteLimit
}

export function getNextPlan(currentPlan: string): PlanId | null {
  const idx = PLAN_ORDER.indexOf(currentPlan as PlanId)
  if (idx === -1 || idx >= PLAN_ORDER.length - 1) return null
  return PLAN_ORDER[idx + 1]
}

export function getStripePriceId(plan: string): string {
  if (plan === "free") return ""
  const key = `STRIPE_PRICE_ID_${plan.toUpperCase()}`
  const id = process.env[key]
  if (!id) throw new Error(`Missing environment variable: ${key}`)
  return id
}

export const PLAN_LABELS: Record<PlanId, string> = {
  free: "Free",
  starter: "Starter",
  pro: "Pro",
}
