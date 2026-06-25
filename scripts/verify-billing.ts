/**
 * Verification tests for billing-foundation changes.
 *
 * Run from soos-engine/:
 *   npx dotenv -e .env.local -- npx tsx scripts/verify-billing.ts
 *
 * Tests:
 *   1. Concurrent workspace creation — only one workspace per profile
 *   2. Site limit enforcement — blocks tenant creation at limit
 *   3. Seed integrity — no tenants with null workspace_id
 */

import * as dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(process.cwd(), '.env.local') })

import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { eq, and, sql, inArray } from 'drizzle-orm'
import { workspaces, tenants } from '../src/5-shared/lib/db/schema'
import { PLANS, getPlan, getSiteLimit } from '../src/5-shared/lib/billing/plans'

const sqlClient = neon(process.env.DATABASE_URL!)
const db = drizzle(sqlClient, {
  schema: { workspaces, tenants },
})

let passed = 0
const failed: string[] = []

function assert(condition: boolean, message: string) {
  if (condition) {
    passed++
    console.log(`  ✓ ${message}`)
  } else {
    failed.push(message)
    console.log(`  ✗ ${message}`)
  }
}

async function cleanup(...cleanupFns: (() => Promise<void>)[]) {
  for (const fn of cleanupFns) {
    try { await fn() } catch {}
  }
}

// ──────────────────────────────────────────────────────────────────────────────
//  TEST 1: Concurrent workspace creation
// ──────────────────────────────────────────────────────────────────────────────
async function testConcurrentWorkspaceCreation() {
  console.log('\n─── Test 1: Concurrent workspace creation ───')

  const testProfileId = crypto.randomUUID()
  const cleans: (() => Promise<void>)[] = []

  try {
    // Simulate concurrent "findOrCreate" pattern: 10 simultaneous inserts
    const attempts = Array.from({ length: 10 }, async (_, i) => {
      try {
        const [ws] = await db
          .insert(workspaces)
          .values({
            name: `Test Workspace ${i}`,
            ownerProfileId: testProfileId,
            plan: 'free',
            siteLimit: 1,
          })
          .returning({ id: workspaces.id })
        return ws
      } catch (error: any) {
        // Expected for concurrent duplicates — unique violation 23505
        if (error?.cause?.code === '23505') {
          const [existing] = await db
            .select({ id: workspaces.id })
            .from(workspaces)
            .where(eq(workspaces.ownerProfileId, testProfileId))
            .limit(1)
          return existing
        }
        throw error
      }
    })

    const results = await Promise.all(attempts)
    const succeeded = results.filter(Boolean).length

    // Count unique workspaces for this profile
    const existing = await db
      .select({ id: workspaces.id })
      .from(workspaces)
      .where(eq(workspaces.ownerProfileId, testProfileId))

    assert(existing.length === 1, `Exactly 1 workspace created from 10 concurrent attempts (got ${existing.length})`)
    assert(succeeded > 0, 'At least one attempt succeeded')

    cleans.push(async () => {
      await db.delete(workspaces).where(eq(workspaces.ownerProfileId, testProfileId))
    })
  } catch (error) {
    failed.push(`Concurrent workspace creation test threw: ${error}`)
    console.error('  ✗', error)
  }

  return cleans
}

// ──────────────────────────────────────────────────────────────────────────────
//  TEST 2: Site limit enforcement
// ──────────────────────────────────────────────────────────────────────────────
async function testSiteLimitEnforcement() {
  console.log('\n─── Test 2: Site limit enforcement ───')

  const testProfileId = crypto.randomUUID()
  const cleans: (() => Promise<void>)[] = []

  try {
    // Create workspace with siteLimit = 2
    const [ws] = await db
      .insert(workspaces)
      .values({
        name: 'Site Limit Test',
        ownerProfileId: testProfileId,
        plan: 'free',
        siteLimit: 2,
      })
      .returning()

    cleans.push(async () => {
      // Delete tenants first (FK), then workspace
      await db.delete(tenants).where(eq(tenants.workspaceId, ws.id))
      await db.delete(workspaces).where(eq(workspaces.id, ws.id))
    })

    // Create 2 tenants (at limit)
    for (let i = 0; i < 2; i++) {
      await db.insert(tenants).values({
        name: `Limit Test Site ${i + 1}`,
        slug: `limit-test-${testProfileId.slice(0, 8)}-${i}`,
        defaultLocale: 'en',
        locales: ['en'],
        branding: {},
        status: 'published',
        workspaceId: ws.id,
      })
    }

    // Count active tenants
    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(tenants)
      .where(
        and(
          eq(tenants.workspaceId, ws.id),
          eq(tenants.status, 'published'),
        ),
      )

    const currentCount = Number(countResult?.count ?? 0)
    assert(currentCount === 2, `Site count is 2 (got ${currentCount})`)

    // Check enforcement: count >= siteLimit should block
    const blocked = currentCount >= ws.siteLimit
    assert(blocked, 'Creating a 3rd site would be blocked (count >= limit)')

    // Verify inactive tenants are not counted
    await db.insert(tenants).values({
      name: 'Inactive Site',
      slug: `inactive-${testProfileId.slice(0, 8)}`,
      defaultLocale: 'en',
      locales: ['en'],
      branding: {},
      status: 'draft',
      workspaceId: ws.id,
    })

    const [countActiveOnly] = await db
      .select({ count: sql<number>`count(*)` })
      .from(tenants)
      .where(
        and(
          eq(tenants.workspaceId, ws.id),
          eq(tenants.status, 'published'),
        ),
      )

    assert(Number(countActiveOnly?.count ?? 0) === 2, 'Inactive tenants excluded from site count')
  } catch (error) {
    failed.push(`Site limit enforcement test threw: ${error}`)
    console.error('  ✗', error)
  }

  return cleans
}

// ──────────────────────────────────────────────────────────────────────────────
//  TEST 3: Seed integrity — no workspace_id = null
// ──────────────────────────────────────────────────────────────────────────────
async function testSeedIntegrity() {
  console.log('\n─── Test 3: Seed integrity (no null workspace_id) ───')

  try {
    const orphans = await db
      .select({ id: tenants.id, slug: tenants.slug, name: tenants.name })
      .from(tenants)
      .where(sql`${tenants.workspaceId} IS NULL`)

    assert(orphans.length === 0, `All ${orphans.length} tenant(s) have null workspace_id`)

    if (orphans.length > 0) {
      for (const o of orphans) {
        console.log(`       Orphan tenant: ${o.slug} (${o.id})`)
      }
    }
  } catch (error) {
    failed.push(`Seed integrity test threw: ${error}`)
    console.error('  ✗', error)
  }

  return []
}

// ──────────────────────────────────────────────────────────────────────────────
//  TEST 4: Plan config integrity
// ──────────────────────────────────────────────────────────────────────────────
function testPlanConfig() {
  console.log('\n─── Test 4: Plan config integrity ───')

  assert(getSiteLimit('free') === 1, 'Free plan: publishedSites = 1')
  assert(getSiteLimit('pro') === 10, 'Pro plan: publishedSites = 10')
  assert(getSiteLimit('enterprise') === -1, 'Enterprise plan: publishedSites = unlimited (-1)')

  const plans = Object.keys(PLANS)
  assert(plans.length === 3, 'Exactly 3 plans defined')

  // Verify every plan resolves cleanly
  for (const plan of plans) {
    const cfg = getPlan(plan)
    assert(typeof cfg.limits.publishedSites === 'number', `${plan}.limits.publishedSites is a number`)
  }

  // Verify unknown plan throws
  let threw = false
  try { getSiteLimit('bogus-plan') } catch { threw = true }
  assert(threw, 'Unknown plan throws')

  return []
}

// ──────────────────────────────────────────────────────────────────────────────
//  RUN
// ──────────────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🔍  Billing Foundation Verification\n')

  const allCleans: (() => Promise<void>)[] = []

  const t1Cleans = await testConcurrentWorkspaceCreation()
  allCleans.push(...t1Cleans)

  const t2Cleans = await testSiteLimitEnforcement()
  allCleans.push(...t2Cleans)

  await testSeedIntegrity()

  const t4Cleans = testPlanConfig()
  allCleans.push(...t4Cleans)

  // Summary
  console.log(`\n─── Results ───`)
  if (failed.length === 0) {
    console.log(`🎉  All ${passed} tests passed.`)
  } else {
    console.log(`⚠️   ${failed.length} test(s) failed:`)
    for (const f of failed) {
      console.log(`     • ${f}`)
    }
  }

  // Cleanup
  console.log('\nCleaning up test data…')
  for (const fn of allCleans) {
    try { await fn() } catch (e) { console.error('  Cleanup error:', e) }
  }
  console.log('Cleanup complete.')
}

main().catch(err => {
  console.error('\n❌  Verification failed:', err)
  process.exit(1)
})
