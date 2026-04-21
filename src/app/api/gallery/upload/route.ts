import { galleryImageI18n, galleryImages } from "@/4-entities/gallery/model/image";
import { getTenantFromRequest } from "@/5-shared/api/tenant-context";
import { uploadToS3 } from "@/5-shared/lib/aws/s3";
import { db } from "@/5-shared/lib/db";
import { NextRequest, NextResponse } from "next/server";

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
  const alt = form.get("alt") as string;
  const caption = form.get("caption") as string;
  const blockId = form.get("blockId") as string;

  if (!file || !lang || !alt || !caption || !blockId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Generate unique filename
  const ext = file.name.split(".").pop();
  const filename = `${crypto.randomUUID()}.${ext}`;

  // Upload to S3
  const s3Key = await uploadToS3({
    tenantId,
    section: "gallery",
    filename,
    body: Buffer.from(await file.arrayBuffer()),
    contentType: file.type,
  });

  // Save to DB
  const [image] = await db
    .insert(galleryImages)
    .values({
      tenantId,
      blockId,
      s3Key,
      meta: { size: file.size, mime: file.type },
    })
    .returning();

  await db.insert(galleryImageI18n).values({
    imageId: image.id,
    lang,
    alt,
    caption,
  });

  return NextResponse.json({ success: true, image });
}
