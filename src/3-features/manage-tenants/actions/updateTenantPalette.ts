"use server";

import { assertCanManageStructure } from "@/5-shared/lib/auth/authorization";
import { db } from "@/5-shared/lib/db";
import { tenants } from "@/5-shared/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { isValidPaletteId } from "@/5-shared/lib/palettes/paletteRegistry";

export async function updateTenantPalette(tenantId: string, paletteId: string) {
  await assertCanManageStructure(tenantId);

  if (!isValidPaletteId(paletteId)) {
    throw new Error("errors.invalid-palette");
  }

  await db
    .update(tenants)
    .set({
      branding: sql`branding::jsonb || ${JSON.stringify({ palette: paletteId })}::jsonb`,
      updatedAt: new Date(),
    })
    .where(eq(tenants.id, tenantId));

  revalidatePath("/", "layout");
}
