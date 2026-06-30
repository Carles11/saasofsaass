"use server";

import { db } from "@/5-shared/lib/db";
import { donations } from "@/5-shared/lib/db/schema";
import { assertCanEditContent } from "@/5-shared/lib/auth/authorization";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type DonationFields = {
  paypalUrl?: string;
  bankAccountIban?: string;
  bankAccountSwift?: string;
  bankAccountHolder?: string;
  bankName?: string;
  bizumPhone?: string;
  venmoUsername?: string;
  giftlistUrl?: string;
  honeymoonFundUrl?: string;
  otherMethodUrl?: string;
  otherMethodDesc?: string;
};

export async function getDonations(blockId: string, tenantId: string) {
  await assertCanEditContent(tenantId);

  const [row] = await db
    .select()
    .from(donations)
    .where(
      and(eq(donations.blockId, blockId), eq(donations.tenantId, tenantId)),
    )
    .limit(1);

  return row ?? null;
}

export async function saveDonations(
  blockId: string,
  tenantId: string,
  data: DonationFields,
) {
  await assertCanEditContent(tenantId);

  const clean: Record<string, string | null> = {};
  for (const [key, val] of Object.entries(data)) {
    clean[key] = typeof val === "string" && val.trim() ? val.trim() : null;
  }

  const existing = await db
    .select({ id: donations.id })
    .from(donations)
    .where(
      and(eq(donations.blockId, blockId), eq(donations.tenantId, tenantId)),
    )
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(donations)
      .set({ ...clean, updatedAt: new Date() })
      .where(eq(donations.id, existing[0].id));
  } else {
    await db.insert(donations).values({
      blockId,
      tenantId,
      ...clean,
    } as typeof donations.$inferInsert);
  }

  revalidatePath(`/[locale]/dashboard/site-builder/${tenantId}`, "page");
}
