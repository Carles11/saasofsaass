/**
 * Seed script — Backfill workspaces for existing tenant owners
 *
 * Creates one workspace per unique owner profile and assigns owned tenants
 * to that workspace.
 *
 * Run from soos-engine/:
 *   npx dotenv -e .env.local -- npx tsx src/5-shared/lib/db/seed-workspaces.ts
 *
 * Idempotent: re-running skips profiles that already have a workspace.
 */
import * as dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(process.cwd(), '.env.local') })

import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { eq, inArray } from 'drizzle-orm'
import { workspaces, tenants } from './schema'
import { profiles, tenantMemberships } from './schema/auth'
import { getSiteLimit } from '../billing/plans'

const sqlClient = neon(process.env.DATABASE_URL!)
const db = drizzle(sqlClient, {
  schema: { workspaces, tenants, profiles, tenantMemberships },
})

async function main() {
  console.log('Seeding workspaces for existing tenant owners…\n')

  const ownerRows = await db
    .select({
      profileId: tenantMemberships.profileId,
      tenantId: tenantMemberships.tenantId,
    })
    .from(tenantMemberships)
    .where(eq(tenantMemberships.role, 'owner'))

  if (ownerRows.length === 0) {
    console.log('  No tenant owners found — nothing to do.')
    return
  }

  const ownerTenantsMap = new Map<string, string[]>()
  for (const row of ownerRows) {
    const list = ownerTenantsMap.get(row.profileId) ?? []
    list.push(row.tenantId)
    ownerTenantsMap.set(row.profileId, list)
  }

  console.log(`  Found ${ownerTenantsMap.size} unique owner profile(s).`)

  let created = 0
  let skipped = 0

  for (const [profileId, tenantIds] of ownerTenantsMap) {
    const [existing] = await db
      .select({ id: workspaces.id })
      .from(workspaces)
      .where(eq(workspaces.ownerProfileId, profileId))
      .limit(1)

    if (existing) {
      skipped++
      // Assign any unassigned tenants to existing workspace (idempotent)
      await db
        .update(tenants)
        .set({ workspaceId: existing.id })
        .where(inArray(tenants.id, tenantIds))
      continue
    }

    const [profile] = await db
      .select({ name: profiles.name })
      .from(profiles)
      .where(eq(profiles.id, profileId))
      .limit(1)

    const workspaceName = profile?.name
      ? `${profile.name}'s Account`
      : 'My Account'

    const [ws] = await db
      .insert(workspaces)
      .values({
        name: workspaceName,
        ownerProfileId: profileId,
        plan: 'free',
        siteLimit: getSiteLimit('free'),
      })
      .returning({ id: workspaces.id })

    if (tenantIds.length > 0) {
      await db
        .update(tenants)
        .set({ workspaceId: ws.id })
        .where(inArray(tenants.id, tenantIds))
    }

    created++
    console.log(`  ✓ Workspace for profile ${profileId} — ${tenantIds.length} tenant(s) assigned`)
  }

  console.log(`\nDone. ${created} workspace(s) created, ${skipped} already existed.`)
}

main().catch(err => {
  console.error('\nSeed failed:', err)
  process.exit(1)
})
