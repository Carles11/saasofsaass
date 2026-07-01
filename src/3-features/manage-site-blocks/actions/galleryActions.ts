"use server";

import { triggerCaptionTranslation } from "@/3-features/auto-translate-content/actions/triggerCaptionTranslation";
import { galleryImageI18n, galleryImages } from "@/4-entities/gallery/model/image";
import { assertCanEditContent } from "@/5-shared/lib/auth/authorization";
import { getCloudFrontUrl } from "@/5-shared/lib/aws/cloudfront";
import { deleteS3Object } from "@/5-shared/lib/aws/s3";
import { db } from "@/5-shared/lib/db";
import { blocks, tenants } from "@/5-shared/lib/db/schema";
import type { GalleryImage } from "@/5-shared/types/tenants/blocks";
import { and, asc, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

function revalidate(tenantId: string) {
  revalidatePath(`/[locale]/dashboard/site-builder/${tenantId}`, "page");
}

/** Read the gallery's images from the tables (the source of truth). */
export async function getGalleryImages(
  blockId: string,
  tenantId: string,
): Promise<GalleryImage[]> {
  await assertCanEditContent(tenantId);

  const imgs = await db
    .select()
    .from(galleryImages)
    .where(and(eq(galleryImages.tenantId, tenantId), eq(galleryImages.blockId, blockId)))
    .orderBy(asc(galleryImages.order), asc(galleryImages.createdAt));

  if (imgs.length === 0) return [];

  const i18nRows = await db
    .select()
    .from(galleryImageI18n)
    .where(inArray(galleryImageI18n.imageId, imgs.map((i) => i.id)));

  const i18nByImage = new Map<string, Record<string, { alt: string; caption: string }>>();
  for (const r of i18nRows) {
    const m = i18nByImage.get(r.imageId) ?? {};
    m[r.lang] = { alt: r.alt, caption: r.caption };
    i18nByImage.set(r.imageId, m);
  }

  return imgs.map((img) => ({
    s3Key: img.s3Key,
    url: getCloudFrontUrl(img.s3Key),
    meta: (img.meta ?? {}) as GalleryImage["meta"],
    i18n: i18nByImage.get(img.id) ?? {},
  }));
}

/** Mirror the table into `blocks.config.images` so the tenant render (which
 *  reads the config blob) stays in sync with the authoritative tables. */
async function syncConfigFromTable(blockId: string, tenantId: string): Promise<GalleryImage[]> {
  const images = await getGalleryImages(blockId, tenantId);
  const [block] = await db.select({ config: blocks.config }).from(blocks).where(eq(blocks.id, blockId)).limit(1);
  const config = (block?.config ?? {}) as Record<string, unknown>;
  await db
    .update(blocks)
    .set({ config: { ...config, images }, updatedAt: new Date() })
    .where(eq(blocks.id, blockId));
  return images;
}

/** Delete one image (S3 + tables), tenant-scoped + authorized. */
export async function deleteGalleryImage(
  blockId: string,
  tenantId: string,
  s3Key: string,
): Promise<GalleryImage[]> {
  await assertCanEditContent(tenantId);
  if (!s3Key.startsWith(`${tenantId}/`)) {
    throw new Error("errors.image-not-belong");
  }
  try {
    await deleteS3Object(s3Key);
  } catch {
    // best-effort; still drop the DB rows
  }
  await db.delete(galleryImages).where(eq(galleryImages.s3Key, s3Key)); // cascade removes i18n
  const images = await syncConfigFromTable(blockId, tenantId);
  revalidate(tenantId);
  return images;
}

/** Persist a new order from the manager's drag-and-drop. */
export async function reorderGalleryImages(
  blockId: string,
  tenantId: string,
  orderedS3Keys: string[],
): Promise<GalleryImage[]> {
  await assertCanEditContent(tenantId);
  for (let i = 0; i < orderedS3Keys.length; i++) {
    await db
      .update(galleryImages)
      .set({ order: i, updatedAt: new Date() })
      .where(and(eq(galleryImages.tenantId, tenantId), eq(galleryImages.s3Key, orderedS3Keys[i])));
  }
  const images = await syncConfigFromTable(blockId, tenantId);
  revalidate(tenantId);
  return images;
}

/** Save captions for the given locale, then auto-translate to the other
 *  enabled languages (hybrid: short fields translate automatically on save). */
export async function saveGalleryCaptions(
  blockId: string,
  tenantId: string,
  locale: string,
  captions: Array<{ s3Key: string; caption: string }>,
): Promise<GalleryImage[]> {
  await assertCanEditContent(tenantId);

  for (const { s3Key, caption } of captions) {
    const [img] = await db
      .select({ id: galleryImages.id })
      .from(galleryImages)
      .where(and(eq(galleryImages.tenantId, tenantId), eq(galleryImages.s3Key, s3Key)))
      .limit(1);
    if (!img) continue;

    const [existing] = await db
      .select({ alt: galleryImageI18n.alt })
      .from(galleryImageI18n)
      .where(and(eq(galleryImageI18n.imageId, img.id), eq(galleryImageI18n.lang, locale)))
      .limit(1);
    const alt = existing?.alt ?? (s3Key.split("/").pop()?.replace(/\.[^.]+$/, "") || "Image");

    await db
      .insert(galleryImageI18n)
      .values({ imageId: img.id, lang: locale, caption, alt })
      .onConflictDoUpdate({
        target: [galleryImageI18n.imageId, galleryImageI18n.lang],
        set: { caption },
      });
  }

  // Hybrid auto-translate: fan the captions out to the other locales.
  try {
    const [tenant] = await db
      .select({ locales: tenants.locales })
      .from(tenants)
      .where(eq(tenants.id, tenantId))
      .limit(1);
    const toLangs = (tenant?.locales ?? []).filter((l) => l !== locale);
    if (toLangs.length > 0) {
      await triggerCaptionTranslation({ tenantId, blockId, fromLang: locale, toLangs });
    }
  } catch {
    // translation is best-effort; captions are already saved
  }

  const images = await syncConfigFromTable(blockId, tenantId);
  revalidate(tenantId);
  return images;
}
