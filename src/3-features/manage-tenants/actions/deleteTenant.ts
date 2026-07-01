"use server";

import { assertTenantRole } from "@/5-shared/lib/auth/authorization";
import { db } from "@/5-shared/lib/db";
import { tenants } from "@/5-shared/lib/db/schema";
import { galleryImages } from "@/4-entities/gallery/model/image";
import { heroImages } from "@/4-entities/hero/model/image";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { tenantCache } from "@/5-shared/lib/next/tenant-cache";
import { deleteS3Object } from "@/5-shared/lib/aws/s3";

/**
 * Permanently delete a site (owner only), guarded by a typed name confirmation.
 * Deleting the tenant cascades blocks / entities / translations / domains /
 * memberships / transactions; the image tables have no FK to tenants, so they
 * (and their S3 objects) are cleaned up explicitly.
 */
export async function deleteTenant(tenantId: string, confirmName: string) {
  await assertTenantRole(tenantId, "owner");

  const [t] = await db
    .select({ slug: tenants.slug, name: tenants.name, branding: tenants.branding })
    .from(tenants)
    .where(eq(tenants.id, tenantId))
    .limit(1);
  if (!t) throw new Error("errors.tenant-not-found");

  if (confirmName.trim() !== t.name) {
    throw new Error("errors.name-mismatch");
  }

  // Collect S3 keys (image tables aren't FK-cascaded).
  const [gallery, hero] = await Promise.all([
    db.select({ s3Key: galleryImages.s3Key }).from(galleryImages).where(eq(galleryImages.tenantId, tenantId)),
    db.select({ s3Key: heroImages.s3Key }).from(heroImages).where(eq(heroImages.tenantId, tenantId)),
  ]);
  const branding = (t.branding ?? {}) as { logo?: { s3Key?: string } };
  const s3Keys = [
    ...gallery.map((g) => g.s3Key),
    ...hero.map((h) => h.s3Key),
    ...(branding.logo?.s3Key ? [branding.logo.s3Key] : []),
  ];

  // Delete image rows (their i18n cascades), then the tenant (cascades the rest).
  await db.delete(galleryImages).where(eq(galleryImages.tenantId, tenantId));
  await db.delete(heroImages).where(eq(heroImages.tenantId, tenantId));
  await db.delete(tenants).where(eq(tenants.id, tenantId));

  // Best-effort S3 cleanup — a failed object delete must not fail the operation.
  for (const key of s3Keys) {
    try {
      await deleteS3Object(key);
    } catch (e) {
      console.error("S3 delete failed for", key, e);
    }
  }

  await tenantCache.delete(`slug:${t.slug}`);
  revalidatePath("/", "layout");

  return { ok: true as const };
}
