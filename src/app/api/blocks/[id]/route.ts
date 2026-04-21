import { db } from "@/5-shared/lib/db";
import { NextRequest, NextResponse } from "next/server";

// Next.js 13/14/16 app router API route signature
export async function GET(req: NextRequest, context: { params: { id: string } }) {
  // context.params may be a Promise in Next.js 16, so unwrap if needed
  const params = await context.params;
  const id = params?.id;
  if (!id) return NextResponse.json({ error: "Missing block id" }, { status: 400 });
  const block = await db.query.blocks.findFirst({ where: (b, { eq }) => eq(b.id, id) });
  if (!block) return NextResponse.json({ error: "Block not found" }, { status: 404 });
  return NextResponse.json({ block });
}
