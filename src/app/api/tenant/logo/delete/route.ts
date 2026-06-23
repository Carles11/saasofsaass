import { deleteS3Object } from "@/5-shared/lib/aws/s3";
import { db } from "@/5-shared/lib/db";
import { tenants } from "@/5-shared/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest) {
  const url = new URL(req.url);
  const s3Key = url.searchParams.get("s3Key");
  const tenantId = url.searchParams.get("tenantId");

  if (!tenantId || !s3Key) {
    return NextResponse.json({ error: "Missing tenantId or s3Key" }, { status: 400 });
  }

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(tenantId)) {
    return NextResponse.json({ error: "Invalid tenantId" }, { status: 400 });
  }

  if (!s3Key.startsWith(`${tenantId}/logo/`)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await deleteS3Object(s3Key);
  } catch (err) {
    console.error("Failed to delete S3 object", err);
  }

  // Fetch current branding to preserve other fields, then remove logo
  const [tenant] = await db
    .select({ branding: tenants.branding })
    .from(tenants)
    .where(eq(tenants.id, tenantId))
    .limit(1);

  const branding = (tenant?.branding ?? {}) as Record<string, unknown>;
  delete branding.logo;

  await db
    .update(tenants)
    .set({ branding: branding as any, updatedAt: new Date() })
    .where(eq(tenants.id, tenantId));

  return NextResponse.json({ success: true });
}
