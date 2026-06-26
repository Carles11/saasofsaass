"use server";

import { assertCanManageStructure } from "@/5-shared/lib/auth/authorization";
import { db } from "@/5-shared/lib/db";
import { tenants, workspaces } from "@/5-shared/lib/db/schema";
import { hasFeature } from "@/5-shared/lib/billing/plans";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function updateTenantSeo(tenantId: string, seoEnabled: boolean) {
  await assertCanManageStructure(tenantId);

  // Resolve plan from the tenant's workspace
  const [tenant] = await db
    .select({ workspaceId: tenants.workspaceId })
    .from(tenants)
    .where(eq(tenants.id, tenantId))
    .limit(1);

  if (!tenant) throw new Error("Tenant not found");

  const [workspace] = tenant.workspaceId
    ? await db
        .select({ plan: workspaces.plan })
        .from(workspaces)
        .where(eq(workspaces.id, tenant.workspaceId))
        .limit(1)
    : [];

  const plan = workspace?.plan ?? "free";

  // Plan gate: only plans eligible for indexing can control it. Free sites are
  // never indexed, so the toggle is meaningless for them.
  if (!hasFeature(plan, "searchIndexing")) {
    throw new Error("Search engine indexing is available on Pro and Enterprise plans.");
  }

  await db
    .update(tenants)
    .set({ seoEnabled, updatedAt: new Date() })
    .where(eq(tenants.id, tenantId));

  revalidatePath("/", "layout");
}
