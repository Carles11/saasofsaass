'use server'

import { db } from '@/5-shared/lib/db'
import { tenants, tenantEntities, tenantTranslations } from '@/5-shared/lib/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import type { EntityKind } from '@/5-shared/types/tenants/entities'
import { assertCanEditContent } from '@/5-shared/lib/auth/authorization'

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

export async function createEntity({ tenantId, blockId, kind, slug }: CreateEntityParams) {
  await assertCanEditContent(tenantId)

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
  await assertCanEditContent(tenantId)

  await db
    .update(tenantEntities)
    .set({ status: 'published', publishedAt: new Date(), updatedAt: new Date() })
    .where(eq(tenantEntities.id, entityId))

  revalidateSiteBuilder(tenantId)
}

export async function updateEntityTranslation(
  entityId: string,
  tenantId: string,
  locale: string,
  payload: Record<string, unknown>,
) {
  await assertCanEditContent(tenantId)

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
