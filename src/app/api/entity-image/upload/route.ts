import { assertCanEditContent } from "@/5-shared/lib/auth/authorization";
import { getCloudFrontUrl } from "@/5-shared/lib/aws/cloudfront";
import { uploadToS3 } from "@/5-shared/lib/aws/s3";
import { db } from "@/5-shared/lib/db";
import { tenantEntities } from "@/5-shared/lib/db/schema";
import { generateSeoImageName } from "@/5-shared/lib/utils";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

/** Map an entity kind to a meaningfully-named S3 folder. */
const SECTION_BY_KIND: Record<string, string> = {
  blog_post: "blog",
  award_item: "awards",
  podcast_episode: "podcast",
};

// POST /api/entity-image/upload  — form: { file, tenantId, entityId }
export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get("file") as File | null;
  const tenantId = form.get("tenantId") as string | null;
  const entityId = form.get("entityId") as string | null;

  if (!file || !tenantId || !entityId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Authorize against the dashboard session (host-independent).
  try {
    await assertCanEditContent(tenantId);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [entity] = await db
    .select({ id: tenantEntities.id, kind: tenantEntities.kind })
    .from(tenantEntities)
    .where(and(eq(tenantEntities.id, entityId), eq(tenantEntities.tenantId, tenantId)))
    .limit(1);
  if (!entity) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }
  const section = SECTION_BY_KIND[entity.kind] ?? "entity";

  // Process: auto-rotate, cap at 2000px, webp, strip EXIF.
  const buffer = Buffer.from(await file.arrayBuffer());
  let img = sharp(buffer).rotate();
  const meta = await img.metadata();
  const maxDim = 2000;
  if (meta.width && meta.height && (meta.width > maxDim || meta.height > maxDim)) {
    img = img.resize({
      width: meta.width > meta.height ? maxDim : undefined,
      height: meta.height >= meta.width ? maxDim : undefined,
      fit: "inside",
      withoutEnlargement: true,
    });
  }
  const processed = await img.webp({ quality: 85 }).withMetadata({ exif: undefined }).toBuffer();

  const filename = generateSeoImageName({
    title: file.name?.replace(/\.[^.]+$/, "") || section,
    blockType: section,
    tenantCategory: "general",
    tenantName: "tenant",
    ext: "webp",
  });

  const s3Key = await uploadToS3({
    tenantId,
    section,
    filename,
    body: processed,
    contentType: "image/webp",
  });
  const url = getCloudFrontUrl(s3Key);

  await db
    .update(tenantEntities)
    .set({ coverImageUrl: url, updatedAt: new Date() })
    .where(eq(tenantEntities.id, entityId));

  return NextResponse.json({ success: true, url, s3Key });
}
