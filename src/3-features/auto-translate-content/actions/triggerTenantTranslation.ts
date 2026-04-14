'use server'

import { db } from '@/5-shared/lib/db'
import { tenants, blocks, tenantEntities, tenantTranslations } from '@/5-shared/lib/db/schema'
import { eq, inArray, and } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { translatePayload, TranslationError } from '../api/translateWithGemini'

const BATCH_LIMIT = 30
const RATE_LIMIT_DELAY_MS = 150

/**
 * SECURITY PLACEHOLDER — Phase 6 hardening.
 * Replace with Neon Auth session check: verify requesting user owns tenantId.
 */
async function assertTenantOwner(_tenantId: string): Promise<void> {
  // TODO Phase 6: const session = await auth(); assert(session.user.tenantId === _tenantId)
}

function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export interface TranslationResult {
  succeeded: number
  failed: number
  remaining: number
}

type EntityJob = {
  kind: 'entity'
  translationId: string
  entityId: string
  targetLocale: string
  sourcePayload: Record<string, string>
  entityKind: string
}

type BlockJob = {
  kind: 'block'
  blockId: string
  blockType: string
  targetLocale: string
  sourcePayload: Record<string, string>
  allTranslations: Record<string, Record<string, string>>
}

type Job = EntityJob | BlockJob

/**
 * Find all pending translation rows for a tenant and auto-translate them with Gemini.
 * Processes a maximum of 30 rows per call. Re-trigger to process remaining rows.
 * Returns { succeeded, failed, remaining }.
 */
export async function triggerTenantTranslation(tenantId: string): Promise<TranslationResult> {
  await assertTenantOwner(tenantId)

  const [tenant] = await db
    .select({
      id: tenants.id,
      name: tenants.name,
      category: tenants.category,
      defaultLocale: tenants.defaultLocale,
      locales: tenants.locales,
    })
    .from(tenants)
    .where(eq(tenants.id, tenantId))
    .limit(1)

  if (!tenant) throw new Error('Tenant not found')

  const jobs: Job[] = []

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
        inArray(tenantTranslations.translationStatus, ['pending', 'failed']),
        eq(tenantTranslations.isLocked, false),
      )
    )

  // For each pending row, fetch the source locale payload
  for (const row of pendingRows) {
    const [sourceRow] = await db
      .select({
        payload: tenantTranslations.payload,
        kind: tenantEntities.kind,
      })
      .from(tenantTranslations)
      .innerJoin(tenantEntities, eq(tenantTranslations.entityId, tenantEntities.id))
      .where(
        and(
          eq(tenantTranslations.entityId, row.entityId),
          eq(tenantTranslations.locale, tenant.defaultLocale),
        )
      )
      .limit(1)

    if (!sourceRow) continue

    const sourcePayload = sourceRow.payload as Record<string, string>
    const hasContent = Object.values(sourcePayload).some(v => typeof v === 'string' && v.trim().length > 0)
    if (!hasContent) continue // source not written yet — skip

    jobs.push({
      kind: 'entity',
      translationId: row.id,
      entityId: row.entityId,
      targetLocale: row.locale,
      sourcePayload,
      entityKind: sourceRow.kind,
    })
  }

  // ── Collect block jobs ────────────────────────────────────────────────────────

  const tenantBlocks = await db
    .select({ id: blocks.id, type: blocks.type, translations: blocks.translations })
    .from(blocks)
    .where(eq(blocks.tenantId, tenantId))

  for (const block of tenantBlocks) {
    const allTrans = (block.translations ?? {}) as Record<string, Record<string, string>>
    const sourcePayload = allTrans[tenant.defaultLocale] ?? {}
    const hasContent = Object.values(sourcePayload).some(v => typeof v === 'string' && v.trim().length > 0)
    if (!hasContent) continue

    for (const targetLocale of tenant.locales) {
      if (targetLocale === tenant.defaultLocale) continue

      const existing = allTrans[targetLocale] ?? {}
      const hasAllFields = Object.keys(sourcePayload).every(
        k => typeof existing[k] === 'string' && existing[k].trim().length > 0,
      )
      if (hasAllFields) continue // already translated

      jobs.push({
        kind: 'block',
        blockId: block.id,
        blockType: block.type,
        targetLocale,
        sourcePayload,
        allTranslations: allTrans,
      })
    }
  }

  const totalJobs = jobs.length
  const batch = jobs.slice(0, BATCH_LIMIT)
  const remaining = Math.max(0, totalJobs - BATCH_LIMIT)

  let succeeded = 0
  let failed = 0

  for (const job of batch) {
    const context = job.kind === 'entity'
      ? `${job.entityKind.replace('_', ' ')} on a ${tenant.category} website called "${tenant.name}"`
      : `${job.blockType} block on a ${tenant.category} website called "${tenant.name}"`

    try {
      const translated = await translatePayload({
        payload: job.sourcePayload,
        sourceLocale: tenant.defaultLocale,
        targetLocale: job.targetLocale,
        context,
        category: tenant.category,
      })

      if (job.kind === 'entity') {
        await db
          .update(tenantTranslations)
          .set({
            payload: translated,
            translationStatus: 'translated',
            updatedAt: new Date(),
          })
          .where(eq(tenantTranslations.id, job.translationId))
      } else {
        const updated = {
          ...job.allTranslations,
          [job.targetLocale]: translated,
        }
        // Refresh the in-memory allTranslations for subsequent locales of this block
        job.allTranslations[job.targetLocale] = translated
        await db
          .update(blocks)
          .set({ translations: updated, updatedAt: new Date() })
          .where(eq(blocks.id, job.blockId))
      }

      succeeded++
    } catch (err) {
      if (err instanceof TranslationError) {
        if (job.kind === 'entity') {
          await db
            .update(tenantTranslations)
            .set({ translationStatus: 'failed', updatedAt: new Date() })
            .where(eq(tenantTranslations.id, job.translationId))
        }
        // Block failures are not persisted — re-trigger retries them
      }
      failed++
    }

    if (batch.indexOf(job) < batch.length - 1) {
      await wait(RATE_LIMIT_DELAY_MS)
    }
  }

  revalidatePath(`/[locale]/dashboard/site-builder/${tenantId}`, 'page')

  return { succeeded, failed, remaining }
}
