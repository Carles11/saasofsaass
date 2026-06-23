import { getCloudFrontUrl } from "@/5-shared/lib/aws/cloudfront";
import { uploadToS3 } from "@/5-shared/lib/aws/s3";
import { db } from "@/5-shared/lib/db";
import { tenants } from "@/5-shared/lib/db/schema";
import { generateSeoImageName } from "@/5-shared/lib/utils";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get("file") as File;
  const linkUrl = form.get("linkUrl") as string | null;
  const tenantId = form.get("tenantId") as string;

  if (!tenantId || !file) {
    return NextResponse.json({ error: "Missing tenantId or file" }, { status: 400 });
  }

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(tenantId)) {
    return NextResponse.json({ error: "Invalid tenantId" }, { status: 400 });
  }

  const fileBuffer = Buffer.from(await file.arrayBuffer());

  let sharpImg = sharp(fileBuffer).rotate();

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

  sharpImg = sharpImg.webp({ quality: 85 });
  sharpImg = sharpImg.withMetadata({ exif: undefined });

  const processedBuffer = await sharpImg.toBuffer();

  // Use timestamp to ensure unique filename and bust CDN cache
  const timestamp = Date.now();
  const filename = generateSeoImageName({
    title: `logo-${timestamp}`,
    blockType: "tenant",
    ext: "webp",
  });

  const s3Key = await uploadToS3({
    tenantId,
    section: "logo",
    filename,
    body: processedBuffer,
    contentType: "image/webp",
  });

  const baseUrl = getCloudFrontUrl(s3Key);
  const logoUrl = `${baseUrl}?t=${timestamp}`;

  // Fetch current branding to preserve other fields
  const [tenant] = await db
    .select({ branding: tenants.branding })
    .from(tenants)
    .where(eq(tenants.id, tenantId))
    .limit(1);

  const branding = (tenant?.branding ?? {}) as Record<string, unknown>;
  branding.logo = { url: logoUrl, s3Key, ...(linkUrl ? { linkUrl } : {}) };

  await db
    .update(tenants)
    .set({ branding: branding as any, updatedAt: new Date() })
    .where(eq(tenants.id, tenantId));

  return NextResponse.json({ success: true, logo: { url: logoUrl, s3Key } });
}
