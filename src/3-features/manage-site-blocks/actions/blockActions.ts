'use server'
import { tenants } from '@/5-shared/lib/db/schema'

import { db } from '@/5-shared/lib/db'
import { blocks } from '@/5-shared/lib/db/schema'
import { asc, sql, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import type { BlockKind } from '@/5-shared/types/tenants/blocks'
import type { SupportedLocaleType } from '@/5-shared/types'

/**
 * SECURITY PLACEHOLDER — Phase 6 hardening.
 * Replace with actual Neon Auth session check: verify the requesting user
 * owns tenantId before allowing any mutation.
 */
async function assertTenantOwner(_tenantId: string): Promise<void> {
  // TODO Phase 6: const session = await auth(); assert(session.user.tenantId === _tenantId)
}

function revalidateSiteBuilder(tenantId: string): void {
  // Revalidates all locale variants of this tenant's site-builder page
  revalidatePath(`/[locale]/dashboard/site-builder/${tenantId}`, 'page')
}

// ── Block translation mutations ────────────────────────────────────────────────

export async function updateBlockTranslations(
  blockId: string,
  tenantId: string,
  locale: SupportedLocaleType,
  payload: Record<string, string>,
) {
  await assertTenantOwner(tenantId)

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
  await assertTenantOwner(tenantId)

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
  await assertTenantOwner(tenantId)

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
  await assertTenantOwner(tenantId)

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

export async function addBlock(tenantId: string, type: BlockKind) {
  await assertTenantOwner(tenantId)

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
  await assertTenantOwner(tenantId)

  await db.delete(blocks).where(eq(blocks.id, blockId))

  revalidateSiteBuilder(tenantId)
}

// ── Tenant language management ───────────────────────────────────────────────

/**
 * Update the enabled locales for a tenant (languages shown on public site)
 * FSD-compliant server action
 */
export async function updateTenantLocales(
  tenantId: string,
  locales: string[],
) {
  await assertTenantOwner(tenantId)
  await db
    .update(tenants)
    .set({ locales, updatedAt: new Date() })
    .where(eq(tenants.id, tenantId))
  revalidateSiteBuilder(tenantId)
}
