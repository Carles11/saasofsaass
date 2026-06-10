import { triggerCaptionTranslation } from "@/3-features/auto-translate-content/actions/triggerCaptionTranslation";
import { galleryImageI18n, galleryImages } from "@/4-entities/gallery/model/image";
import { db } from "@/5-shared/lib/db";
import { blocks, tenants } from "@/5-shared/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// POST /api/gallery/captions
export async function POST(req: NextRequest) {
  try {
    const { blockId, captions, locale } = await req.json();
    if (!blockId || !Array.isArray(captions) || !locale) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Get block and tenant
    const blockArr = await db.select().from(blocks).where(eq(blocks.id, blockId)).limit(1);
    const block = blockArr[0];
    if (!block) return NextResponse.json({ error: "Block not found" }, { status: 404 });
    const tenantArr = await db
      .select()
      .from(tenants)
      .where(eq(tenants.id, block.tenantId))
      .limit(1);
    const tenant = tenantArr[0];
    if (!tenant) return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    const tenantLocales = tenant.locales;
    if (!tenantLocales || tenantLocales.length === 0) {
      return NextResponse.json({ error: "No locales found for tenant" }, { status: 400 });
    }

    // Update captions for the provided lang (locale)
    for (const { s3Key, caption } of captions) {
      // Find image id
      const imgArr = await db
        .select()
        .from(galleryImages)
        .where(eq(galleryImages.s3Key, s3Key))
        .limit(1);
      if (!imgArr[0]) continue;
      const imageId = imgArr[0].id;
      // Fetch existing alt for this image/lang
      const i18nArr = await db
        .select()
        .from(galleryImageI18n)
        .where(and(eq(galleryImageI18n.imageId, imageId), eq(galleryImageI18n.lang, locale)))
        .limit(1);
      const existingAlt = i18nArr[0]?.alt;
      // Only set alt if not present; otherwise, preserve
      const alt =
        existingAlt ??
        (s3Key
          .split("/")
          .pop()
          ?.replace(/\.[^.]+$/, "") ||
          "Image");
      await db
        .insert(galleryImageI18n)
        .values({ imageId, lang: locale, caption, alt })
        .onConflictDoUpdate({
          target: [galleryImageI18n.imageId, galleryImageI18n.lang],
          set: { caption }, // Only update caption, not alt
        });
    }

    // Auto-translate gallery image captions and alt for all locales
    await triggerCaptionTranslation({
      tenantId: tenant.id,
      blockId,
      fromLang: locale,
      toLangs: tenantLocales.filter((l: string) => l !== locale),
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal error" }, { status: 500 });
  }
}
