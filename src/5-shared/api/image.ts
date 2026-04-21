import { galleryImages } from "@/4-entities/gallery/model/image";
import { getTenantFromRequest } from "@/5-shared/api/tenant-context";
import { getS3ObjectStream, headS3Object } from "@/5-shared/lib/aws/s3";
import { db } from "@/5-shared/lib/db";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// GET /api/image?key=tenantId/gallery/filename.jpg
export async function GET(req: NextRequest) {
  const { tenant } = await getTenantFromRequest(req);
  if (!tenant) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(req.url);
  const s3Key = url.searchParams.get("key");
  if (!s3Key) return NextResponse.json({ error: "Missing key" }, { status: 400 });

  // Enforce tenant isolation
  if (!s3Key.startsWith(`${tenant.id}/gallery/`)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Optionally: check DB for image existence (security/quota)
  const image = await db
    .select()
    .from(galleryImages)
    .where(eq(galleryImages.s3Key, s3Key))
    .limit(1);
  if (!image.length) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Get S3 object headers for content-type, etc.
  let contentType = "application/octet-stream";
  try {
    const head = await headS3Object(s3Key);
    if (head.ContentType) contentType = head.ContentType;
  } catch {}

  // Stream from S3
  const stream = await getS3ObjectStream(s3Key);
  if (!stream) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return new NextResponse(stream as any, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
