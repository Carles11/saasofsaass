"use server";
import { TenantTemplateId } from "@/5-shared/config/templates";
import { db } from "@/5-shared/lib/db";
import { tenants } from "@/5-shared/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function updateTenantTemplate(tenantId: string, templateId: TenantTemplateId) {
  await db.update(tenants).set({ templateId }).where(eq(tenants.id, tenantId));
  revalidatePath("/", "layout");
}
