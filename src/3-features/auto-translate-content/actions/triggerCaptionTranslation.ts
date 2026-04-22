"use server";

import { galleryImageI18n, galleryImages } from "@/4-entities/gallery/model/image";
import { db } from "@/5-shared/lib/db";
import { eq } from "drizzle-orm";
import { RateLimitError, translatePayload } from "../api/translateWithGemini";

export interface CaptionTranslationResult {
  succeeded: number;
  failed: number;
  remaining: number;
  rateLimitRetryAfter?: number;
}

/**
 * Auto-translate gallery image captions for all images in a block/tenant.
 * Only translates captions that are missing for a given language.
 * Processes a maximum of 30 captions per call.
 */
export async function triggerCaptionTranslation({
  tenantId,
  blockId,
  fromLang,
  toLangs,
}: {
  tenantId: string;
  blockId?: string; // If provided, only translate images in this block
  fromLang: string;
  toLangs: string[];
}): Promise<CaptionTranslationResult> {
  // Get all images for tenant (optionally filter by block)
  const imageQuery = db
    .select({
      id: galleryImages.id,
      blockId: galleryImages.blockId,
      s3Key: galleryImages.s3Key,
    })
    .from(galleryImages)
    .where(eq(galleryImages.tenantId, tenantId));
  const images = blockId
    ? (await imageQuery).filter((img) => img.blockId === blockId)
    : await imageQuery;

  // For each image, get the source caption and missing target langs
  let jobs: Array<{
    imageId: string;
    s3Key: string;
    sourceCaption: string;
    sourceAlt: string;
    fromLang: string;
    toLang: string;
  }> = [];

  for (const img of images) {
    // Get all i18n rows for this image
    const i18ns = await db
      .select({
        lang: galleryImageI18n.lang,
        caption: galleryImageI18n.caption,
        alt: galleryImageI18n.alt,
      })
      .from(galleryImageI18n)
      .where(eq(galleryImageI18n.imageId, img.id));
    const source = i18ns.find((row) => row.lang === fromLang);
    if (!source || !source.caption?.trim()) continue;
    for (const toLang of toLangs) {
      if (toLang === fromLang) continue;
      const exists = i18ns.find((row) => row.lang === toLang && row.caption?.trim());
      if (!exists) {
        jobs.push({
          imageId: img.id,
          s3Key: img.s3Key,
          sourceCaption: source.caption,
          sourceAlt: source.alt ?? "",
          fromLang,
          toLang,
        });
      }
    }
  }

  const BATCH_LIMIT = 30;
  const batch = jobs.slice(0, BATCH_LIMIT);
  let succeeded = 0;
  let failed = 0;

  for (const job of batch) {
    try {
      const translated = await translatePayload({
        payload: { caption: job.sourceCaption },
        sourceLocale: job.fromLang,
        targetLocale: job.toLang,
        context: `Image caption for a multilingual website`,
        category: "gallery_image",
      });
      await db
        .insert(galleryImageI18n)
        .values({
          imageId: job.imageId,
          lang: job.toLang,
          caption: translated.caption,
          alt: job.sourceAlt,
        })
        .onConflictDoUpdate({
          target: [galleryImageI18n.imageId, galleryImageI18n.lang],
          set: { caption: translated.caption, alt: job.sourceAlt },
        });
      succeeded++;
    } catch (err) {
      if (err instanceof RateLimitError) {
        return {
          succeeded,
          failed,
          remaining: jobs.length - succeeded,
          rateLimitRetryAfter: err.retryAfterSeconds,
        };
      }
      failed++;
    }
  }

  return { succeeded, failed, remaining: jobs.length - succeeded };
}
