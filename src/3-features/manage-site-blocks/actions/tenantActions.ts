"use server";
import { TenantTemplateId } from "@/5-shared/config/templates";
import { db } from "@/5-shared/lib/db";
import { tenants } from "@/5-shared/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { assertCanManageStructure } from "@/5-shared/lib/auth/authorization";

export async function updateTenantTemplate(tenantId: string, templateId: TenantTemplateId) {
  await assertCanManageStructure(tenantId)
  await db.update(tenants).set({ templateId }).where(eq(tenants.id, tenantId));
  revalidatePath("/", "layout");
}
