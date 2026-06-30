"use server";

import { db } from "@/5-shared/lib/db";
import { tenantEntities, tenants, tenantTranslations } from "@/5-shared/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { RateLimitError, translatePayload, TranslationError } from "../api/translateWithGemini";
import { assertCanEditContent } from "@/5-shared/lib/auth/authorization";
import { getAiQuota, incrementAiBlocksUsed } from "@/5-shared/lib/billing/workspace";
import type { BlockTranslationResult } from "./triggerBlockTranslation";

const RATE_LIMIT_DELAY_MS = 150;

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Item-scoped translation: translate a single entity's pending/failed locales
 * from its best source locale. Mirrors the entity-job path of
 * triggerBlockTranslation but scoped to one entity (used by the per-item
 * editor's Auto-Translate button and the hybrid auto-translate-on-save flow).
 */
export async function triggerEntityTranslation(
  entityId: string,
  tenantId: string,
): Promise<BlockTranslationResult> {
  await assertCanEditContent(tenantId);

  const [tenant] = await db
    .select({
      name: tenants.name,
      defaultLocale: tenants.defaultLocale,
      locales: tenants.locales,
    })
    .from(tenants)
    .where(eq(tenants.id, tenantId))
    .limit(1);
  if (!tenant) throw new Error("Tenant not found");

  const quota = await getAiQuota(tenantId);
  if (quota.remaining <= 0) {
    return { succeeded: 0, failed: 0, remaining: 0, totalJobCount: 0, quotaReached: true };
  }

  // All translation rows for this entity (+ its kind for context).
  const allRows = await db
    .select({
      id: tenantTranslations.id,
      locale: tenantTranslations.locale,
      payload: tenantTranslations.payload,
      translationStatus: tenantTranslations.translationStatus,
      isLocked: tenantTranslations.isLocked,
      kind: tenantEntities.kind,
    })
    .from(tenantTranslations)
    .innerJoin(tenantEntities, eq(tenantTranslations.entityId, tenantEntities.id))
    .where(
      and(eq(tenantTranslations.entityId, entityId), eq(tenantTranslations.tenantId, tenantId)),
    );

  // Pick the source: first locale (default first) with non-empty content.
  const localeOrder = [
    tenant.defaultLocale,
    ...tenant.locales.filter((l) => l !== tenant.defaultLocale),
  ];
  let source: (typeof allRows)[number] | undefined;
  for (const loc of localeOrder) {
    const candidate = allRows.find((r) => r.locale === loc);
    const p = (candidate?.payload ?? {}) as Record<string, string>;
    if (candidate && Object.values(p).some((v) => typeof v === "string" && v.trim().length > 0)) {
      source = candidate;
      break;
    }
  }

  if (!source) {
    return { succeeded: 0, failed: 0, remaining: 0, totalJobCount: 0, needsSeed: true };
  }

  const sourcePayload = source.payload as Record<string, string>;
  const targets = allRows.filter(
    (r) =>
      r.locale !== source!.locale &&
      !r.isLocked &&
      (r.translationStatus === "pending" || r.translationStatus === "failed"),
  );

  const totalJobs = targets.length;
  const runLimit = Number.isFinite(quota.remaining)
    ? Math.min(totalJobs, quota.remaining)
    : totalJobs;
  const batch = targets.slice(0, runLimit);

  let succeeded = 0;
  let failed = 0;
  const context = `${source.kind.replace("_", " ")} on "${tenant.name}"`;

  for (let i = 0; i < batch.length; i++) {
    const job = batch[i];
    try {
      const translated = await translatePayload({
        payload: sourcePayload,
        sourceLocale: source.locale,
        targetLocale: job.locale,
        context,
      });
      await db
        .update(tenantTranslations)
        .set({ payload: translated, translationStatus: "translated", updatedAt: new Date() })
        .where(eq(tenantTranslations.id, job.id));
      succeeded++;
    } catch (err) {
      if (err instanceof RateLimitError) {
        if (quota.workspaceId) await incrementAiBlocksUsed(quota.workspaceId, succeeded);
        revalidatePath(`/[locale]/dashboard/site-builder/${tenantId}`, "page");
        return {
          succeeded,
          failed,
          remaining: totalJobs - succeeded,
          totalJobCount: totalJobs,
          rateLimitRetryAfter: err.retryAfterSeconds,
        };
      }
      if (err instanceof TranslationError) {
        await db
          .update(tenantTranslations)
          .set({ translationStatus: "failed", updatedAt: new Date() })
          .where(eq(tenantTranslations.id, job.id));
      }
      failed++;
    }
    if (i < batch.length - 1) await wait(RATE_LIMIT_DELAY_MS);
  }

  if (quota.workspaceId) await incrementAiBlocksUsed(quota.workspaceId, succeeded);
  revalidatePath(`/[locale]/dashboard/site-builder/${tenantId}`, "page");

  const remaining = Math.max(0, totalJobs - batch.length);
  const quotaReached =
    Number.isFinite(quota.remaining) && succeeded >= quota.remaining && remaining > 0;

  return { succeeded, failed, remaining, totalJobCount: totalJobs, quotaReached };
}
