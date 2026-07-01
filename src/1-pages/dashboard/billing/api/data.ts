import {
  listWorkspaceInvoices,
  type WorkspaceInvoice,
} from "@/3-features/manage-billing/actions/billingActions";
import { countPublishedTenants } from "@/3-features/manage-billing/actions/billingHelpers";
import { getCurrentProfile } from "@/5-shared/lib/auth/authorization";
import { getNextPlan, getPlan } from "@/5-shared/lib/billing/plans";
import { db } from "@/5-shared/lib/db";
import { getPlatformTranslationsByNamespaces } from "@/5-shared/lib/db/platform-translations";
import { workspaces } from "@/5-shared/lib/db/schema";
import { eq } from "drizzle-orm";

export interface FullWorkspaceInfo {
  id: string;
  name: string;
  plan: string;
  siteLimit: number;
  addonSites: number;
  aiBlocksUsed: number;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  subscriptionStatus: string | null;
}

export async function getBillingPageData(locale: string) {
  const profile = await getCurrentProfile();
  if (!profile) {
    return {
      profile: null,
      workspace: null,
      planConfig: null,
      nextPlan: null,
      currentSites: 0,
      invoices: [] as WorkspaceInvoice[],
      translations: {},
    };
  }

  const [workspaceRow] = await db
    .select({
      id: workspaces.id,
      name: workspaces.name,
      plan: workspaces.plan,
      siteLimit: workspaces.siteLimit,
      addonSites: workspaces.addonSites,
      aiBlocksUsed: workspaces.aiBlocksUsed,
      stripeCustomerId: workspaces.stripeCustomerId,
      stripeSubscriptionId: workspaces.stripeSubscriptionId,
      subscriptionStatus: workspaces.subscriptionStatus,
    })
    .from(workspaces)
    .where(eq(workspaces.ownerProfileId, profile.id))
    .limit(1);

  const workspace = workspaceRow ?? null;
  const currentSites = workspace
    ? await countPublishedTenants(workspace.id)
    : 0;
  const planConfig = workspace ? getPlan(workspace.plan) : null;
  const nextPlan = workspace ? getNextPlan(workspace.plan) : null;

  // Fail-soft: a Stripe outage or missing STRIPE_SECRET_KEY should not break
  // the rest of the billing page (plan/usage is more important than history).
  let invoices: WorkspaceInvoice[] = [];
  if (workspace?.stripeCustomerId) {
    try {
      invoices = await listWorkspaceInvoices(workspace.id);
    } catch (err) {
      console.error("[billing-page] failed to load invoices:", err);
    }
  }

  const namespaced = await getPlatformTranslationsByNamespaces(
    ["dashboard.billing", "errors"],
    locale,
  );

  return {
    profile,
    workspace,
    planConfig,
    nextPlan,
    currentSites,
    invoices,
    translations: {
      ...(namespaced["dashboard.billing"] ?? {}),
      ...(namespaced.errors ?? {}),
    },
  };
}
