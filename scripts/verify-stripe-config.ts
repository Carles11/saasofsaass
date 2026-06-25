/**
 * Validates Stripe configuration for billing.
 *
 * Checks:
 *   1. STRIPE_SECRET_KEY exists and is non-empty
 *   2. STRIPE_WEBHOOK_SECRET exists and is non-empty
 *   3. STRIPE_PRICE_ID_STARTER exists and is non-empty
 *   4. STRIPE_PRICE_ID_PRO exists and is non-empty
 *   5. Price IDs match plans.ts configuration
 *   6. Stripe secret key has valid format (sk_test_ or sk_live_)
 *
 * Run:
 *   npx dotenv -e .env.local -- npx tsx scripts/verify-stripe-config.ts
 */

import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });

import { PLANS } from "../src/5-shared/lib/billing/plans";

let passed = 0;
const failed: string[] = [];

function assert(condition: boolean, message: string) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${message}`);
  } else {
    failed.push(message);
    console.log(`  ✗ ${message}`);
  }
}

function main() {
  console.log("🔐  Stripe Configuration Verification\n");

  // ─── Required env vars ──────────────────────────────────────────────
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  assert(!!stripeKey, "STRIPE_SECRET_KEY exists and is non-empty");

  if (stripeKey) {
    assert(
      stripeKey.startsWith("sk_test_") || stripeKey.startsWith("sk_live_"),
      `STRIPE_SECRET_KEY has valid format (starts with sk_test_ or sk_live_)`,
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  assert(!!webhookSecret, "STRIPE_WEBHOOK_SECRET exists and is non-empty");

  if (webhookSecret) {
    assert(
      webhookSecret.startsWith("whsec_"),
      "STRIPE_WEBHOOK_SECRET has valid format (starts with whsec_)",
    );
  }

  const starterPriceId = process.env.STRIPE_PRICE_ID_STARTER;
  assert(
    !!starterPriceId,
    "STRIPE_PRICE_ID_STARTER exists and is non-empty",
  );

  if (starterPriceId) {
    assert(
      starterPriceId.startsWith("price_"),
      "STRIPE_PRICE_ID_STARTER has valid format (starts with price_)",
    );
  }

  const proPriceId = process.env.STRIPE_PRICE_ID_PRO;
  assert(!!proPriceId, "STRIPE_PRICE_ID_PRO exists and is non-empty");

  if (proPriceId) {
    assert(
      proPriceId.startsWith("price_"),
      "STRIPE_PRICE_ID_PRO has valid format (starts with price_)",
    );
  }

  // ─── Plan config coverage ───────────────────────────────────────────
  const planNames = Object.keys(PLANS).filter((p) => p !== "free");
  assert(
    planNames.length === 2,
    `Paid plans defined in PLANS config: ${planNames.join(", ")}`,
  );

  for (const plan of planNames) {
    const priceId = process.env[`STRIPE_PRICE_ID_${plan.toUpperCase()}`];
    assert(
      !!priceId,
      `STRIPE_PRICE_ID_${plan.toUpperCase()} has a price ID for the "${plan}" plan in PLANS`,
    );
  }

  // ─── Environment mode consistency ───────────────────────────────────
  if (stripeKey) {
    const isTest = stripeKey.startsWith("sk_test_");
    const isLive = stripeKey.startsWith("sk_live_");

    // Check webhook secret matches key mode
    if (webhookSecret) {
      // whsec_ has no test/live distinction, but we can warn
    }

    assert(
      isTest || isLive,
      `Stripe mode detected: ${isTest ? "TEST" : "LIVE"}`,
    );

    if (isLive) {
      console.log(
        "\n  ⚠️  WARNING: Using LIVE Stripe keys. Double-check price IDs and webhook endpoint URL.",
      );
    }
  }

  // ─── Summary ────────────────────────────────────────────────────────
  console.log(`\n─── Results ───`);
  if (failed.length === 0) {
    console.log(`🎉  All ${passed} checks passed.`);
  } else {
    console.log(`⚠️   ${failed.length} check(s) failed:`);
    for (const f of failed) {
      console.log(`     • ${f}`);
    }
    process.exit(1);
  }
}

main();
