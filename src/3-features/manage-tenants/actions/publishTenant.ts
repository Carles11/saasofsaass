"use server";

import { assertCanManageStructure } from "@/5-shared/lib/auth/authorization";
import { db } from "@/5-shared/lib/db";
import { tenants, workspaces } from "@/5-shared/lib/db/schema";
import { and, eq, ne, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { tenantCache } from "@/5-shared/lib/next/tenant-cache";
import { getEffectiveSiteLimit, isUnlimited } from "@/5-shared/lib/billing/plans";
import { PUBLISH_CAP_SENTINEL } from "@/5-shared/lib/tenants/publish-cap";

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
  if (!t) throw new Error("errors.tenant-not-found");
  if (t.status === "published") return { status: "published" as const };
  if (!t.workspaceId || !t.plan) throw new Error("errors.tenant-no-workspace");

  if (
    t.subscriptionStatus === "past_due" ||
    t.subscriptionStatus === "unpaid" ||
    t.subscriptionStatus === "incomplete_expired"
  ) {
    throw new Error("errors.subscription-past-due");
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
      throw new Error(
        `${PUBLISH_CAP_SENTINEL}:${t.plan}:${limit}:${t.addonSites ?? 0}:errors.publish-cap-reached`,
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
  if (!t) throw new Error("errors.tenant-not-found");

  await db.update(tenants).set({ status: "draft" }).where(eq(tenants.id, tenantId));
  await tenantCache.delete(`slug:${t.slug}`);
  revalidatePath("/", "layout");

  return { status: "draft" as const };
}
