"use server";

import { assertCanManageStructure } from "@/5-shared/lib/auth/authorization";
import { db } from "@/5-shared/lib/db";
import { tenants } from "@/5-shared/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import {
  AVAILABLE_TITLE_FONTS,
  AVAILABLE_BODY_FONTS,
  getFontVariable,
} from "@/5-shared/lib/fonts/fontRegistry";

export async function updateTenantFonts(
  tenantId: string,
  titleFontId: string,
  bodyFontId: string,
) {
  await assertCanManageStructure(tenantId);

  const titleVar = getFontVariable(titleFontId);
  const bodyVar = getFontVariable(bodyFontId);

  if (!titleVar || !AVAILABLE_TITLE_FONTS.some((f) => f.id === titleFontId)) {
    throw new Error("errors.invalid-title-font");
  }
  if (!bodyVar || !AVAILABLE_BODY_FONTS.some((f) => f.id === bodyFontId)) {
    throw new Error("errors.invalid-body-font");
  }

  const fontHeading = `var(${titleVar})`;
  const fontBody = `var(${bodyVar})`;

  await db
    .update(tenants)
    .set({
      branding: sql`branding::jsonb || ${JSON.stringify({ fontHeading, fontBody })}::jsonb`,
      updatedAt: new Date(),
    })
    .where(eq(tenants.id, tenantId));

  revalidatePath("/", "layout");
}
