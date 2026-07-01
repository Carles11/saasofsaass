'use server'

import { db } from '@/5-shared/lib/db'
import { tenants, tenantEntities, tenantTranslations } from '@/5-shared/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import type { EntityKind, EntityStatus } from '@/5-shared/types/tenants/entities'
import { assertCanEditContent } from '@/5-shared/lib/auth/authorization'
import { slugify, uniqueSlug } from '@/5-shared/lib/strings/slugify'
import { deleteS3Object } from '@/5-shared/lib/aws/s3'

function revalidateSiteBuilder(tenantId: string): void {
  revalidatePath(`/[locale]/dashboard/site-builder/${tenantId}`, 'page')
}

function payloadHasContent(payload: Record<string, unknown>): boolean {
  return Object.values(payload).some(
    (v) => typeof v === 'string' && v.trim().length > 0,
  )
}

// ── Entity mutations ───────────────────────────────────────────────────────────

interface CreateEntityParams {
  tenantId: string
  blockId?: string
  kind: EntityKind
  /** Title in the source language — drives the auto-generated slug + seed payload. */
  title: string
  /** Full payload for the source language (title, excerpt/body/description/quote, …). */
  defaultPayload?: Record<string, unknown>
  /** Which language the seed payload is written in. Defaults to the tenant default. */
  sourceLocale?: string
  metadata?: Record<string, unknown>
}

/**
 * Create a collection item. The slug is auto-generated from the title (unique
 * per tenant) — there is no user-facing slug input. The default-locale payload
 * is seeded immediately so the item isn't a hollow "translated" row; other
 * locales start as `pending`.
 */
export async function createEntity({
  tenantId,
  blockId,
  kind,
  title,
  defaultPayload,
  sourceLocale,
  metadata,
}: CreateEntityParams): Promise<{ id: string; slug: string }> {
  await assertCanEditContent(tenantId)

  const [tenant] = await db
    .select({ locales: tenants.locales, defaultLocale: tenants.defaultLocale })
    .from(tenants)
    .where(eq(tenants.id, tenantId))
    .limit(1)

  if (!tenant) throw new Error('errors.tenant-not-found')

  // Unique slug from title across this tenant's existing entities.
  const existing = await db
    .select({ slug: tenantEntities.slug })
    .from(tenantEntities)
    .where(eq(tenantEntities.tenantId, tenantId))
  const taken = new Set(existing.map((e) => e.slug).filter((s): s is string => !!s))
  const slug = uniqueSlug(slugify(title), taken)

  const seedLocale = sourceLocale && tenant.locales.includes(sourceLocale)
    ? sourceLocale
    : tenant.defaultLocale
  const payload = (defaultPayload ?? { title }) as Record<string, unknown>
  const seedHasContent = payloadHasContent(payload)

  const [entity] = await db
    .insert(tenantEntities)
    .values({
      tenantId,
      blockId: blockId ?? null,
      kind,
      slug,
      status: 'draft',
      order: 0,
      metadata: metadata ?? {},
    })
    .returning({ id: tenantEntities.id })

  const translationRows = tenant.locales.map((locale) => {
    const isSeed = locale === seedLocale
    return {
      tenantId,
      entityId: entity.id,
      locale,
      payload: isSeed ? payload : ({} as Record<string, unknown>),
      // Only the seeded language is "translated", and only if it has content.
      translationStatus: isSeed && seedHasContent ? 'translated' : 'pending',
      isLocked: false,
    }
  })

  if (translationRows.length > 0) {
    await db.insert(tenantTranslations).values(translationRows)
  }

  revalidateSiteBuilder(tenantId)
  return { id: entity.id, slug }
}

/** Set an entity's lifecycle status. Publishing stamps publishedAt. */
export async function setEntityStatus(
  entityId: string,
  tenantId: string,
  status: EntityStatus,
) {
  await assertCanEditContent(tenantId)

  await db
    .update(tenantEntities)
    .set({
      status,
      publishedAt: status === 'published' ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(and(eq(tenantEntities.id, entityId), eq(tenantEntities.tenantId, tenantId)))

  revalidateSiteBuilder(tenantId)
}

/** Back-compat helper — publish in one call. */
export async function publishEntity(entityId: string, tenantId: string) {
  return setEntityStatus(entityId, tenantId, 'published')
}

/** Permanently delete an entity and all its translations. */
export async function deleteEntity(entityId: string, tenantId: string) {
  await assertCanEditContent(tenantId)

  await db
    .delete(tenantTranslations)
    .where(
      and(
        eq(tenantTranslations.entityId, entityId),
        eq(tenantTranslations.tenantId, tenantId),
      ),
    )
  await db
    .delete(tenantEntities)
    .where(and(eq(tenantEntities.id, entityId), eq(tenantEntities.tenantId, tenantId)))

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

/** Remove an entity's cover image (deletes the S3 object and clears the column). */
export async function removeEntityImage(entityId: string, tenantId: string) {
  await assertCanEditContent(tenantId)

  const [entity] = await db
    .select({ coverImageUrl: tenantEntities.coverImageUrl })
    .from(tenantEntities)
    .where(and(eq(tenantEntities.id, entityId), eq(tenantEntities.tenantId, tenantId)))
    .limit(1)

  const url = entity?.coverImageUrl
  if (url) {
    const base = (process.env.NEXT_PUBLIC_AWS_CLOUDFRONT_URL ?? '').replace(/\/+$/, '')
    let s3Key = base && url.startsWith(base) ? url.slice(base.length + 1) : undefined
    if (!s3Key) s3Key = url.match(/(?:cloudfront\.net|amazonaws\.com)\/(.+)$/)?.[1]
    // Only delete keys scoped to this tenant.
    if (s3Key && s3Key.startsWith(`${tenantId}/`)) {
      try {
        await deleteS3Object(s3Key)
      } catch {
        // best-effort; clear the column regardless
      }
    }
  }

  await db
    .update(tenantEntities)
    .set({ coverImageUrl: null, updatedAt: new Date() })
    .where(eq(tenantEntities.id, entityId))

  revalidateSiteBuilder(tenantId)
}

export async function updateEntityMetadata(
  entityId: string,
  tenantId: string,
  metadata: Record<string, unknown>,
) {
  await assertCanEditContent(tenantId)

  await db
    .update(tenantEntities)
    .set({ metadata, updatedAt: new Date() })
    .where(eq(tenantEntities.id, entityId))

  revalidateSiteBuilder(tenantId)
}
