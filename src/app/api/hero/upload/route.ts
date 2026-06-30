import { heroImageI18n, heroImages } from "@/4-entities/hero/model/image";
import { getTenantFromRequest } from "@/5-shared/api/tenant-context";
import { assertCanEditContent } from "@/5-shared/lib/auth/authorization";
import { generateImageDescriptionWithGemini } from "@/5-shared/lib/ai/generateImageDescriptionWithGemini";
import { getCloudFrontUrl } from "@/5-shared/lib/aws/cloudfront";
import { uploadToS3 } from "@/5-shared/lib/aws/s3";
import { db } from "@/5-shared/lib/db";
import { tenants } from "@/5-shared/lib/db/schema";
import { generateSeoImageName } from "@/5-shared/lib/utils";
import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm/sql/sql";
import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

// POST /api/hero/upload
export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get("file") as File;
  let alt = form.get("alt") as string | null;
  const explicitTenantId = form.get("tenantId") as string | null;
  const section = (form.get("section") as string | null) || "hero";

  if (!file) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  // Prefer explicit tenantId + dashboard authorization (host resolution is
  // unreliable from app.localhost); fall back to host-based resolution.
  let tenant: { id: string; name: string; locales: string[]; defaultLocale: string } | null = null;
  if (explicitTenantId) {
    try {
      await assertCanEditContent(explicitTenantId);
    } catch {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const [t] = await db
      .select({ id: tenants.id, name: tenants.name, locales: tenants.locales, defaultLocale: tenants.defaultLocale })
      .from(tenants)
      .where(eq(tenants.id, explicitTenantId))
      .limit(1);
    tenant = t ?? null;
  } else {
    const resolved = await getTenantFromRequest(req);
    tenant = resolved.tenant
      ? { id: resolved.tenant.id, name: resolved.tenant.name, locales: resolved.tenant.locales, defaultLocale: resolved.tenant.defaultLocale }
      : null;
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

  // Generate SEO-optimized filename (always .webp)
  const tenantCategory = "general";
  const tenantName = tenant.name || "tenant";

  if (!alt || !alt.trim()) alt = "hero image in saasofsaass.com for " + tenantName;

  const filename = generateSeoImageName({
    title: alt,
    blockType: "hero",
    tenantCategory,
    tenantName,
    ext: "webp",
  });

  // Upload processed image to S3 (section folder, e.g. 'hero' or 'cta-banner')
  const s3Key = await uploadToS3({
    tenantId,
    section,
    filename,
    body: processedBuffer,
    contentType: "image/webp",
  });

  // Save to DB with all meta
  const [image] = await db
    .insert(heroImages)
    .values({
      tenantId,
      s3Key,
      meta: {
        width: processedMeta.width,
        height: processedMeta.height,
        size: processedBuffer.length,
        mime: "image/webp",
      },
    })
    .onConflictDoUpdate({
      target: [heroImages.s3Key],
      set: {
        meta: {
          width: processedMeta.width,
          height: processedMeta.height,
          size: processedBuffer.length,
          mime: "image/webp",
        },
        updatedAt: new Date(),
      },
    })
    .returning();

  // Generate alt text for all tenant languages using Gemini
  const altTexts: { [lang: string]: string } = {};
  const locales: string[] = tenant.locales || [tenant.defaultLocale || "en"];
  for (const lang of locales) {
    let altText = alt;
    // Only generate with Gemini if not provided or not for default locale
    if (!altText || !altText.trim() || lang !== tenant.defaultLocale) {
      try {
        const desc = await generateImageDescriptionWithGemini({
          filename,
          blockType: "hero",
          tenantCategory,
          extraContext: `Tenant: ${tenantName}, Language: ${lang}`,
        });
        altText = desc.alt;
      } catch (err) {
        altText = alt || "hero";
      }
    }
    altTexts[lang] = altText;
  }

  // Insert alt text for all languages

  await db
    .insert(heroImageI18n)
    .values(
      locales.map((lang) => ({
        imageId: image.id,
        lang,
        alt: altTexts[lang] || "hero",
      }))
    )
    .onConflictDoUpdate({
      target: [heroImageI18n.imageId, heroImageI18n.lang],
      set: { alt: sql`excluded.alt` },
    });

  // Return the uploaded image info with real CDN URL
  const imageUrl = getCloudFrontUrl(s3Key);
  return NextResponse.json({
    success: true,
    heroImage: {
      url: imageUrl,
      s3Key,
      alt: altTexts[tenant.defaultLocale] || alt || "hero",
      meta: { width: processedMeta.width, height: processedMeta.height },
      i18n: altTexts,
    },
  });
}
