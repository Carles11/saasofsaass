"use client";

import { Button } from "@/components/ui/button";
import {
  createCheckoutSession,
  createBillingPortalSession,
} from "@/3-features/manage-billing/actions/billingActions";
import { useCallback, useState } from "react";
import {
  PLAN_LABELS,
  type PlanId,
} from "@/5-shared/lib/billing/plans";
import { resolveTranslation, type TranslationDict } from "@/5-shared/lib/translations/resolve";

interface BillingStatusProps {
  workspaceId: string;
  plan: string;
  siteLimit: number;
  currentSites: number;
  subscriptionStatus: string | null;
  stripeCustomerId: string | null;
  nextPlan: string | null;
  translations?: Record<string, TranslationDict>;
}

const STATUS_WARNING_KEYS: Record<string, string> = {
  past_due: "status-warning.past-due",
  unpaid: "status-warning.unpaid",
  incomplete_expired: "status-warning.incomplete-expired",
};

function statusFallback(status: string): string {
  const map: Record<string, string> = {
    past_due: "Your subscription is past due. Please update your billing information to continue.",
    unpaid: "Your subscription is unpaid. Please update your billing information to continue.",
    incomplete_expired: "Your subscription payment failed. Please upgrade again.",
  };
  return map[status] ?? "";
}

export function BillingStatus({
  workspaceId,
  plan,
  siteLimit,
  currentSites,
  subscriptionStatus,
  stripeCustomerId,
  nextPlan,
  translations,
}: BillingStatusProps) {
  const billingT = translations?.["dashboard.billing"];
  const t = (key: string, fallback: string) => resolveTranslation(billingT, key, fallback);

  const warningKey = subscriptionStatus ? STATUS_WARNING_KEYS[subscriptionStatus] : null;
  const warning = warningKey
    ? t(warningKey, statusFallback(subscriptionStatus!))
    : null;

  const sitesLabel = t("usage.sites.count", "{current} / {limit} published sites");
  const upgradeLabel = nextPlan ? t("upgrade", "Upgrade to {plan}") : null;
  const openingLabel = t("opening", "Opening...");
  const manageBillingLabel = t("manage-subscription", "Manage Subscription");
  const upgradeFailedLabel = t("error.upgrade-failed", "Failed to start upgrade.");
  const portalFailedLabel = t("error.portal-failed", "Failed to open billing portal.");
  const [actionError, setActionError] = useState<string | null>(null);
  const [upgrading, setUpgrading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  const handleUpgrade = useCallback(async () => {
    if (!nextPlan) return;
    setUpgrading(true);
    setActionError(null);
    try {
      const result = await createCheckoutSession(workspaceId, nextPlan);
      if (result.url) {
        window.location.href = result.url;
      }
    } catch {
      setActionError(upgradeFailedLabel);
    } finally {
      setUpgrading(false);
    }
  }, [workspaceId, nextPlan, upgradeFailedLabel]);

  const handleManageBilling = useCallback(async () => {
    setPortalLoading(true);
    setActionError(null);
    try {
      const result = await createBillingPortalSession(workspaceId);
      if (result.url) {
        window.location.href = result.url;
      }
    } catch {
      setActionError(portalFailedLabel);
    } finally {
      setPortalLoading(false);
    }
  }, [workspaceId, portalFailedLabel]);

  const planLabel = PLAN_LABELS[plan as PlanId] || plan;
  const nextPlanLabel = nextPlan ? PLAN_LABELS[nextPlan as PlanId] || nextPlan : null;

  const renderedSiteLimit = siteLimit < 0 ? "∞" : String(siteLimit);

  return (
    <div className="bg-card border border-border rounded-xl p-6 mb-8 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <span className="size-1.5 rounded-full bg-current" />
            {planLabel}
          </span>
          <span className="text-sm text-muted-foreground">
            {sitesLabel.replace("{current}", String(currentSites)).replace("{limit}", renderedSiteLimit)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {nextPlan && (
            <Button
              variant="default"
              size="sm"
              disabled={upgrading}
              onClick={handleUpgrade}
            >
              {upgrading ? openingLabel : upgradeLabel?.replace("{plan}", nextPlanLabel ?? "")}
            </Button>
          )}
          {stripeCustomerId && (
            <Button
              variant="outline"
              size="sm"
              disabled={portalLoading}
              onClick={handleManageBilling}
            >
              {portalLoading ? openingLabel : manageBillingLabel}
            </Button>
          )}
        </div>
      </div>
      {warning && (
        <div className="mt-3 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {warning}
        </div>
      )}
      {actionError && (
        <div className="mt-3 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {actionError}
        </div>
      )}
    </div>
  );
}
