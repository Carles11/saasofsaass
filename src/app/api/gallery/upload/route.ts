import { galleryImageI18n, galleryImages } from "@/4-entities/gallery/model/image";
import { getTenantFromRequest } from "@/5-shared/api/tenant-context";
import { assertCanEditContent } from "@/5-shared/lib/auth/authorization";
import { uploadToS3 } from "@/5-shared/lib/aws/s3";

import { generateImageDescriptionWithGemini } from "@/5-shared/lib/ai/generateImageDescriptionWithGemini";
import { getCloudFrontUrl } from "@/5-shared/lib/aws/cloudfront";
import { db } from "@/5-shared/lib/db";
import { tenants } from "@/5-shared/lib/db/schema";
import { generateSeoImageName } from "@/5-shared/lib/utils";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

// POST /api/gallery/upload
export async function POST(req: NextRequest) {
  const form = await req.formData();

  const file = form.get("file") as File;
  const lang = form.get("lang") as string;
  let alt = form.get("alt") as string | null;
  let caption = form.get("caption") as string | null;
  const blockId = form.get("blockId") as string;
  const explicitTenantId = form.get("tenantId") as string | null;

  if (!file || !lang || !blockId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Prefer explicit tenantId + dashboard authorization (host-based resolution is
  // unreliable from app.localhost); fall back to host resolution otherwise.
  let tenant: { id: string; name: string } | null = null;
  if (explicitTenantId) {
    try {
      await assertCanEditContent(explicitTenantId);
    } catch {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const [t] = await db
      .select({ id: tenants.id, name: tenants.name })
      .from(tenants)
      .where(eq(tenants.id, explicitTenantId))
      .limit(1);
    tenant = t ?? null;
  } else {
    const resolved = await getTenantFromRequest(req);
    tenant = resolved.tenant ? { id: resolved.tenant.id, name: resolved.tenant.name } : null;
  }
  if (!tenant) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const tenantId = tenant.id;

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

  // Generate SEO-optimized filename (always .webp)
  // Use alt/caption if available, else fallback to Gemini-generated or filename
  const blockType = "image-gallery";
  const tenantCategory = "general";
  const tenantName = tenant.name || "tenant";

  // If alt/caption are missing or empty, generate them with Gemini
  if (!alt || !caption || !alt.trim() || !caption.trim()) {
    try {
      // If you want to fetch block type from DB, uncomment below:
      // const block = await db.query.blocks.findFirst({ where: (b) => b.id.eq(blockId) });
      // if (block?.type) blockType = block.type;
    } catch {}
    try {
      const desc = await generateImageDescriptionWithGemini({
        filename: "image", // placeholder, not used for name
        blockType,
        tenantCategory,
        extraContext: `Tenant: ${tenantName}`,
      });
      if (!alt || !alt.trim()) alt = desc.alt;
      if (!caption || !caption.trim()) caption = desc.caption;
    } catch (err) {
      // Fallback: if Gemini fails, use generic
      if (!alt || !alt.trim()) alt = "image";
      if (!caption || !caption.trim()) caption = "image";
    }
  }

  // Only fallback to generic if alt is still empty
  if (!alt || !alt.trim()) {
    alt = "image";
  }

  // Generate SEO filename from alt/caption/context
  const filename = generateSeoImageName({
    title: alt || caption || undefined,
    blockType,
    tenantCategory,
    tenantName,
    ext: "webp",
  });

  // If alt/caption are missing or empty, generate them with Gemini
  if (!alt || !caption || !alt.trim() || !caption.trim()) {
    // Try to get block type for context (optional, fallback to 'image-gallery')
    const blockType = "image-gallery";
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

  // Return the uploaded image info with real CDN URL
  const imageUrl = getCloudFrontUrl(s3Key);
  return NextResponse.json({ success: true, image: { ...image, url: imageUrl } });
}
