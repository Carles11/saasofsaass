import { galleryImageI18n, galleryImages } from "@/4-entities/gallery/model/image";
import { getTenantFromRequest } from "@/5-shared/api/tenant-context";
import { uploadToS3 } from "@/5-shared/lib/aws/s3";
import { db } from "@/5-shared/lib/db";
import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

import { generateImageDescriptionWithGemini } from "@/5-shared/lib/ai/generateImageDescriptionWithGemini";

// POST /api/gallery/upload
export async function POST(req: NextRequest) {
  // Resolve tenant from request (host header)
  const { tenant } = await getTenantFromRequest(req);
  if (!tenant) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const tenantId = tenant.id;

  const form = await req.formData();
  console.log("Received upload request with form data:", {
    fields: {
      lang: form.get("lang"),
      alt: form.get("alt"),
      caption: form.get("caption"),
      blockId: form.get("blockId"),
    },
  });

  const file = form.get("file") as File;
  const lang = form.get("lang") as string;
  let alt = form.get("alt") as string | null;
  let caption = form.get("caption") as string | null;
  const blockId = form.get("blockId") as string;

  if (!file || !lang || !blockId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Read file buffer
  const fileBuffer = Buffer.from(await file.arrayBuffer());

  // Use sharp for processing: auto-rotate, resize, convert to webp, strip metadata, get dimensions
  let sharpImg = sharp(fileBuffer).rotate();

  // Resize if too large (max 2000px width or height)
  const metadata = await sharpImg.metadata();
  const maxDim = 2000;
  if (metadata.width && metadata.height && (metadata.width > maxDim || metadata.height > maxDim)) {
    sharpImg = sharpImg.resize({
      width: metadata.width > metadata.height ? maxDim : undefined,
      height: metadata.height >= metadata.width ? maxDim : undefined,
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  // Convert to webp for space savings
  sharpImg = sharpImg.webp({ quality: 85 });

  // Strip all metadata (EXIF, GPS, etc)
  sharpImg = sharpImg.withMetadata({ exif: undefined });

  // Get processed buffer and new dimensions
  const processedBuffer = await sharpImg.toBuffer();
  const processedMeta = await sharp(processedBuffer).metadata();

  // Generate blurred placeholder (base64-encoded tiny webp)
  const blurBuffer = await sharp(processedBuffer)
    .resize(16, 16, { fit: "inside" })
    .webp({ quality: 30 })
    .toBuffer();
  const blurDataUrl = `data:image/webp;base64,${blurBuffer.toString("base64")}`;

  // Generate unique filename (always .webp)
  const filename = `${crypto.randomUUID()}.webp`;

  // If alt/caption are missing or empty, generate them with Gemini
  if (!alt || !caption || !alt.trim() || !caption.trim()) {
    // Try to get block type for context (optional, fallback to 'image-gallery')
    let blockType = "image-gallery";
    let tenantCategory = tenant.category || "general";
    try {
      // If you want to fetch block type from DB, uncomment below:
      // const block = await db.query.blocks.findFirst({ where: (b) => b.id.eq(blockId) });
      // if (block?.type) blockType = block.type;
    } catch {}
    try {
      const desc = await generateImageDescriptionWithGemini({
        filename,
        blockType,
        tenantCategory,
        extraContext: `Tenant: ${tenant.name}`,
      });
      if (!alt || !alt.trim()) alt = desc.alt;
      if (!caption || !caption.trim()) caption = desc.caption;
    } catch (err) {
      // Fallback: if Gemini fails, use filename as alt/caption
      if (!alt || !alt.trim()) alt = filename.replace(/\.[^.]+$/, "");
      if (!caption || !caption.trim()) caption = filename.replace(/\.[^.]+$/, "");
    }
  }

  // Only fallback to filename if alt is still empty
  if (!alt || !alt.trim()) {
    alt = filename.replace(/\.[^.]+$/, "");
  }

  // Upload processed image to S3
  const s3Key = await uploadToS3({
    tenantId,
    section: "gallery",
    filename,
    body: processedBuffer,
    contentType: "image/webp",
  });

  // Save to DB with all meta
  const [image] = await db
    .insert(galleryImages)
    .values({
      tenantId,
      blockId,
      s3Key,
      meta: {
        width: processedMeta.width,
        height: processedMeta.height,
        size: processedBuffer.length,
        mime: "image/webp",
        blurDataUrl,
      },
    })
    .returning();

  await db.insert(galleryImageI18n).values({
    imageId: image.id,
    lang,
    alt: alt ?? "",
    caption: caption ?? "",
  });

  return NextResponse.json({ success: true, image });
}
