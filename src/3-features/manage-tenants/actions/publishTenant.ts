"use server";

import { assertCanManageStructure } from "@/5-shared/lib/auth/authorization";
import { db } from "@/5-shared/lib/db";
import { tenants, workspaces } from "@/5-shared/lib/db/schema";
import { and, eq, ne, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { tenantCache } from "@/5-shared/lib/next/tenant-cache";
import { getEffectiveSiteLimit, isUnlimited, PLAN_LABELS, type PlanId } from "@/5-shared/lib/billing/plans";

/**
 * Sentinel prefix encoded into the thrown Error message so the client can
 * detect the cap-reached path reliably (server-action throws don't preserve
 * class identity across the network boundary — only `.message` survives).
 * Format: `PUBLISH_CAP_REACHED:{plan}:{limit}:{addonSites}: {human message}`.
 */
const PUBLISH_CAP_SENTINEL = "PUBLISH_CAP_REACHED";

export interface PublishCapInfo {
  plan: string;
  limit: number;
  addonSites: number;
  message: string;
}

/** Parse a thrown error to detect & extract publish-cap info. Returns null
 * when the error is something else. Safe to call from client components. */
export function parsePublishCapError(err: unknown): PublishCapInfo | null {
  const message = err instanceof Error ? err.message : String(err);
  if (!message.startsWith(`${PUBLISH_CAP_SENTINEL}:`)) return null;
  const [, plan, limitStr, addonStr, ...rest] = message.split(":");
  const limit = Number(limitStr);
  const addonSites = Number(addonStr);
  if (!plan || Number.isNaN(limit) || Number.isNaN(addonSites)) return null;
  return {
    plan,
    limit,
    addonSites,
    message: rest.join(":").trim(),
  };
}

async function getTenantWithWorkspace(tenantId: string) {
  const [row] = await db
    .select({
      slug: tenants.slug,
      status: tenants.status,
      workspaceId: tenants.workspaceId,
      plan: workspaces.plan,
      addonSites: workspaces.addonSites,
      subscriptionStatus: workspaces.subscriptionStatus,
      siteLimitWorkspaceId: workspaces.id,
    })
    .from(tenants)
    .leftJoin(workspaces, eq(tenants.workspaceId, workspaces.id))
    .where(eq(tenants.id, tenantId))
    .limit(1);
  return row ?? null;
}

/** Publish a tenant site (owner only). Gated by the plan's effective published-site limit. */
export async function publishTenant(tenantId: string) {
  await assertCanManageStructure(tenantId);

  const t = await getTenantWithWorkspace(tenantId);
  if (!t) throw new Error("Tenant not found");
  if (t.status === "published") return { status: "published" as const };
  if (!t.workspaceId || !t.plan) throw new Error("Tenant has no workspace");

  if (
    t.subscriptionStatus === "past_due" ||
    t.subscriptionStatus === "unpaid" ||
    t.subscriptionStatus === "incomplete_expired"
  ) {
    throw new Error("Your subscription is past due. Please update your billing information to publish.");
  }

  const limit = getEffectiveSiteLimit(t.plan, t.addonSites ?? 0);
  if (!isUnlimited(limit)) {
    const [{ count } = { count: 0 }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(tenants)
      .where(
        and(
          eq(tenants.workspaceId, t.workspaceId),
          eq(tenants.status, "published"),
          ne(tenants.id, tenantId),
        ),
      );

    if (Number(count) >= limit) {
      const planLabel = PLAN_LABELS[t.plan as PlanId] ?? t.plan;
      const human = `Your ${planLabel} plan allows ${limit} published site${limit === 1 ? "" : "s"}. Unpublish another site or upgrade to publish more.`;
      throw new Error(
        `${PUBLISH_CAP_SENTINEL}:${t.plan}:${limit}:${t.addonSites ?? 0}: ${human}`,
      );
    }
  }

  await db.update(tenants).set({ status: "published" }).where(eq(tenants.id, tenantId));
  await tenantCache.delete(`slug:${t.slug}`);
  revalidatePath("/", "layout");

  return { status: "published" as const };
}

/** Unpublish a tenant site back to draft (owner only). */
export async function unpublishTenant(tenantId: string) {
  await assertCanManageStructure(tenantId);

  const [t] = await db
    .select({ slug: tenants.slug })
    .from(tenants)
    .where(eq(tenants.id, tenantId))
    .limit(1);
  if (!t) throw new Error("Tenant not found");

  await db.update(tenants).set({ status: "draft" }).where(eq(tenants.id, tenantId));
  await tenantCache.delete(`slug:${t.slug}`);
  revalidatePath("/", "layout");

  return { status: "draft" as const };
}
