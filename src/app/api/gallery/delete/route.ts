import { galleryImages } from "@/4-entities/gallery/model/image";
import { getTenantFromRequest } from "@/5-shared/api/tenant-context";
import { deleteS3Object } from "@/5-shared/lib/aws/s3";
import { db } from "@/5-shared/lib/db";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// DELETE /api/gallery/delete
export async function DELETE(req: NextRequest) {
  const { tenant } = await getTenantFromRequest(req);
  if (!tenant) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const s3Key = url.searchParams.get("s3Key");
  if (!s3Key) return NextResponse.json({ error: "Missing s3Key" }, { status: 400 });
  console.log("Delete request for s3Key:", s3Key, "tenant:", tenant.id);
  // Enforce tenant isolation
  if (!s3Key.startsWith(`${tenant.id}/gallery/`)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Find image in DB
  const image = await db
    .select()
    .from(galleryImages)
    .where(eq(galleryImages.s3Key, s3Key))
    .limit(1);
  if (!image.length) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Delete from S3
  try {
    await deleteS3Object(s3Key);
  } catch (err) {
    // Log but continue to DB delete
    console.error("Failed to delete S3 object", err);
  }

  // Delete from DB (CASCADE will remove i18n)
  await db.delete(galleryImages).where(eq(galleryImages.s3Key, s3Key));

  return NextResponse.json({ success: true });
}
