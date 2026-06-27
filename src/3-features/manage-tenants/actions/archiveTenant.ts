"use server";

import { assertTenantRole } from "@/5-shared/lib/auth/authorization";
import { db } from "@/5-shared/lib/db";
import { tenants } from "@/5-shared/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { tenantCache } from "@/5-shared/lib/next/tenant-cache";

/** Archive a site (owner only): hidden from the public web + the active list,
 * reversible, and no longer counts against the published-site limit. */
export async function archiveTenant(tenantId: string) {
  await assertTenantRole(tenantId, "owner");

  const [t] = await db
    .select({ slug: tenants.slug })
    .from(tenants)
    .where(eq(tenants.id, tenantId))
    .limit(1);
  if (!t) throw new Error("Tenant not found");

  await db.update(tenants).set({ status: "archived" }).where(eq(tenants.id, tenantId));
  await tenantCache.delete(`slug:${t.slug}`);
  revalidatePath("/", "layout");

  return { status: "archived" as const };
}

/** Restore an archived site back to draft (owner only). */
export async function restoreTenant(tenantId: string) {
  await assertTenantRole(tenantId, "owner");

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
