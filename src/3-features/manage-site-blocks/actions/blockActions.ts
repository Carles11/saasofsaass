'use server'

import { tenants, tenantEntities, tenantTranslations } from '@/5-shared/lib/db/schema'
import { db } from '@/5-shared/lib/db'
import { blocks } from '@/5-shared/lib/db/schema'
import { asc, sql, eq, inArray, and } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import type { BlockKind } from '@/5-shared/types/tenants/blocks'
import type { SupportedLocaleType } from '@/5-shared/types'
import { assertCanEditContent, assertCanManageStructure } from '@/5-shared/lib/auth/authorization'

function revalidateSiteBuilder(tenantId: string): void {
  revalidatePath(`/[locale]/dashboard/site-builder/${tenantId}`, 'page')
}

// ── Block translation mutations ────────────────────────────────────────────────

export async function updateBlockTranslations(
  blockId: string,
  tenantId: string,
  locale: SupportedLocaleType,
  payload: Record<string, string>,
) {
  await assertCanEditContent(tenantId)

  const [existing] = await db
    .select({ translations: blocks.translations })
    .from(blocks)
    .where(eq(blocks.id, blockId))
    .limit(1)

  const current = (existing?.translations ?? {}) as Record<string, Record<string, string>>
  const merged = { ...current, [locale]: { ...(current[locale] ?? {}), ...payload } }

  await db
    .update(blocks)
    .set({ translations: merged, updatedAt: new Date() })
    .where(eq(blocks.id, blockId))

  revalidateSiteBuilder(tenantId)
}

export async function updateBlockConfig(
  blockId: string,
  tenantId: string,
  config: Record<string, unknown>,
) {
  await assertCanEditContent(tenantId)

  await db
    .update(blocks)
    .set({ config, updatedAt: new Date() })
    .where(eq(blocks.id, blockId))

  revalidateSiteBuilder(tenantId)
}

export async function toggleBlockVisibility(
  blockId: string,
  tenantId: string,
  currentValue: boolean,
) {
  await assertCanManageStructure(tenantId)

  await db
    .update(blocks)
    .set({ isVisible: !currentValue, updatedAt: new Date() })
    .where(eq(blocks.id, blockId))

  revalidateSiteBuilder(tenantId)
}

export async function reorderBlock(
  tenantId: string,
  blockId: string,
  direction: 'up' | 'down',
) {
  await assertCanManageStructure(tenantId)

  const ordered = await db
    .select({ id: blocks.id, order: blocks.order })
    .from(blocks)
    .where(eq(blocks.tenantId, tenantId))
    .orderBy(asc(blocks.order))

  const idx = ordered.findIndex(b => b.id === blockId)
  if (idx === -1) return

  const siblingIdx = direction === 'up' ? idx - 1 : idx + 1
  if (siblingIdx < 0 || siblingIdx >= ordered.length) return

  const current = ordered[idx]
  const sibling = ordered[siblingIdx]

  await db.update(blocks).set({ order: sibling.order }).where(eq(blocks.id, current.id))
  await db.update(blocks).set({ order: current.order }).where(eq(blocks.id, sibling.id))

  revalidateSiteBuilder(tenantId)
}

export async function reorderBlocks(tenantId: string, orderedBlockIds: string[]) {
  await assertCanManageStructure(tenantId)

  for (let i = 0; i < orderedBlockIds.length; i++) {
    await db
      .update(blocks)
      .set({ order: i, updatedAt: new Date() })
      .where(eq(blocks.id, orderedBlockIds[i]))
  }

  revalidateSiteBuilder(tenantId)
}

export async function addBlock(tenantId: string, type: BlockKind) {
  await assertCanManageStructure(tenantId)

  const [{ maxOrder }] = await db
    .select({ maxOrder: sql<number>`coalesce(max(${blocks.order}), -1)` })
    .from(blocks)
    .where(eq(blocks.tenantId, tenantId))

  await db.insert(blocks).values({
    tenantId,
    type,
    order: maxOrder + 1,
    isVisible: true,
    config: {},
    translations: {},
  })

  revalidateSiteBuilder(tenantId)
}

export async function deleteBlock(blockId: string, tenantId: string) {
  await assertCanManageStructure(tenantId)

  await db.delete(blocks).where(eq(blocks.id, blockId))

  revalidateSiteBuilder(tenantId)
}

// ── Tenant language management ───────────────────────────────────────────────

export async function updateTenantLocales(
  tenantId: string,
  locales: string[],
) {
  await assertCanManageStructure(tenantId)

  const [tenant] = await db.select({ locales: tenants.locales }).from(tenants).where(eq(tenants.id, tenantId)).limit(1)
  const prevLocales: string[] = tenant?.locales ?? []

  await db
    .update(tenants)
    .set({ locales, updatedAt: new Date() })
    .where(eq(tenants.id, tenantId))

  const added = locales.filter(l => !prevLocales.includes(l))
  const removed = prevLocales.filter(l => !locales.includes(l))

  if (added.length > 0) {
    const entities = await db.select({ id: tenantEntities.id })
      .from(tenantEntities)
      .where(eq(tenantEntities.tenantId, tenantId))
    const entityIds = entities.map(e => e.id)

    for (const locale of added) {
      const existing = await db.select({ entityId: tenantTranslations.entityId })
        .from(tenantTranslations)
        .where(and(
          eq(tenantTranslations.tenantId, tenantId),
          eq(tenantTranslations.locale, locale),
          inArray(tenantTranslations.entityId, entityIds)
        ))
      const existingIds = new Set(existing.map(e => e.entityId))
      const missing = entityIds.filter(id => !existingIds.has(id))
      if (missing.length > 0) {
        await db.insert(tenantTranslations).values(
          missing.map(entityId => ({
            tenantId,
            entityId,
            locale,
            payload: {},
            translationStatus: 'pending',
            isLocked: false,
          }))
        )
      }
    }
  }

  if (removed.length > 0) {
    await db.delete(tenantTranslations)
      .where(and(
        eq(tenantTranslations.tenantId, tenantId),
        inArray(tenantTranslations.locale, removed)
      ))
  }

  revalidateSiteBuilder(tenantId)
}
