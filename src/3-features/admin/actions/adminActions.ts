"use server";

import { db } from "@/5-shared/lib/db";
import { workspaces } from "@/5-shared/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { assertSuperAdmin } from "@/5-shared/lib/auth/authorization";
import { getSiteLimit, PLAN_ORDER, type PlanId } from "@/5-shared/lib/billing/plans";

/**
 * Comp/override a workspace's plan (super-admin only). Manual override — note a
 * live Stripe subscription's webhook may later reconcile, so this targets
 * comped/manual accounts. Also resets the base published-site limit for the plan.
 */
export async function setWorkspacePlan(workspaceId: string, plan: string): Promise<void> {
  await assertSuperAdmin();
  if (!PLAN_ORDER.includes(plan as PlanId)) throw new Error("errors.unknown-plan");

  await db
    .update(workspaces)
    .set({ plan, siteLimit: getSiteLimit(plan), updatedAt: new Date() })
    .where(eq(workspaces.id, workspaceId));

  revalidatePath("/[locale]/admin", "page");
  revalidatePath("/[locale]/admin/workspaces/[id]", "page");
}

/** Grant (set) a workspace's purchased add-on published-site slots (super-admin only). */
export async function grantAddonSites(workspaceId: string, addonSites: number): Promise<void> {
  await assertSuperAdmin();
  const n = Math.max(0, Math.floor(addonSites));

  await db
    .update(workspaces)
    .set({ addonSites: n, updatedAt: new Date() })
    .where(eq(workspaces.id, workspaceId));

  revalidatePath("/[locale]/admin/workspaces/[id]", "page");
}
