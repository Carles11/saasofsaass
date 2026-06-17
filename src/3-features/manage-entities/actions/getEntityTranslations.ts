"use server";

import { db } from "@/5-shared/lib/db";
import { tenantTranslations } from "@/5-shared/lib/db/schema";
import { and, eq, inArray } from "drizzle-orm";

export interface EntityTranslationRow {
  entityId: string;
  payload: Record<string, string>;
  translationStatus: string;
  locale: string;
}

export async function getEntityTranslations(
  tenantId: string,
  entityIds: string[],
  locale: string,
): Promise<EntityTranslationRow[]> {
  if (entityIds.length === 0) return [];

  const rows = await db
    .select({
      entityId: tenantTranslations.entityId,
      payload: tenantTranslations.payload,
      translationStatus: tenantTranslations.translationStatus,
      locale: tenantTranslations.locale,
    })
    .from(tenantTranslations)
    .where(
      and(
        eq(tenantTranslations.tenantId, tenantId),
        inArray(tenantTranslations.entityId, entityIds),
        eq(tenantTranslations.locale, locale),
      ),
    );

  return rows.map((r) => ({
    entityId: r.entityId,
    payload: r.payload as Record<string, string>,
    translationStatus: r.translationStatus,
    locale: r.locale,
  }));
}
