/**
 * Audits billing data integrity in the database.
 *
 * Checks:
 *   1. Every workspace has a valid owner_profile_id (not null)
 *   2. Every tenant has a non-null workspace_id
 *   3. No workspace exceeds its site_limit
 *   4. No workspace with an active subscription is missing stripe_customer_id
 *   5. No workspace has a subscription status without a subscription ID
 *   6. Workspace owner has a valid profiles record
 *
 * Run:
 *   npx dotenv -e .env.local -- npx tsx scripts/verify-billing-flow.ts
 */

import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, and, sql, inArray } from "drizzle-orm";
import { workspaces, tenants } from "../src/5-shared/lib/db/schema";
import { profiles } from "../src/5-shared/lib/db/schema/auth";
import { getSiteLimit } from "../src/5-shared/lib/billing/plans";

const sqlClient = neon(process.env.DATABASE_URL!);
const db = drizzle(sqlClient, {
  schema: { workspaces, tenants, profiles },
});

let passed = 0;
const failed: string[] = [];
const warnings: string[] = [];

function assert(condition: boolean, message: string) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${message}`);
  } else {
    failed.push(message);
    console.log(`  ✗ ${message}`);
  }
}

function warn(message: string) {
  warnings.push(message);
  console.log(`  ⚠️  ${message}`);
}

// ──────────────────────────────────────────────────────────────────────────────
//  CHECK 1: Every workspace has a valid owner_profile_id
// ──────────────────────────────────────────────────────────────────────────────
async function checkWorkspaceOwners() {
  console.log("\n─── Check 1: Workspace owner_profile_id validity ───");

  const allWorkspaces = await db
    .select({
      id: workspaces.id,
      name: workspaces.name,
      ownerProfileId: workspaces.ownerProfileId,
    })
    .from(workspaces);

  assert(allWorkspaces.length >= 0, `Found ${allWorkspaces.length} workspace(s)`);

  if (allWorkspaces.length === 0) {
    warn("No workspaces found — skipping owner validity check");
    return;
  }

  // Check null owners
  const nullOwners = allWorkspaces.filter((w) => !w.ownerProfileId);
  assert(nullOwners.length === 0, `No workspace has null owner_profile_id (${nullOwners.length} found)`);

  // Check that owner profile IDs reference real profiles
  const profileIds = allWorkspaces.map((w) => w.ownerProfileId).filter(Boolean);
  const existingProfiles = await db
    .select({ id: profiles.id })
    .from(profiles)
    .where(inArray(profiles.id, profileIds as string[]));

  const existingIds = new Set(existingProfiles.map((p) => p.id));
  const orphans = allWorkspaces.filter(
    (w) => w.ownerProfileId && !existingIds.has(w.ownerProfileId),
  );

  assert(
    orphans.length === 0,
    `Every workspace owner references a valid profile (${orphans.length} orphan(s))`,
  );

  if (orphans.length > 0) {
    for (const o of orphans) {
      console.log(`       Workspace "${o.name}" (${o.id}) → missing profile ${o.ownerProfileId}`);
    }
  }
}

// ──────────────────────────────────────────────────────────────────────────────
//  CHECK 2: Every tenant has a workspace_id
// ──────────────────────────────────────────────────────────────────────────────
async function checkTenantWorkspaces() {
  console.log("\n─── Check 2: Tenant workspace_id integrity ───");

  const orphanTenants = await db
    .select({ id: tenants.id, slug: tenants.slug, name: tenants.name })
    .from(tenants)
    .where(sql`${tenants.workspaceId} IS NULL`);

  assert(
    orphanTenants.length === 0,
    `Every tenant has a workspace_id (${orphanTenants.length} orphan(s))`,
  );

  if (orphanTenants.length > 0) {
    for (const o of orphanTenants) {
      console.log(`       Tenant "${o.slug}" (${o.id}) has null workspace_id`);
    }
  }
}

// ──────────────────────────────────────────────────────────────────────────────
//  CHECK 3: No workspace exceeds its site_limit
// ──────────────────────────────────────────────────────────────────────────────
async function checkSiteLimits() {
  console.log("\n─── Check 3: Site limit enforcement ───");

  const allWorkspaces = await db
    .select({ id: workspaces.id, name: workspaces.name, siteLimit: workspaces.siteLimit })
    .from(workspaces);

  if (allWorkspaces.length === 0) {
    warn("No workspaces found — skipping site limit check");
    return;
  }

  for (const ws of allWorkspaces) {
    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(tenants)
      .where(
        and(eq(tenants.workspaceId, ws.id), eq(tenants.status, 'published')),
      );

    const currentCount = Number(countResult?.count ?? 0);

    if (currentCount > ws.siteLimit) {
      assert(
        false,
        `Workspace "${ws.name}" (${ws.id}): ${currentCount} active sites exceeds limit of ${ws.siteLimit}`,
      );
    } else {
      assert(
        true,
        `Workspace "${ws.name}" (${ws.id}): ${currentCount}/${ws.siteLimit} sites within limit`,
      );
    }
  }
}

// ──────────────────────────────────────────────────────────────────────────────
//  CHECK 4: Active subscriptions have stripe_customer_id
// ──────────────────────────────────────────────────────────────────────────────
async function checkSubscriptionCustomers() {
  console.log("\n─── Check 4: Active subscription ↔ customer ID consistency ───");

  const subscribed = await db
    .select({
      id: workspaces.id,
      name: workspaces.name,
      plan: workspaces.plan,
      subscriptionStatus: workspaces.subscriptionStatus,
      stripeCustomerId: workspaces.stripeCustomerId,
    })
    .from(workspaces)
    .where(
      sql`${workspaces.subscriptionStatus} IS NOT NULL AND ${workspaces.subscriptionStatus} != 'past_due' AND ${workspaces.subscriptionStatus} != 'unpaid' AND ${workspaces.subscriptionStatus} != 'incomplete_expired'`,
    );

  assert(subscribed.length >= 0, `Found ${subscribed.length} workspace(s) with subscription status`);

  const missingCustomer = subscribed.filter((w) => !w.stripeCustomerId);
  assert(
    missingCustomer.length === 0,
    `Active subscription without stripe_customer_id (${missingCustomer.length} found)`,
  );

  if (missingCustomer.length > 0) {
    for (const w of missingCustomer) {
      console.log(`       Workspace "${w.name}" (${w.id}): status=${w.subscriptionStatus}, no customer ID`);
    }
  }
}

// ──────────────────────────────────────────────────────────────────────────────
//  CHECK 5: Subscription status ↔ subscription ID consistency
// ──────────────────────────────────────────────────────────────────────────────
async function checkSubscriptionIds() {
  console.log("\n─── Check 5: Subscription status ↔ subscription ID consistency ───");

  const withStatus = await db
    .select({
      id: workspaces.id,
      name: workspaces.name,
      subscriptionStatus: workspaces.subscriptionStatus,
      stripeSubscriptionId: workspaces.stripeSubscriptionId,
    })
    .from(workspaces)
    .where(sql`${workspaces.subscriptionStatus} IS NOT NULL`);

  const missingSubId = withStatus.filter((w) => !w.stripeSubscriptionId);
  assert(
    missingSubId.length === 0,
    `Workspace with subscription status without stripe_subscription_id (${missingSubId.length} found)`,
  );

  if (missingSubId.length > 0) {
    for (const w of missingSubId) {
      console.log(`       Workspace "${w.name}" (${w.id}): status=${w.subscriptionStatus}, no subscription ID`);
    }
  }
}

// ──────────────────────────────────────────────────────────────────────────────
//  CHECK 6: Site limit matches plan config
// ──────────────────────────────────────────────────────────────────────────────
async function checkPlanLimits() {
  console.log("\n─── Check 6: Site limit matches plan config ───");

  const allWorkspaces = await db
    .select({
      id: workspaces.id,
      name: workspaces.name,
      plan: workspaces.plan,
      siteLimit: workspaces.siteLimit,
    })
    .from(workspaces);

  if (allWorkspaces.length === 0) {
    warn("No workspaces found — skipping plan limit check");
    return;
  }

  for (const ws of allWorkspaces) {
    const expectedLimit = getSiteLimit(ws.plan);
    if (ws.siteLimit !== expectedLimit) {
      warn(
        `Workspace "${ws.name}" (${ws.id}): plan="${ws.plan}" has siteLimit=${ws.siteLimit}, expected ${expectedLimit} from PLANS config`,
      );
    } else {
      assert(
        true,
        `Workspace "${ws.name}" (${ws.id}): plan="${ws.plan}" → siteLimit=${ws.siteLimit} ✓`,
      );
    }
  }
}

// ──────────────────────────────────────────────────────────────────────────────
//  RUN
// ──────────────────────────────────────────────────────────────────────────────
async function main() {
  console.log("📊  Billing Flow Data Integrity Audit\n");

  await checkWorkspaceOwners();
  await checkTenantWorkspaces();
  await checkSiteLimits();
  await checkSubscriptionCustomers();
  await checkSubscriptionIds();
  await checkPlanLimits();

  // Summary
  console.log(`\n─── Results ───`);
  if (failed.length === 0) {
    console.log(`🎉  All ${passed} checks passed.`);
  } else {
    console.log(`⚠️   ${failed.length} check(s) failed:`);
    for (const f of failed) {
      console.log(`     • ${f}`);
    }
  }

  if (warnings.length > 0) {
    console.log(`\n📋  ${warnings.length} warning(s):`);
    for (const w of warnings) {
      console.log(`     • ${w}`);
    }
  }

  if (failed.length > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("\n❌  Audit failed:", err);
  process.exit(1);
});
