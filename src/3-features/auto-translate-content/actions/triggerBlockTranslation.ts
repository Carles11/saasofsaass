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

export interface BlockTranslationResult {
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

export async function triggerBlockTranslation(
  blockId: string,
  tenantId: string,
): Promise<BlockTranslationResult> {
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

  const jobs: Job[] = [];

  // ── Collect entity jobs for entities owned by this block ──────────────

  const blockEntityIds = await db
    .select({ id: tenantEntities.id })
    .from(tenantEntities)
    .where(and(eq(tenantEntities.tenantId, tenantId), eq(tenantEntities.blockId, blockId)));

  const entityIds = blockEntityIds.map((e) => e.id);

  if (entityIds.length > 0) {
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
          inArray(tenantTranslations.entityId, entityIds),
          inArray(tenantTranslations.translationStatus, ["pending", "failed"]),
          eq(tenantTranslations.isLocked, false),
        ),
      );

    for (const row of pendingRows) {
      const allEntityRows = await db
        .select({
          locale: tenantTranslations.locale,
          payload: tenantTranslations.payload,
          kind: tenantEntities.kind,
        })
        .from(tenantTranslations)
        .innerJoin(tenantEntities, eq(tenantTranslations.entityId, tenantEntities.id))
        .where(eq(tenantTranslations.entityId, row.entityId));

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

      if (!sourceRow) continue;

      const sourcePayload = sourceRow.payload as Record<string, string>;
      const sourceLocale = sourceRow.locale;

      if (row.locale === sourceLocale) continue;

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
  }

  // ── Collect block jobs for this one block ─────────────────────────────

  const [block] = await db
    .select({ id: blocks.id, type: blocks.type, translations: blocks.translations })
    .from(blocks)
    .where(eq(blocks.id, blockId))
    .limit(1);

  if (block) {
    const allTrans = (block.translations ?? {}) as Record<string, Record<string, string>>;

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

    if (sourceLocale) {
      for (const targetLocale of tenant.locales) {
        if (targetLocale === sourceLocale) continue;

        const existing = allTrans[targetLocale] ?? {};
        const hasAllFields = Object.keys(sourcePayload).every(
          (k) => typeof existing[k] === "string" && existing[k].trim().length > 0,
        );
        if (hasAllFields) continue;

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
  }

  const totalJobs = jobs.length;

  // Detect if this block has no content at all (needs seeding)
  let needsSeed = false;
  if (totalJobs === 0) {
    const blockTrans = block?.translations ?? {};
    const hasBlockContent = Object.values(blockTrans).some(
      (t) =>
        typeof t === "object" &&
        t !== null &&
        Object.values(t as Record<string, string>).some(
          (v) => typeof v === "string" && v.trim().length > 0,
        ),
    );

    let hasEntityContent = false;
    if (entityIds.length > 0) {
      const sampleRows = await db
        .select({ payload: tenantTranslations.payload })
        .from(tenantTranslations)
        .where(
          and(
            eq(tenantTranslations.tenantId, tenantId),
            inArray(tenantTranslations.entityId, entityIds),
          ),
        )
        .limit(20);
      hasEntityContent = sampleRows.some((r) => {
        const p = r.payload as Record<string, string>;
        return Object.values(p).some(
          (v) => typeof v === "string" && v.trim().length > 0,
        );
      });
    }

    needsSeed = !hasBlockContent && !hasEntityContent;
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
        job.allTranslations[job.targetLocale] = translated;
        await db
          .update(blocks)
          .set({ translations: updated, updatedAt: new Date() })
          .where(eq(blocks.id, job.blockId));
      }

      succeeded++;
    } catch (err) {
      if (err instanceof RateLimitError) {
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
        if (job.kind === "entity") {
          await db
            .update(tenantTranslations)
            .set({ translationStatus: "failed", updatedAt: new Date() })
            .where(eq(tenantTranslations.id, job.translationId));
        }
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
