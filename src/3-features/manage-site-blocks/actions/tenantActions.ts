"use server";
import { TEMPLATES, TenantTemplateId } from "@/5-shared/config/templates";
import { db } from "@/5-shared/lib/db";
import { tenants } from "@/5-shared/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { assertCanManageStructure } from "@/5-shared/lib/auth/authorization";
import { getPlanForWorkspace } from "@/5-shared/lib/billing/workspace";
import { hasFeature } from "@/5-shared/lib/billing/plans";

export async function updateTenantTemplate(tenantId: string, templateId: TenantTemplateId) {
  await assertCanManageStructure(tenantId);

  const template = TEMPLATES[templateId];
  if (!template) {
    throw new Error(`Unknown template "${templateId}".`);
  }

  if (template.gating.isPremium) {
    const [row] = await db
      .select({ workspaceId: tenants.workspaceId })
      .from(tenants)
      .where(eq(tenants.id, tenantId))
      .limit(1);
    const plan = await getPlanForWorkspace(row?.workspaceId ?? null);
    if (!hasFeature(plan, "premiumTemplates")) {
      throw new Error(
        `This template requires a paid plan. Upgrade to use "${template.meta.id}".`,
      );
    }
  }

  await db.update(tenants).set({ templateId }).where(eq(tenants.id, tenantId));
  revalidatePath("/", "layout");
}
