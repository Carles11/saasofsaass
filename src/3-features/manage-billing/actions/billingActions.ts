"use server";

import {
  assertWorkspaceOwner,
  requireProfile,
} from "@/5-shared/lib/auth/authorization";
import {
  EXTRA_SITE,
  getExtraSiteStripePriceId,
  getPlan,
  getSiteLimit,
  getStripePriceId,
  isExtraSitePriceId,
  type Cadence,
} from "@/5-shared/lib/billing/plans";
import { AddExtraSiteError } from "@/5-shared/lib/billing/errors";
import { getStripe } from "@/5-shared/lib/billing/stripe";
import { db } from "@/5-shared/lib/db";
import { workspaces } from "@/5-shared/lib/db/schema";
import { eq } from "drizzle-orm";
import Stripe from "stripe";

function getBaseUrl(): string {
  const host = process.env.NEXT_PUBLIC_APP_DOMAIN || "app.localhost";
  const port = process.env.NEXT_PUBLIC_DEV_PORT;
  return `https://${host}${port ? `:${port}` : ""}`;
}

// ============================================================================
// INVOICES — read-only list sourced live from Stripe (no local invoice table;
// Stripe is the source of truth). Normalized to a small display-safe shape so
// the UI never touches the Stripe SDK types directly.
// ============================================================================

export type InvoiceStatus =
  | "paid"
  | "open"
  | "void"
  | "uncollectible"
  | "draft";

export interface WorkspaceInvoice {
  id: string;
  /** Unix seconds. Falls back to invoice creation time if not yet finalized. */
  date: number;
  /** Human-readable line-item summary, e.g. "Pro plan — monthly". */
  description: string;
  /** Smallest currency unit (cents), matching Stripe's `amount_paid`/`amount_due`. */
  amount: number;
  currency: string;
  status: InvoiceStatus;
  /** Stripe-hosted invoice page — null only for draft invoices with no URL yet. */
  hostedInvoiceUrl: string | null;
  /** Direct PDF download — null only for draft invoices with no URL yet. */
  invoicePdf: string | null;
}

function normalizeInvoice(inv: Stripe.Invoice): WorkspaceInvoice {
  const description =
    inv.lines.data[0]?.description ||
    inv.description ||
    `Invoice ${inv.number ?? inv.id}`;

  return {
    id: inv.id ?? "",
    date: inv.status_transitions?.finalized_at ?? inv.created,
    description,
    amount: inv.status === "paid" ? inv.amount_paid : inv.amount_due,
    currency: inv.currency,
    status: (inv.status ?? "draft") as InvoiceStatus,
    hostedInvoiceUrl: inv.hosted_invoice_url ?? null,
    invoicePdf: inv.invoice_pdf ?? null,
  };
}

/**
 * List a workspace's Stripe invoices (most recent first).
 *
 * Read-only — Stripe is the source of truth, there is no local invoices table.
 * Returns an empty list for workspaces that have never had a Stripe customer
 * (e.g. still on Free, never started checkout) rather than erroring.
 */
export async function listWorkspaceInvoices(
  workspaceId: string,
  limit = 20,
): Promise<WorkspaceInvoice[]> {
  await assertWorkspaceOwner(workspaceId);

  const [ws] = await db
    .select({ stripeCustomerId: workspaces.stripeCustomerId })
    .from(workspaces)
    .where(eq(workspaces.id, workspaceId))
    .limit(1);

  if (!ws?.stripeCustomerId) return [];

  const stripe = getStripe();
  const result = await stripe.invoices.list({
    customer: ws.stripeCustomerId,
    limit,
  });

  return result.data.map(normalizeInvoice);
}

async function getOrCreateCustomer(workspaceId: string): Promise<string> {
  const [ws] = await db
    .select({ stripeCustomerId: workspaces.stripeCustomerId })
    .from(workspaces)
    .where(eq(workspaces.id, workspaceId))
    .limit(1);

  if (!ws) throw new Error("Workspace not found");
  if (ws.stripeCustomerId) return ws.stripeCustomerId;

  const stripe = getStripe();
  const customer = await stripe.customers.create({
    metadata: { workspaceId },
  });

  await db
    .update(workspaces)
    .set({ stripeCustomerId: customer.id })
    .where(eq(workspaces.id, workspaceId));

  return customer.id;
}

/**
 * Create a Stripe Checkout Session for upgrading the user's workspace plan.
 *
 * If the workspace already has an active subscription, redirects to Billing Portal instead.
 */
export async function createCheckoutSession(
  workspaceId: string,
  plan: string,
  cadence: Cadence = "monthly",
) {
  const profile = await requireProfile();

  // Validate plan
  getPlan(plan);

  const [ws] = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.id, workspaceId))
    .limit(1);

  if (!ws) throw new Error("Workspace not found");
  if (ws.ownerProfileId !== profile.id) throw new Error("Not authorized");

  // If already subscribed, redirect to portal
  if (ws.subscriptionStatus === "active") {
    return await createBillingPortalSession(workspaceId);
  }

  const stripe = getStripe();
  const customerId = await getOrCreateCustomer(workspaceId);
  const priceId = getStripePriceId(plan, cadence);

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${getBaseUrl()}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${getBaseUrl()}/dashboard`,
    metadata: { workspaceId, plan },
  });

  return { url: session.url };
}

/**
 * Start checkout for the currently signed-in user's own workspace.
 *
 * Used by public surfaces (e.g. the /pricing page) where the workspace id isn't
 * in scope — resolves the caller's owned workspace from the session, then
 * delegates to createCheckoutSession. Throws if the user owns no workspace.
 */
export async function createCheckoutSessionForCurrentUser(
  plan: string,
  cadence: Cadence = "monthly",
) {
  const profile = await requireProfile();

  const [ws] = await db
    .select({ id: workspaces.id })
    .from(workspaces)
    .where(eq(workspaces.ownerProfileId, profile.id))
    .limit(1);

  if (!ws) throw new Error("No workspace found for current user");

  return createCheckoutSession(ws.id, plan, cadence);
}

/**
 * Create a Stripe Billing Portal session for managing the subscription.
 */
export async function createBillingPortalSession(workspaceId: string) {
  const profile = await requireProfile();

  const [ws] = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.id, workspaceId))
    .limit(1);

  if (!ws) throw new Error("Workspace not found");
  if (ws.ownerProfileId !== profile.id) throw new Error("Not authorized");

  const stripe = getStripe();

  // Ensure customer exists
  const customerId = await getOrCreateCustomer(workspaceId);

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${getBaseUrl()}/dashboard`,
  });

  return { url: session.url };
}

// ============================================================================
// EXTRA-SITE ADD-ON — Pro-plan workspaces can buy additional published-site
// slots (€19/mo each, up to EXTRA_SITE.softCap). Modeled as a second line item
// on the same subscription so cadence is inherited and Stripe handles proration.
// Removal goes through the Billing Portal (no in-app "−" button — Stripe is
// the source of truth for quantity and the webhook reconciles).
// ============================================================================

/**
 * Add one published-site slot to a Pro workspace by incrementing the
 * extra-site line item on its active Stripe subscription.
 *
 * - Pro only (Free upgrades to Pro first; Enterprise is already unlimited).
 * - Cadence mirrors the base subscription item.
 * - Soft-capped at EXTRA_SITE.softCap; beyond that we recommend Enterprise.
 * - Optimistically writes `addonSites + 1` to the DB after Stripe confirms,
 *   so the caller can immediately retry publish without waiting for the
 *   webhook. The webhook (`subscription.updated`) reconciles the final value.
 */
export async function addExtraSite(workspaceId: string) {
  const profile = await requireProfile();

  const [ws] = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.id, workspaceId))
    .limit(1);

  if (!ws) throw new Error("Workspace not found");
  if (ws.ownerProfileId !== profile.id) throw new Error("Not authorized");

  if (ws.plan !== "pro") {
    throw new AddExtraSiteError(
      "NOT_PRO_PLAN",
      "Extra-site add-ons are available on the Pro plan.",
    );
  }

  if (!ws.stripeSubscriptionId || ws.subscriptionStatus !== "active") {
    throw new AddExtraSiteError(
      "NO_ACTIVE_SUBSCRIPTION",
      "You need an active Pro subscription to add extra sites.",
    );
  }

  if ((ws.addonSites ?? 0) >= EXTRA_SITE.softCap) {
    throw new AddExtraSiteError(
      "SOFT_CAP_REACHED",
      `You've reached the ${EXTRA_SITE.softCap}-site add-on limit for Pro. Upgrade to Enterprise for unlimited sites.`,
    );
  }

  const stripe = getStripe();
  const subscription = await stripe.subscriptions.retrieve(
    ws.stripeSubscriptionId,
  );

  // Detect cadence from the base plan item (the non-extra-site item).
  const baseItem = subscription.items.data.find(
    (item) => !isExtraSitePriceId(item.price.id),
  );
  const interval = baseItem?.price.recurring?.interval;
  const cadence: Cadence | null =
    interval === "month" ? "monthly" : interval === "year" ? "annual" : null;

  if (!cadence) {
    throw new AddExtraSiteError(
      "UNKNOWN_CADENCE",
      "Could not determine the subscription cadence.",
    );
  }

  const extraPriceId = getExtraSiteStripePriceId(cadence);

  // If an extra-site item already exists on the sub, increment its quantity.
  // Otherwise create a new item. Either way, Stripe handles proration.
  const existing = subscription.items.data.find(
    (item) => item.price.id === extraPriceId,
  );

  if (existing) {
    await stripe.subscriptionItems.update(existing.id, {
      quantity: (existing.quantity ?? 0) + 1,
      proration_behavior: "create_prorations",
    });
  } else {
    await stripe.subscriptionItems.create({
      subscription: subscription.id,
      price: extraPriceId,
      quantity: 1,
      proration_behavior: "create_prorations",
    });
  }

  // Optimistically update the DB so publish retry works immediately.
  // The webhook (`subscription.updated`) reconciles the final value.
  await db
    .update(workspaces)
    .set({ addonSites: (ws.addonSites ?? 0) + 1 })
    .where(eq(workspaces.id, workspaceId));

  return {
    ok: true as const,
    expectedAddonSites: (ws.addonSites ?? 0) + 1,
    cadence,
  };
}

/**
 * Add an extra site to the currently signed-in user's own workspace.
 *
 * Used by surfaces (e.g. the publish-cap dialog opened from SitesTable) that
 * don't have a workspace id in scope. Resolves the caller's owned workspace
 * from the session and delegates to addExtraSite.
 */
export async function addExtraSiteForCurrentUser() {
  const profile = await requireProfile();

  const [ws] = await db
    .select({ id: workspaces.id })
    .from(workspaces)
    .where(eq(workspaces.ownerProfileId, profile.id))
    .limit(1);

  if (!ws) throw new Error("No workspace found for current user");
  return addExtraSite(ws.id);
}

/**
 * Stripe webhook handler.
 *
 * Processes:
 * - checkout.session.completed
 * - customer.subscription.created
 * - customer.subscription.updated
 * - customer.subscription.deleted
 *
 * All updates are idempotent — re-processing the same event yields the same state.
 */
export async function stripeWebhook(rawBody: string, signature: string) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error("STRIPE_WEBHOOK_SECRET is not configured");

  const stripe = getStripe();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch {
    throw new Error("Invalid webhook signature");
  }

  console.log(`[stripe-webhook] received ${event.type} (${event.id})`);

  switch (event.type) {
    // ─── Checkout completed ────────────────────────────────────────────────
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const workspaceId = session.metadata?.workspaceId;
      const plan = session.metadata?.plan;

      if (!workspaceId || !plan) {
        console.log(
          `[stripe-webhook] checkout.session.completed — missing metadata, skipping`,
        );
        break;
      }

      const subscriptionId = session.subscription as string | null;
      if (!subscriptionId) {
        console.log(
          `[stripe-webhook] checkout.session.completed — no subscription, skipping`,
        );
        break;
      }

      // Retrieve subscription to check status — don't upgrade if SCA is still pending
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      if (
        subscription.status !== "active" &&
        subscription.status !== "trialing"
      ) {
        console.log(
          `[stripe-webhook] checkout.session.completed — sub status is "${subscription.status}", deferring to subscription.updated`,
        );
        break;
      }

      await db
        .update(workspaces)
        .set({
          stripeSubscriptionId: subscriptionId,
          stripeCustomerId: session.customer as string,
          plan,
          siteLimit: getSiteLimit(plan),
          addonSites: deriveAddonSitesFromSubscription(subscription),
          subscriptionStatus: subscription.status,
        })
        .where(eq(workspaces.id, workspaceId));

      console.log(
        `[stripe-webhook] checkout.session.completed — workspace=${workspaceId} plan=${plan} sub=${subscriptionId}`,
      );
      break;
    }

    // ─── Subscription created ──────────────────────────────────────────────
    case "customer.subscription.created": {
      const subscription = event.data.object as Stripe.Subscription;

      // Find workspace by customer ID
      const customerId = subscription.customer as string;
      const [wsByCustomer] = await db
        .select({ id: workspaces.id })
        .from(workspaces)
        .where(eq(workspaces.stripeCustomerId, customerId))
        .limit(1);

      if (!wsByCustomer) {
        console.log(
          `[stripe-webhook] subscription.created — no workspace for customer ${customerId}, skipping`,
        );
        break;
      }

      const status = subscription.status;
      const plan = derivePlanFromSubscription(subscription);

      await db
        .update(workspaces)
        .set({
          stripeSubscriptionId: subscription.id,
          plan,
          siteLimit: getSiteLimit(plan),
          addonSites: deriveAddonSitesFromSubscription(subscription),
          subscriptionStatus: status,
        })
        .where(eq(workspaces.id, wsByCustomer.id));

      console.log(
        `[stripe-webhook] subscription.created — workspace=${wsByCustomer.id} plan=${plan} status=${status}`,
      );
      break;
    }

    // ─── Subscription updated ──────────────────────────────────────────────
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;

      // Find workspace by subscription ID
      const [wsBySub] = await db
        .select({ id: workspaces.id })
        .from(workspaces)
        .where(eq(workspaces.stripeSubscriptionId, subscription.id))
        .limit(1);

      if (!wsBySub) {
        console.log(
          `[stripe-webhook] subscription.updated — no workspace for sub ${subscription.id}, skipping`,
        );
        break;
      }

      const status = subscription.status;

      if (
        status === "canceled" ||
        status === "unpaid" ||
        status === "incomplete_expired"
      ) {
        await db
          .update(workspaces)
          .set({
            plan: "free",
            siteLimit: getSiteLimit("free"),
            addonSites: 0,
            subscriptionStatus: null,
          })
          .where(eq(workspaces.id, wsBySub.id));

        console.log(
          `[stripe-webhook] subscription.updated — workspace=${wsBySub.id} → plan=free status=${status}`,
        );
      } else {
        const plan = derivePlanFromSubscription(subscription);

        await db
          .update(workspaces)
          .set({
            plan,
            siteLimit: getSiteLimit(plan),
            addonSites: deriveAddonSitesFromSubscription(subscription),
            subscriptionStatus: status,
          })
          .where(eq(workspaces.id, wsBySub.id));

        console.log(
          `[stripe-webhook] subscription.updated — workspace=${wsBySub.id} plan=${plan} status=${status}`,
        );
      }
      break;
    }

    // ─── Subscription deleted ──────────────────────────────────────────────
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;

      await db
        .update(workspaces)
        .set({
          plan: "free",
          siteLimit: getSiteLimit("free"),
          addonSites: 0,
          stripeSubscriptionId: null,
          subscriptionStatus: null,
        })
        .where(eq(workspaces.stripeSubscriptionId, subscription.id));

      console.log(
        `[stripe-webhook] subscription.deleted — sub=${subscription.id} → reset to free`,
      );
      break;
    }

    default: {
      console.log(`[stripe-webhook] unhandled event type: ${event.type}`);
    }
  }

  return { received: true };
}

/**
 * Read the current extra-site quantity from a Stripe subscription's items.
 * Returns 0 when no extra-site line item is present.
 */
function deriveAddonSitesFromSubscription(
  subscription: Stripe.Subscription,
): number {
  const item = subscription.items?.data.find((i) =>
    isExtraSitePriceId(i.price.id),
  );
  return item?.quantity ?? 0;
}

/**
 * Derive the plan name from a Stripe subscription's price IDs.
 *
 * Matches the first price from the subscription's items against
 * configured STRIPE_PRICE_ID_STARTER and STRIPE_PRICE_ID_PRO.
 * Defaults to "free" if no match.
 */
function derivePlanFromSubscription(subscription: Stripe.Subscription): string {
  const items = subscription.items?.data ?? [];

  for (const item of items) {
    const priceId = item.price.id;

    if (
      priceId === process.env.STRIPE_PRICE_ID_PRO_MONTHLY ||
      priceId === process.env.STRIPE_PRICE_ID_PRO_ANNUAL
    )
      return "pro";
    if (
      priceId === process.env.STRIPE_PRICE_ID_ENTERPRISE_MONTHLY ||
      priceId === process.env.STRIPE_PRICE_ID_ENTERPRISE_ANNUAL
    )
      return "enterprise";
  }

  return "free";
}
