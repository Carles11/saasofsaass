"use server";

import { db } from "@/5-shared/lib/db";
import { blocks, tenantEntities, tenants, tenantTranslations } from "@/5-shared/lib/db/schema";
import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { RateLimitError, translatePayload, TranslationError } from "../api/translateWithGemini";
import { assertCanEditContent } from "@/5-shared/lib/auth/authorization";

const BATCH_LIMIT = 30;
const RATE_LIMIT_DELAY_MS = 150;

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface TranslationResult {
  succeeded: number;
  failed: number;
  remaining: number;
  totalJobCount: number;
  needsSeed?: boolean;
  rateLimitRetryAfter?: number;
}

type EntityJob = {
  kind: "entity";
  translationId: string;
  entityId: string;
  sourceLocale: string;
  targetLocale: string;
  sourcePayload: Record<string, string>;
  entityKind: string;
};

type BlockJob = {
  kind: "block";
  blockId: string;
  blockType: string;
  sourceLocale: string;
  targetLocale: string;
  sourcePayload: Record<string, string>;
  allTranslations: Record<string, Record<string, string>>;
};

type Job = EntityJob | BlockJob;

/**
 * Find all pending translation rows for a tenant and auto-translate them with Gemini.
 * Processes a maximum of 30 rows per call. Re-trigger to process remaining rows.
 * Returns { succeeded, failed, remaining }.
 */
export async function triggerTenantTranslation(tenantId: string): Promise<TranslationResult> {
  await assertCanEditContent(tenantId);

  const [tenant] = await db
    .select({
      id: tenants.id,
      name: tenants.name,
      defaultLocale: tenants.defaultLocale,
      locales: tenants.locales,
    })
    .from(tenants)
    .where(eq(tenants.id, tenantId))
    .limit(1);

  if (!tenant) throw new Error("Tenant not found");

  console.log(
    `[AutoTranslate] Tenant: "${tenant.name}" | defaultLocale: ${tenant.defaultLocale} | locales: [${tenant.locales.join(", ")}]`
  );

  const jobs: Job[] = [];

  // ── Collect entity jobs ──────────────────────────────────────────────────────

  // Get all pending/failed (not locked) translation rows for this tenant
  const pendingRows = await db
    .select({
      id: tenantTranslations.id,
      entityId: tenantTranslations.entityId,
      locale: tenantTranslations.locale,
    })
    .from(tenantTranslations)
    .where(
      and(
        eq(tenantTranslations.tenantId, tenantId),
        inArray(tenantTranslations.translationStatus, ["pending", "failed"]),
        eq(tenantTranslations.isLocked, false)
      )
    );

  console.log(`[AutoTranslate] Found ${pendingRows.length} pending/failed entity translation rows`);

  // For each pending row, find the best source: prefer defaultLocale, fall back to
  // any locale that actually has content. This handles the case where a user writes
  // content in a non-default locale first.
  for (const row of pendingRows) {
    // Fetch all translation rows for this entity so we can pick the richest source
    const allEntityRows = await db
      .select({
        locale: tenantTranslations.locale,
        payload: tenantTranslations.payload,
        kind: tenantEntities.kind,
      })
      .from(tenantTranslations)
      .innerJoin(tenantEntities, eq(tenantTranslations.entityId, tenantEntities.id))
      .where(eq(tenantTranslations.entityId, row.entityId));

    // Pick source: defaultLocale first, then any locale with content
    const localeOrder = [
      tenant.defaultLocale,
      ...tenant.locales.filter((l) => l !== tenant.defaultLocale),
    ];
    let sourceRow: (typeof allEntityRows)[number] | undefined;
    for (const candidateLocale of localeOrder) {
      const candidate = allEntityRows.find((r) => r.locale === candidateLocale);
      if (!candidate) continue;
      const p = candidate.payload as Record<string, string>;
      if (Object.values(p).some((v) => typeof v === "string" && v.trim().length > 0)) {
        sourceRow = candidate;
        break;
      }
    }

    if (!sourceRow) {
      console.log(
        `[AutoTranslate] Entity ${row.entityId} → locale ${row.locale}: SKIP (no source locale has content)`
      );
      continue;
    }

    const sourcePayload = sourceRow.payload as Record<string, string>;
    const sourceLocale = sourceRow.locale;

    // Don't translate a row into its own source locale
    if (row.locale === sourceLocale) {
      console.log(
        `[AutoTranslate] Entity ${row.entityId} → locale ${row.locale}: SKIP (is the source locale)`
      );
      continue;
    }

    console.log(
      `[AutoTranslate] Entity ${row.entityId} → ${sourceLocale} ➜ ${row.locale} (kind: ${sourceRow.kind})`
    );

    jobs.push({
      kind: "entity",
      translationId: row.id,
      entityId: row.entityId,
      targetLocale: row.locale,
      sourcePayload,
      entityKind: sourceRow.kind,
      sourceLocale,
    });
  }

  // ── Collect block jobs ────────────────────────────────────────────────────────

  const tenantBlocks = await db
    .select({ id: blocks.id, type: blocks.type, translations: blocks.translations })
    .from(blocks)
    .where(eq(blocks.tenantId, tenantId));

  console.log(`[AutoTranslate] Found ${tenantBlocks.length} blocks`);

  for (const block of tenantBlocks) {
    const allTrans = (block.translations ?? {}) as Record<string, Record<string, string>>;

    // Pick best source locale: defaultLocale first, then any locale with content
    const localeOrder = [
      tenant.defaultLocale,
      ...tenant.locales.filter((l) => l !== tenant.defaultLocale),
    ];
    let sourceLocale: string | undefined;
    let sourcePayload: Record<string, string> = {};
    for (const candidate of localeOrder) {
      const p = allTrans[candidate] ?? {};
      if (Object.values(p).some((v) => typeof v === "string" && v.trim().length > 0)) {
        sourceLocale = candidate;
        sourcePayload = p;
        break;
      }
    }

    if (!sourceLocale) {
      console.log(
        `[AutoTranslate] Block ${block.id} (${block.type}): SKIP (no locale has content)`
      );
      continue;
    }

    for (const targetLocale of tenant.locales) {
      if (targetLocale === sourceLocale) continue;

      const existing = allTrans[targetLocale] ?? {};
      const hasAllFields = Object.keys(sourcePayload).every(
        (k) => typeof existing[k] === "string" && existing[k].trim().length > 0
      );
      if (hasAllFields) {
        console.log(
          `[AutoTranslate] Block ${block.id} (${block.type}) ${sourceLocale} ➜ ${targetLocale}: SKIP (already has all fields)`
        );
        continue;
      }

      console.log(
        `[AutoTranslate] Block ${block.id} (${block.type}) ${sourceLocale} ➜ ${targetLocale}: QUEUED`
      );

      jobs.push({
        kind: "block",
        blockId: block.id,
        blockType: block.type,
        sourceLocale,
        targetLocale,
        sourcePayload,
        allTranslations: allTrans,
      });
    }
  }

  const totalJobs = jobs.length;

  // Detect if any block/entity has content at all
  let needsSeed = false;
  if (totalJobs === 0) {
    const hasAnyContent = tenantBlocks.some((b) => {
      const trans = (b.translations ?? {}) as Record<string, Record<string, string>>;
      return Object.values(trans).some((t) =>
        Object.values(t).some((v) => typeof v === "string" && v.trim().length > 0),
      );
    });
    needsSeed = !hasAnyContent;
  }

  const batch = jobs.slice(0, BATCH_LIMIT);
  const remaining = Math.max(0, totalJobs - BATCH_LIMIT);

  let succeeded = 0;
  let failed = 0;

  for (const job of batch) {
    const context =
      job.kind === "entity"
        ? `${job.entityKind.replace("_", " ")} on "${tenant.name}"`
        : `${job.blockType} block on "${tenant.name}"`;

    try {
      const translated = await translatePayload({
        payload: job.sourcePayload,
        sourceLocale: job.sourceLocale,
        targetLocale: job.targetLocale,
        context,
      });

      if (job.kind === "entity") {
        await db
          .update(tenantTranslations)
          .set({
            payload: translated,
            translationStatus: "translated",
            updatedAt: new Date(),
          })
          .where(eq(tenantTranslations.id, job.translationId));
      } else {
        const updated = {
          ...job.allTranslations,
          [job.targetLocale]: translated,
        };
        // Refresh the in-memory allTranslations for subsequent locales of this block
        job.allTranslations[job.targetLocale] = translated;
        await db
          .update(blocks)
          .set({ translations: updated, updatedAt: new Date() })
          .where(eq(blocks.id, job.blockId));
      }

      succeeded++;
    } catch (err) {
      console.error(`[AutoTranslate] ✗ failed:`, err);
      if (err instanceof RateLimitError) {
        // Abort the rest of the batch — all subsequent calls will also 429.
        // Return as data, NOT re-throw: Server Actions can't serialize custom classes.

        revalidatePath(`/[locale]/dashboard/site-builder/${tenantId}`, "page");
        return {
          succeeded,
          failed,
          remaining: totalJobs - succeeded,
          totalJobCount: totalJobs,
          needsSeed,
          rateLimitRetryAfter: err.retryAfterSeconds,
        };
      }
      if (err instanceof TranslationError) {
        if (job.kind === "entity") {
          await db
            .update(tenantTranslations)
            .set({ translationStatus: "failed", updatedAt: new Date() })
            .where(eq(tenantTranslations.id, job.translationId));
        }
        // Block failures are not persisted — re-trigger retries them
      }
      failed++;
    }

    if (batch.indexOf(job) < batch.length - 1) {
      await wait(RATE_LIMIT_DELAY_MS);
    }
  }

  revalidatePath(`/[locale]/dashboard/site-builder/${tenantId}`, "page");

  return { succeeded, failed, remaining, totalJobCount: totalJobs, needsSeed };
}
