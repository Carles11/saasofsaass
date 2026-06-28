import { assertSuperAdmin } from "@/5-shared/lib/auth/authorization";
import { db } from "@/5-shared/lib/db";
import { workspaces, tenants, transactions, tenantDomains } from "@/5-shared/lib/db/schema";
import { profiles, workspaceInvitations } from "@/5-shared/lib/db/schema/auth";
import { eq, gt, ne, sql } from "drizzle-orm";
import { PLANS, type PlanId } from "@/5-shared/lib/billing/plans";

export interface PlatformMetrics {
  users: number;
  workspaces: number;
  workspacesByPlan: Record<string, number>;
  sites: { published: number; draft: number; archived: number; total: number };
  activeSubsByPlan: Record<string, number>;
  /** Approx monthly recurring revenue (EUR) = Σ active subs × plan list price. */
  approxMrrEur: number;
  /** Lifetime platform-fee revenue (EUR) from completed transactions. */
  platformFeeEur: number;
  pendingInvitations: number;
  domainsPending: number;
  aiBlocksUsed: number;
  signups7d: number;
  signups30d: number;
}

const n = (v: unknown): number => Number(v ?? 0);

/** Platform-wide metrics for the super-admin overview. Super-admin only. */
export async function getPlatformMetrics(): Promise<PlatformMetrics> {
  await assertSuperAdmin();

  const since7 = new Date(Date.now() - 7 * 86_400_000);
  const since30 = new Date(Date.now() - 30 * 86_400_000);

  const [
    usersRow,
    wsByPlan,
    activeByPlan,
    sitesByStatus,
    invitesRow,
    domainsRow,
    aiRow,
    feeRow,
    signups7Row,
    signups30Row,
  ] = await Promise.all([
    db.select({ c: sql<number>`count(*)` }).from(profiles),
    db.select({ plan: workspaces.plan, c: sql<number>`count(*)` }).from(workspaces).groupBy(workspaces.plan),
    db
      .select({ plan: workspaces.plan, c: sql<number>`count(*)` })
      .from(workspaces)
      .where(eq(workspaces.subscriptionStatus, "active"))
      .groupBy(workspaces.plan),
    db.select({ status: tenants.status, c: sql<number>`count(*)` }).from(tenants).groupBy(tenants.status),
    db
      .select({ c: sql<number>`count(*)` })
      .from(workspaceInvitations)
      .where(eq(workspaceInvitations.status, "pending")),
    db.select({ c: sql<number>`count(*)` }).from(tenantDomains).where(ne(tenantDomains.status, "verified")),
    db.select({ c: sql<number>`coalesce(sum(${workspaces.aiBlocksUsed}),0)` }).from(workspaces),
    db
      .select({ c: sql<number>`coalesce(sum(${transactions.platformFee}),0)` })
      .from(transactions)
      .where(eq(transactions.status, "completed")),
    db.select({ c: sql<number>`count(*)` }).from(profiles).where(gt(profiles.createdAt, since7)),
    db.select({ c: sql<number>`count(*)` }).from(profiles).where(gt(profiles.createdAt, since30)),
  ]);

  const workspacesByPlan: Record<string, number> = {};
  let workspacesTotal = 0;
  for (const r of wsByPlan) {
    workspacesByPlan[r.plan] = n(r.c);
    workspacesTotal += n(r.c);
  }

  const activeSubsByPlan: Record<string, number> = {};
  let approxMrrEur = 0;
  for (const r of activeByPlan) {
    activeSubsByPlan[r.plan] = n(r.c);
    approxMrrEur += n(r.c) * (PLANS[r.plan as PlanId]?.fallbackPrice.monthly ?? 0);
  }

  const sites = { published: 0, draft: 0, archived: 0, total: 0 };
  for (const r of sitesByStatus) {
    const count = n(r.c);
    sites.total += count;
    if (r.status === "published") sites.published += count;
    else if (r.status === "archived") sites.archived += count;
    else sites.draft += count;
  }

  return {
    users: n(usersRow[0]?.c),
    workspaces: workspacesTotal,
    workspacesByPlan,
    sites,
    activeSubsByPlan,
    approxMrrEur,
    platformFeeEur: n(feeRow[0]?.c) / 100, // platform_fee is stored in cents
    pendingInvitations: n(invitesRow[0]?.c),
    domainsPending: n(domainsRow[0]?.c),
    aiBlocksUsed: n(aiRow[0]?.c),
    signups7d: n(signups7Row[0]?.c),
    signups30d: n(signups30Row[0]?.c),
  };
}
