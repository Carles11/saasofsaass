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

interface BillingStatusProps {
  workspaceId: string;
  plan: string;
  siteLimit: number;
  currentSites: number;
  subscriptionStatus: string | null;
  stripeCustomerId: string | null;
  nextPlan: string | null;
}

const STATUS_WARNING: Record<string, string> = {
  past_due: "Your subscription is past due. Please update your billing information to continue.",
  unpaid: "Your subscription is unpaid. Please update your billing information to continue.",
  incomplete_expired: "Your subscription payment failed. Please upgrade again.",
};

export function BillingStatus({
  workspaceId,
  plan,
  siteLimit,
  currentSites,
  subscriptionStatus,
  stripeCustomerId,
  nextPlan,
}: BillingStatusProps) {
  const [actionError, setActionError] = useState<string | null>(null);
  const [upgrading, setUpgrading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const warning = subscriptionStatus ? STATUS_WARNING[subscriptionStatus] : null;

  const handleUpgrade = useCallback(async () => {
    if (!nextPlan) return;
    setUpgrading(true);
    setActionError(null);
    try {
      const result = await createCheckoutSession(workspaceId, nextPlan);
      if (result.url) {
        window.location.href = result.url;
      }
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Failed to start upgrade.");
    } finally {
      setUpgrading(false);
    }
  }, [workspaceId, nextPlan]);

  const handleManageBilling = useCallback(async () => {
    setPortalLoading(true);
    setActionError(null);
    try {
      const result = await createBillingPortalSession(workspaceId);
      if (result.url) {
        window.location.href = result.url;
      }
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Failed to open billing portal.");
    } finally {
      setPortalLoading(false);
    }
  }, [workspaceId]);

  const planLabel = PLAN_LABELS[plan as PlanId] || plan;
  const nextPlanLabel = nextPlan ? PLAN_LABELS[nextPlan as PlanId] || nextPlan : null;

  return (
    <div className="bg-card border border-border rounded-xl p-6 mb-8 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <span className="size-1.5 rounded-full bg-current" />
            {planLabel}
          </span>
          <span className="text-sm text-muted-foreground">
            {currentSites} / {siteLimit} sites used
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
              {upgrading ? "Opening..." : `Upgrade to ${nextPlanLabel}`}
            </Button>
          )}
          {stripeCustomerId && (
            <Button
              variant="outline"
              size="sm"
              disabled={portalLoading}
              onClick={handleManageBilling}
            >
              {portalLoading ? "Opening..." : "Manage Billing"}
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
