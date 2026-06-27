/**
 * Seed script — Àgora pilot tenant
 *
 * Run from soos-engine/:
 *   npx dotenv -e .env.local -- npx tsx src/5-shared/lib/db/seed-pilot.ts
 *
 * Idempotent: re-running skips already-created rows.
 */

import * as dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(process.cwd(), '.env.local') })

import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { and, eq } from 'drizzle-orm'
import {
  tenants,
  blocks,
  tenantEntities,
  tenantTranslations,
  workspaces,
} from './schema'
import { profiles, workspaceMemberships, membershipSites } from './schema/auth'
import { getSiteLimit } from '../billing/plans'

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql, {
  schema: { tenants, blocks, tenantEntities, tenantTranslations, workspaces, profiles, workspaceMemberships, membershipSites },
})

async function main() {
  console.log('🌱  Seeding Àgora pilot tenant…\n')

  // ── 1. Owner profile ────────────────────────────────────────────────────────
  const ownerEmail = 'admin@agora-association.org'
  const [ownerProfile] = await db
    .insert(profiles)
    .values({ email: ownerEmail, name: 'Àgora Admin', role: 'user' })
    .onConflictDoNothing({ target: profiles.email })
    .returning()

  const ownerProfileId = ownerProfile?.id ?? (
    await db.select({ id: profiles.id }).from(profiles).where(eq(profiles.email, ownerEmail)).limit(1)
  )[0]?.id

  if (!ownerProfileId) {
    console.error('  ✗ Could not resolve owner profile ID')
    process.exit(1)
  }
  console.log(`  ✓ Owner profile ready (${ownerEmail})`)

  // ── 2. Workspace ────────────────────────────────────────────────────────────
  const [existingWs] = await db
    .select({ id: workspaces.id })
    .from(workspaces)
    .where(eq(workspaces.ownerProfileId, ownerProfileId))
    .limit(1)

  let workspaceId: string

  if (existingWs) {
    workspaceId = existingWs.id
    console.log(`  ✓ Workspace already exists (id: ${workspaceId}) — skipped.`)
  } else {
    const [ws] = await db
      .insert(workspaces)
      .values({
        name: "Àgora's Account",
        ownerProfileId: ownerProfileId,
        plan: 'free',
        siteLimit: getSiteLimit('free'),
      })
      .returning({ id: workspaces.id })

    workspaceId = ws.id
    console.log(`  ✓ Workspace created (id: ${workspaceId})`)
  }

  // ── 3. Tenant ───────────────────────────────────────────────────────────────
  const [existing] = await db
    .select({ id: tenants.id, workspaceId: tenants.workspaceId })
    .from(tenants)
    .where(eq(tenants.slug, 'agora'))
    .limit(1)

  let tenantId: string

  if (existing) {
    tenantId = existing.id
    // Backfill workspace_id for pre-migration tenants
    if (!existing.workspaceId) {
      await db
        .update(tenants)
        .set({ workspaceId })
        .where(eq(tenants.id, tenantId))
      console.log(`  ✓ Tenant already existed — workspace_id backfilled.`)
    } else {
      console.log(`  ✓ Tenant already exists (id: ${tenantId}) — skipping insert.`)
    }
  } else {
    const [inserted] = await db
      .insert(tenants)
      .values({
        name:          'Àgora Association',
        slug:          'agora',
        locales:       ['en', 'es', 'ca'],
        defaultLocale: 'en',
        status:        'published',
        branding:      {},
        workspaceId,
      })
      .returning({ id: tenants.id })

    tenantId = inserted.id
    console.log(`  ✓ Tenant inserted (id: ${tenantId})`)
  }

  // ── 4. Blocks ──────────────────────────────────────────────────────────────
  const existingBlocks = await db
    .select({ id: blocks.id, type: blocks.type })
    .from(blocks)
    .where(eq(blocks.tenantId, tenantId))

  if (existingBlocks.length > 0) {
    console.log(`  ✓ ${existingBlocks.length} block(s) already exist — skipping block inserts.`)
  } else {

  // Hero — en fully seeded; es/ca left for Gemini worker
  const [heroBlock] = await db
    .insert(blocks)
    .values({
      tenantId,
      type:      'hero',
      order:     0,
      isVisible: true,
      config:    { layout: 'centered' },
      translations: {
        en: {
          title:    'Welcome to Àgora',
          subtitle: 'Empowering social workers, helping communities.',
          ctaLabel: 'Join Us',
        },
      },
    })
    .returning({ id: blocks.id })

  console.log(`  ✓ Hero block inserted (id: ${heroBlock.id})`)

  // Contact
  const [contactBlock] = await db
    .insert(blocks)
    .values({
      tenantId,
      type:      'contact',
      order:     2,
      isVisible: true,
      config:    {
        email:   'info@agora-association.org',
        phone:   '+34 123 456 789',
        address: 'Carrer de la Pau, 12, Barcelona, Spain',
      },
      translations: {
        en: { title: 'Get in Touch', description: 'We would love to hear from you. Reach out to us.' },
        es: { title: 'Contacto', description: 'Nos encantaría saber de ti. Ponte en contacto.' },
        ca: { title: 'Contacta', description: 'Ens encantaria saber de tu. Posa\'t en contacte.' },
      },
    })
    .returning({ id: blocks.id })

  console.log(`  ✓ Contact block inserted (id: ${contactBlock.id})`)

  // Blog feed
  const [blogBlock] = await db
    .insert(blocks)
    .values({
      tenantId,
      type:      'blog-feed',
      order:     2,
      isVisible: true,
      config:    {},
      translations: { en: {} },
    })
    .returning({ id: blocks.id })

  console.log(`  ✓ Blog-feed block inserted (id: ${blogBlock.id})`)

  // ── 5. Sample blog post entity ─────────────────────────────────────────────
  const [postEntity] = await db
    .insert(tenantEntities)
    .values({
      tenantId,
      blockId:      blogBlock.id,
      kind:         'blog_post',
      status:       'published',
      order:        0,
      slug:         'what-is-agora',
      coverImageUrl: null,
      metadata:     { readingTimeMinutes: 3 },
      publishedAt:  new Date(),
    })
    .returning({ id: tenantEntities.id })

  console.log(`  ✓ Blog post entity inserted (id: ${postEntity.id})`)

  // Translation rows — en translated, es/ca pending for Gemini
  await db.insert(tenantTranslations).values([
    {
      tenantId,
      entityId:          postEntity.id,
      locale:            'en',
      translationStatus: 'translated',
      isLocked:          false,
      payload: {
        title:   'What is Àgora?',
        excerpt: 'Àgora is an association of social workers dedicated to community empowerment and inclusive care.',
        body:    'Àgora was founded with the belief that professional social workers deserve a voice, a network, and the tools to create real change. We bring together practitioners, researchers, and advocates to share knowledge and support one another.\n\nOur mission is empowerment — of both the professionals who serve and the communities they support.',
      },
    },
    {
      tenantId,
      entityId:          postEntity.id,
      locale:            'es',
      translationStatus: 'pending',
      isLocked:          false,
      payload:           {},
    },
    {
      tenantId,
      entityId:          postEntity.id,
      locale:            'ca',
      translationStatus: 'pending',
      isLocked:          false,
      payload:           {},
    },
  ])

  console.log('  ✓ Translation rows seeded (en: translated, es/ca: pending)')
  }

  // ── 6. Memberships ─────────────────────────────────────────────────────────

  // The owner is conferred by the workspace (workspaces.ownerProfileId) — no
  // membership row is needed.

  // 3 Editors
  const editorEmails = [
    'worker1@agora-association.org',
    'worker2@agora-association.org',
    'worker3@agora-association.org',
  ]

  for (const email of editorEmails) {
    const [editorProfile] = await db
      .insert(profiles)
      .values({ email, name: email.split('@')[0], role: 'user' })
      .onConflictDoNothing({ target: profiles.email })
      .returning()

    const editorProfileId = editorProfile?.id ?? (
      await db.select({ id: profiles.id }).from(profiles).where(eq(profiles.email, email)).limit(1)
    )[0]?.id

    if (editorProfileId) {
      const [inserted] = await db
        .insert(workspaceMemberships)
        .values({
          workspaceId,
          profileId: editorProfileId,
          role: 'editor',
          siteScope: 'specific',
        })
        .onConflictDoNothing({ target: [workspaceMemberships.workspaceId, workspaceMemberships.profileId] })
        .returning({ id: workspaceMemberships.id })

      const membershipId =
        inserted?.id ??
        (
          await db
            .select({ id: workspaceMemberships.id })
            .from(workspaceMemberships)
            .where(
              and(
                eq(workspaceMemberships.workspaceId, workspaceId),
                eq(workspaceMemberships.profileId, editorProfileId),
              ),
            )
            .limit(1)
        )[0]?.id

      if (membershipId) {
        await db
          .insert(membershipSites)
          .values({ membershipId, tenantId })
          .onConflictDoNothing()
      }
    }
  }

  console.log('  ✓ 3 editor profiles ready (worker[1-3]@agora-association.org)')

  console.log('\n🎉  Seed complete. Start the dev server and visit agora.localhost:3000')
}

main().catch(err => {
  console.error('\n❌  Seed failed:', err)
  process.exit(1)
})
