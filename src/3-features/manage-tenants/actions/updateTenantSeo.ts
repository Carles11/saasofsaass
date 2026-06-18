"use server";

import { assertCanManageStructure } from "@/5-shared/lib/auth/authorization";
import { db } from "@/5-shared/lib/db";
import { tenants, workspaces } from "@/5-shared/lib/db/schema";
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

  // Plan gate: only pro can disable indexing
  if (!seoEnabled && plan !== "pro") {
    throw new Error("Upgrade to Pro to disable search engine indexing");
  }

  await db
    .update(tenants)
    .set({ seoEnabled, updatedAt: new Date() })
    .where(eq(tenants.id, tenantId));

  revalidatePath("/", "layout");
}
