"use server";

import { requireProfile } from "@/5-shared/lib/auth/authorization";
import { db } from "@/5-shared/lib/db";
import { workspaces } from "@/5-shared/lib/db/schema";
import { eq } from "drizzle-orm";
import Stripe from "stripe";
import { getStripe } from "@/5-shared/lib/billing/stripe";
import { getPlan, getStripePriceId, getSiteLimit } from "@/5-shared/lib/billing/plans";

function getBaseUrl(): string {
  const host = process.env.NEXT_PUBLIC_APP_DOMAIN || "app.localhost:3000";
  return `https://${host}`;
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
export async function createCheckoutSession(workspaceId: string, plan: string) {
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
  const priceId = getStripePriceId(plan);

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
        console.log(`[stripe-webhook] checkout.session.completed — missing metadata, skipping`);
        break;
      }

      const subscriptionId = session.subscription as string | null;
      if (!subscriptionId) {
        console.log(`[stripe-webhook] checkout.session.completed — no subscription, skipping`);
        break;
      }

      // Retrieve subscription to check status — don't upgrade if SCA is still pending
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      if (subscription.status !== "active" && subscription.status !== "trialing") {
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
        console.log(`[stripe-webhook] subscription.created — no workspace for customer ${customerId}, skipping`);
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
        console.log(`[stripe-webhook] subscription.updated — no workspace for sub ${subscription.id}, skipping`);
        break;
      }

      const status = subscription.status;

      if (status === "canceled" || status === "unpaid" || status === "incomplete_expired") {
        await db
          .update(workspaces)
          .set({
            plan: "free",
            siteLimit: getSiteLimit("free"),
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

    if (priceId === process.env.STRIPE_PRICE_ID_STARTER) return "starter";
    if (priceId === process.env.STRIPE_PRICE_ID_PRO) return "pro";
  }

  return "free";
}
