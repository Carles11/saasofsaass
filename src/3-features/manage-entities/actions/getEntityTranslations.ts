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

/** All locale rows for a single entity (used by the per-item editor's tabs). */
export async function getEntityAllTranslations(
  tenantId: string,
  entityId: string,
): Promise<EntityTranslationRow[]> {
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
        eq(tenantTranslations.entityId, entityId),
      ),
    );

  return rows.map((r) => ({
    entityId: r.entityId,
    payload: r.payload as Record<string, string>,
    translationStatus: r.translationStatus,
    locale: r.locale,
  }));
}
