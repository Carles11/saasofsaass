# Billing (Stripe Integration)

## Architecture

- **workspaces** table is the billing entity (one per profile)
- Plans, site limits, and price IDs derive from a single source of truth: `src/5-shared/lib/billing/plans.ts`
- Stripe client is a singleton in `src/5-shared/lib/billing/stripe.ts`
- Server actions in `src/3-features/manage-billing/actions/billingActions.ts`
- Webhook handler at `src/app/api/webhooks/stripe/route.ts`

## Plans

| Plan    | site_limit | Price ID env var          |
|---------|------------|---------------------------|
| free    | 1          | (none)                    |
| starter | 3          | `STRIPE_PRICE_ID_STARTER` |
| pro     | 10         | `STRIPE_PRICE_ID_PRO`     |

All limits are defined in `plans.ts`. Never hardcode limits elsewhere.

## Required Environment Variables

```bash
# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_STARTER=price_xxx
STRIPE_PRICE_ID_PRO=price_yyy

# App domain (used for Stripe success/cancel URLs)
NEXT_PUBLIC_APP_DOMAIN=app.localhost:3000
```

## Stripe Dashboard Configuration

### Products & Prices

Create two products in the Stripe Dashboard:

1. **Starter** — recurring subscription
   - Price: e.g. €29/month
   - Copy the Price ID (starts with `price_`)
   - Set as `STRIPE_PRICE_ID_STARTER`

2. **Pro** — recurring subscription
   - Price: e.g. €99/month
   - Copy the Price ID
   - Set as `STRIPE_PRICE_ID_PRO`

### Webhook Endpoint

Register a webhook endpoint in Stripe Dashboard → Developers → Webhooks:

- **Endpoint URL:** `https://app.saasofsaass.com/api/webhooks/stripe`
- **Events to send:**
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
- Copy the signing secret (`whsec_...`) and set as `STRIPE_WEBHOOK_SECRET`

## Local Testing with Stripe CLI

### 1. Install & Login

```bash
# macOS
brew install stripe/stripe-cli/stripe

# Login
stripe login
```

### 2. Start Dev Server + Webhook Forwarding

```bash
# Terminal 1: start Next.js
npm run dev

# Terminal 2: forward Stripe events to local webhook
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the signing secret printed by `stripe listen` and set `STRIPE_WEBHOOK_SECRET` in `.env.local`.

### 3. Test Checkout Flow

```bash
# Trigger a checkout.session.completed event
stripe trigger checkout.session.completed

# Trigger subscription lifecycle events
stripe trigger customer.subscription.created
stripe trigger customer.subscription.updated
stripe trigger customer.subscription.deleted
```

### 4. Create a Checkout Session (manual test)

Use the Stripe CLI to create a Checkout Session directly:

```bash
stripe checkout sessions create \
  --success-url "http://app.localhost:3000/dashboard" \
  --cancel-url "http://app.localhost:3000/dashboard" \
  --mode subscription \
  --line-items "[{price: 'price_xxx', quantity: 1}]"
```

## API Reference

### `createCheckoutSession(workspaceId, plan)`

Creates a Stripe Checkout Session. If the workspace already has an active subscription, redirects to the Billing Portal instead.

- **Auth:** workspace owner only
- **Returns:** `{ url: string }`

### `createBillingPortalSession(workspaceId)`

Creates a Stripe Customer Portal session for managing the subscription (upgrade, downgrade, cancel, payment methods).

- **Auth:** workspace owner only
- **Returns:** `{ url: string }`

### Webhook (`POST /api/webhooks/stripe`)

Processes Stripe events and syncs subscription state to the `workspaces` table.

- **Verification:** Signature validated via `stripe.webhooks.constructEvent`
- **Idempotency:** Re-processing the same event results in the same state
- **Events handled:**
  - `checkout.session.completed` — sets plan, site_limit, subscription ID
  - `customer.subscription.created` — sets plan from price ID
  - `customer.subscription.updated` — syncs plan changes; reverts to free on cancel/unpaid
  - `customer.subscription.deleted` — resets to free plan

## Webhook Idempotency

Updates are idempotent at the workspace level. Re-processing the same event:

- Sets the same `plan`, `site_limit`, `subscriptionStatus` values
- The DB UPDATE is a no-op when values match current state

## Pre-Launch Checklist

### 1. Local Stripe CLI Testing

Before deploying to production, validate the full billing flow locally.

**Prerequisites:**
- Stripe CLI installed (`brew install stripe/stripe-cli/stripe` or `apt install stripe-cli`)
- Stripe test-mode API keys created (Stripe Dashboard → Developers → API keys)
- Stripe products/prices created in test mode (Stripe Dashboard → Products)
- Stripe webhook endpoint created in test mode (Stripe Dashboard → Developers → Webhooks)

**Steps:**

```bash
# 1. Set test-mode env vars
export STRIPE_SECRET_KEY=sk_test_...
export STRIPE_WEBHOOK_SECRET=whsec_...
export STRIPE_PRICE_ID_STARTER=price_xxx
export STRIPE_PRICE_ID_PRO=price_yyy

# 2. Verify env vars
npx dotenv -e .env.local -- npx tsx scripts/verify-stripe-config.ts

# 3. Start dev server
npm run dev

# 4. In another terminal, forward webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# 5. Run all verification scripts
npx dotenv -e .env.local -- npx tsx scripts/verify-billing.ts
npx dotenv -e .env.local -- npx tsx scripts/verify-billing-flow.ts

# 6. Test checkout flow via Stripe CLI
stripe trigger checkout.session.completed
stripe trigger customer.subscription.created
stripe trigger customer.subscription.updated
stripe trigger customer.subscription.deleted
```

**Verify the dashboard:**
- Open `http://app.localhost:3000/{locale}/dashboard`
- Confirm BillingStatus widget shows plan name, site usage, upgrade button
- Click "Upgrade to Starter" — should redirect to Stripe Checkout (test mode)
- Complete checkout in test mode — verify redirect back to dashboard
- Confirm BillingStatus shows updated plan and "Manage Billing" button
- Click "Manage Billing" — should open Stripe Customer Portal
- Cancel subscription in portal — verify BillingStatus resets to Free

### 2. Staging Verification

If a staging environment exists:

- [ ] Deploy the latest code to staging
- [ ] Set test-mode `STRIPE_*` env vars on staging
- [ ] Run verification scripts against staging DB:
  ```bash
  npx dotenv -e .env.staging -- npx tsx scripts/verify-billing.ts
  npx dotenv -e .env.staging -- npx tsx scripts/verify-billing-flow.ts
  ```
- [ ] Complete one end-to-end checkout (test card `4242 4242 4242 4242`)
- [ ] Complete one SCA checkout (test card `4000 0025 0000 3155`)
- [ ] Cancel subscription via Stripe Customer Portal
- [ ] Verify the `/api/webhooks/stripe` endpoint returns `200` for Stripe events
- [ ] Monitor app logs for webhook processing errors

### 3. Production Webhook Setup

- [ ] Create Stripe products (Starter, Pro) in the Stripe **Live** Dashboard
- [ ] Copy live-mode Price IDs → set as `STRIPE_PRICE_ID_STARTER`, `STRIPE_PRICE_ID_PRO`
- [ ] Set live-mode `STRIPE_SECRET_KEY` (starts with `sk_live_`)
- [ ] Register webhook endpoint in Stripe Dashboard → Developers → Webhooks
  - **Endpoint URL:** `https://app.saasofsaass.com/api/webhooks/stripe`
  - **Events to send:**
    - `checkout.session.completed`
    - `customer.subscription.created`
    - `customer.subscription.updated`
    - `customer.subscription.deleted`
  - **Version:** API version `2025-03-31` (match the locked Stripe SDK)
- [ ] Copy the live-mode signing secret → set as `STRIPE_WEBHOOK_SECRET`
- [ ] Set `NEXT_PUBLIC_ROOT_DOMAIN` and `NEXT_PUBLIC_APP_DOMAIN` to production domains
- [ ] Verify webhook endpoint is accessible (not behind auth/middleware):
  ```bash
  curl -X POST https://app.saasofsaass.com/api/webhooks/stripe \
    -H "Content-Type: application/json" \
    -d '{}'
  # Expected: 400 "Missing stripe-signature header" (not 404, 500, or redirect)
  ```
- [ ] Run production verification:
  ```bash
  npx dotenv -e .env.production -- npx tsx scripts/verify-stripe-config.ts
  npx dotenv -e .env.production -- npx tsx scripts/verify-billing.ts
  npx dotenv -e .env.production -- npx tsx scripts/verify-billing-flow.ts
  ```

### 4. Rollback Procedure

If billing issues are discovered post-deployment:

**Immediate rollback:**
1. **Disable new Checkout Sessions:** Set `STRIPE_SECRET_KEY` to an invalid value or remove it — the `createCheckoutSession` action will throw immediately, blocking all upgrades.
2. **Downgrade Stripe webhook:** In Stripe Dashboard → Webhooks, disable the webhook endpoint. Existing subscription state remains correct.
3. **Revert code:** Deploy the previous version that had no billing UI. The database schema is backward-compatible — the `workspaces` table with `plan`, `siteLimit`, and `stripeCustomerId` columns will remain unused.

**Data recovery:**
- **Over-limit tenants:** If a workspace exceeds its free-plan `siteLimit` (e.g. 3 sites created on starter, then downgraded), existing tenants are **not deleted**. The site limit only blocks new creation. No data loss.
- **Subscription state mismatch:** If workspace.plan doesn't match the actual Stripe subscription, manually fix via the database:
  ```sql
  UPDATE workspaces
  SET plan = 'free', site_limit = 1, subscription_status = NULL,
      stripe_subscription_id = NULL, stripe_customer_id = NULL
  WHERE id = '<workspace-id>';
  ```
  Or re-sync by re-registering the webhook and triggering a `customer.subscription.updated` event from Stripe Dashboard.

**Monitoring during rollback:**
- Check Stripe Dashboard → Developers → Webhooks → Webhook attempts for failed deliveries
- Check application logs for `[stripe-webhook]` error messages
- If webhook events were missed during downtime, use Stripe's **Replay** feature to re-deliver them

## Verification Scripts

### Foundation Tests
```bash
npx dotenv -e .env.local -- npx tsx scripts/verify-billing.ts
```
- Concurrent workspace creation — only one workspace per profile
- Site limit enforcement — blocks at limit, excludes inactive
- Seed integrity — no tenants with null workspace_id
- Plan config integrity — all plans resolve, unknown plans throw

### Stripe Configuration Check
```bash
npx dotenv -e .env.local -- npx tsx scripts/verify-stripe-config.ts
```
- `STRIPE_SECRET_KEY` exists with valid format
- `STRIPE_WEBHOOK_SECRET` exists with valid format
- `STRIPE_PRICE_ID_STARTER` and `STRIPE_PRICE_ID_PRO` exist with valid format
- Price IDs match every paid plan in `plans.ts`
- Stripe key mode detected (test vs live)

### Billing Flow Data Integrity Audit
```bash
npx dotenv -e .env.local -- npx tsx scripts/verify-billing-flow.ts
```
- Every workspace has a valid `owner_profile_id`
- Every tenant has a non-null `workspace_id`
- No workspace exceeds its `site_limit`
- Active subscriptions have `stripe_customer_id`
- Subscription status has matching `stripe_subscription_id`
- `site_limit` matches plan config for every workspace
