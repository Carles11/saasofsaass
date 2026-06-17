"use server";

import { assertCanManageStructure } from "@/5-shared/lib/auth/authorization";
import { db } from "@/5-shared/lib/db";
import { tenants } from "@/5-shared/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { tenantCache } from "@/5-shared/lib/next/tenant-cache";
import { RESERVED_APEX } from "@/5-shared/lib/utils/domain";
import { SLUG_REGEX } from "./shared";

export async function updateTenantSlug(tenantId: string, newSlug: string, oldSlug: string) {
  await assertCanManageStructure(tenantId);

  const slug = newSlug.trim().toLowerCase();

  if (!SLUG_REGEX.test(slug)) {
    throw new Error("settings.subdomain.error.invalid-format");
  }

  if (RESERVED_APEX.has(slug)) {
    throw new Error("settings.subdomain.error.reserved-word");
  }

  const [existing] = await db
    .select({ id: tenants.id })
    .from(tenants)
    .where(eq(tenants.slug, slug))
    .limit(1);

  if (existing && existing.id !== tenantId) {
    throw new Error("settings.subdomain.error.already-exists");
  }

  await db
    .update(tenants)
    .set({ slug })
    .where(eq(tenants.id, tenantId));

  await tenantCache.delete(`slug:${oldSlug}`);

  revalidatePath("/", "layout");

  return { slug };
}
