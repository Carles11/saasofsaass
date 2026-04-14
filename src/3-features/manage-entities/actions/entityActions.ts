'use server'

import { db } from '@/5-shared/lib/db'
import { tenants, tenantEntities, tenantTranslations } from '@/5-shared/lib/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import type { EntityKind } from '@/5-shared/types/tenants/entities'

/**
 * SECURITY PLACEHOLDER — Phase 6 hardening.
 * Replace with actual Neon Auth session check: verify the requesting user
 * owns tenantId before allowing any mutation.
 */
async function assertTenantOwner(_tenantId: string): Promise<void> {
  // TODO Phase 6: const session = await auth(); assert(session.user.tenantId === _tenantId)
}

function revalidateSiteBuilder(tenantId: string): void {
  revalidatePath(`/[locale]/dashboard/site-builder/${tenantId}`, 'page')
}

// ── Entity mutations ───────────────────────────────────────────────────────────

interface CreateEntityParams {
  tenantId: string
  blockId?: string
  kind: EntityKind
  slug: string
}

/**
 * Create a new entity and seed pending translation rows for every enabled locale.
 * The source locale gets status 'translated' (to be filled by the tenant).
 * All other locales get status 'pending' — Gemini Phase 5 will pick these up.
 */
export async function createEntity({ tenantId, blockId, kind, slug }: CreateEntityParams) {
  await assertTenantOwner(tenantId)

  const [tenant] = await db
    .select({ locales: tenants.locales, defaultLocale: tenants.defaultLocale })
    .from(tenants)
    .where(eq(tenants.id, tenantId))
    .limit(1)

  if (!tenant) throw new Error('Tenant not found')

  const [entity] = await db
    .insert(tenantEntities)
    .values({
      tenantId,
      blockId: blockId ?? null,
      kind,
      slug,
      status: 'draft',
      order: 0,
      metadata: {},
    })
    .returning({ id: tenantEntities.id })

  // Seed a translation row for every enabled locale
  const translationRows = tenant.locales.map(locale => ({
    tenantId,
    entityId: entity.id,
    locale,
    payload: {} as Record<string, unknown>,
    translationStatus: locale === tenant.defaultLocale ? 'translated' : 'pending',
    isLocked: false,
  }))

  if (translationRows.length > 0) {
    await db.insert(tenantTranslations).values(translationRows)
  }

  revalidateSiteBuilder(tenantId)
}

export async function publishEntity(entityId: string, tenantId: string) {
  await assertTenantOwner(tenantId)

  await db
    .update(tenantEntities)
    .set({ status: 'published', publishedAt: new Date(), updatedAt: new Date() })
    .where(eq(tenantEntities.id, entityId))

  revalidateSiteBuilder(tenantId)
}

/**
 * Upsert a translation for an entity+locale pair.
 * Sets isLocked=true so Gemini (Phase 5) does not overwrite manual edits.
 */
export async function updateEntityTranslation(
  entityId: string,
  tenantId: string,
  locale: string,
  payload: Record<string, unknown>,
) {
  await assertTenantOwner(tenantId)

  await db
    .insert(tenantTranslations)
    .values({
      tenantId,
      entityId,
      locale,
      payload,
      translationStatus: 'translated',
      isLocked: true,
    })
    .onConflictDoUpdate({
      target: [tenantTranslations.entityId, tenantTranslations.locale],
      set: {
        payload,
        translationStatus: 'translated',
        isLocked: true,
        updatedAt: new Date(),
      },
    })

  revalidateSiteBuilder(tenantId)
}
