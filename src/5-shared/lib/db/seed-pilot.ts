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
import { eq } from 'drizzle-orm'
import {
  tenants,
  blocks,
  tenantEntities,
  tenantTranslations,
} from './schema'
import { profiles, tenantMemberships } from './schema/auth'

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql, {
  schema: { tenants, blocks, tenantEntities, tenantTranslations, profiles, tenantMemberships },
})

async function main() {
  console.log('🌱  Seeding Àgora pilot tenant…\n')

  // ── 1. Tenant ──────────────────────────────────────────────────────────────
  const [existing] = await db
    .select({ id: tenants.id })
    .from(tenants)
    .where(eq(tenants.slug, 'agora'))
    .limit(1)

  let tenantId: string

  if (existing) {
    tenantId = existing.id
    console.log(`  ✓ Tenant already exists (id: ${tenantId}) — skipping insert.`)
  } else {
    const [inserted] = await db
      .insert(tenants)
      .values({
        name:          'Àgora Association',
        slug:          'agora',
        category:      'social-work',
        locales:       ['en', 'es', 'ca'],
        defaultLocale: 'en',
        isActive:      true,
        branding:      {},
      })
      .returning({ id: tenants.id })

    tenantId = inserted.id
    console.log(`  ✓ Tenant inserted (id: ${tenantId})`)
  }

  // ── 2. Blocks ──────────────────────────────────────────────────────────────
  const existingBlocks = await db
    .select({ id: blocks.id, type: blocks.type })
    .from(blocks)
    .where(eq(blocks.tenantId, tenantId))

  if (existingBlocks.length > 0) {
    console.log(`  ✓ ${existingBlocks.length} block(s) already exist — skipping block inserts.`)
  } else {

  // Navbar
  const [navbarBlock] = await db
    .insert(blocks)
    .values({
      tenantId,
      type:      'navbar',
      order:     0,
      isVisible: true,
      config:    {},
      translations: {
        en: { siteTitle: 'Àgora' },
        es: { siteTitle: 'Àgora' },
        ca: { siteTitle: 'Àgora' },
      },
    })
    .returning({ id: blocks.id })

  console.log(`  ✓ Navbar block inserted (id: ${navbarBlock.id})`)

  // Hero — en fully seeded; es/ca left for Gemini worker
  const [heroBlock] = await db
    .insert(blocks)
    .values({
      tenantId,
      type:      'hero',
      order:     1,
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
      order:     3,
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

  // ── 3. Sample blog post entity ─────────────────────────────────────────────
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

  // ── 4. Profiles + Memberships ───────────────────────────────────────────────

  const ownerEmail = 'admin@agora-association.org'
  const [ownerProfile] = await db
    .insert(profiles)
    .values({ email: ownerEmail, name: 'Àgora Admin', role: 'user' })
    .onConflictDoNothing({ target: profiles.email })
    .returning()

  const ownerProfileId = ownerProfile?.id ?? (
    await db.select({ id: profiles.id }).from(profiles).where(eq(profiles.email, ownerEmail)).limit(1)
  )[0]?.id

  if (ownerProfileId) {
    await db.insert(tenantMemberships).values({
      tenantId,
      profileId: ownerProfileId,
      role: 'owner',
    }).onConflictDoNothing({ target: [tenantMemberships.tenantId, tenantMemberships.profileId] })
    console.log(`  ✓ Owner profile ready (admin@agora-association.org)`)
  }

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
      await db.insert(tenantMemberships).values({
        tenantId,
        profileId: editorProfileId,
        role: 'editor',
      }).onConflictDoNothing({ target: [tenantMemberships.tenantId, tenantMemberships.profileId] })
    }
  }

  console.log('  ✓ 3 editor profiles ready (worker[1-3]@agora-association.org)')

  console.log('\n🎉  Seed complete. Start the dev server and visit agora.localhost:3000')
}

main().catch(err => {
  console.error('\n❌  Seed failed:', err)
  process.exit(1)
})
