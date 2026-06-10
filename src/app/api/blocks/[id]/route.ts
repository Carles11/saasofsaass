import { galleryImageI18n, galleryImages } from "@/4-entities/gallery/model/image";
import { db } from "@/5-shared/lib/db";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const id = params?.id;
  if (!id) return NextResponse.json({ error: "Missing block id" }, { status: 400 });
  const block = await db.query.blocks.findFirst({ where: (b, { eq }) => eq(b.id, id) });
  if (!block) return NextResponse.json({ error: "Block not found" }, { status: 404 });

  // If this is an image-gallery block, hydrate images and i18n captions from DB
  if (block.type === "image-gallery") {
    // Get all images for this block
    const images = await db.select().from(galleryImages).where(eq(galleryImages.blockId, id));
    // For each image, get all i18n rows
    const imageIds = images.map((img) => img.id);
    let i18nRows: any[] = [];
    if (imageIds.length > 0) {
      // Use inArray for Drizzle ORM
      const { inArray } = await import("drizzle-orm/sql/expressions/conditions");
      i18nRows = await db
        .select()
        .from(galleryImageI18n)
        .where(inArray(galleryImageI18n.imageId, imageIds));
    }
    // Compose GalleryImage[] with i18n
    const galleryImagesOut = images.map((img) => {
      const i18n: Record<string, { alt: string; caption: string }> = {};
      i18nRows
        .filter((row) => row.imageId === img.id)
        .forEach((row) => {
          i18n[row.lang] = { alt: row.alt, caption: row.caption };
        });
      return {
        s3Key: img.s3Key,
        meta: img.meta || {},
        i18n,
      };
    });
    // Patch config to always return up-to-date images
    const config = { ...(block.config ?? {}), images: galleryImagesOut };
    return NextResponse.json({ block: { ...block, config } });
  }

  return NextResponse.json({ block });
}
