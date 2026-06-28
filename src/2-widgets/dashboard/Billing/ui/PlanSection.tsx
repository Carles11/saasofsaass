"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { resolveTranslation, type TranslationDict } from "@/5-shared/lib/translations/resolve";
import { getEffectiveSiteLimit, isUnlimited, PLAN_LABELS, type PlanId, type PlanConfig } from "@/5-shared/lib/billing/plans";
import { useCallback, useState } from "react";
import { createCheckoutSession, createBillingPortalSession } from "@/3-features/manage-billing/actions/billingActions";

interface PlanSectionProps {
  workspace: {
    id: string;
    name: string;
    plan: string;
    siteLimit: number;
    addonSites: number;
    aiBlocksUsed: number;
    stripeCustomerId: string | null;
    subscriptionStatus: string | null;
  };
  planConfig: PlanConfig;
  nextPlan: string | null;
  currentSites: number;
  translations?: TranslationDict;
}

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  active: "default",
  past_due: "destructive",
  unpaid: "destructive",
  canceled: "outline",
  incomplete: "outline",
};

export function PlanSection({ workspace, planConfig, nextPlan, currentSites, translations }: PlanSectionProps) {
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const effectiveLimit = getEffectiveSiteLimit(workspace.plan, workspace.addonSites);
  const sitesLabel = isUnlimited(effectiveLimit) ? "∞" : String(effectiveLimit);
  const aiLimit = planConfig.limits.aiBlocksLifetime;
  const aiUnlimited = isUnlimited(aiLimit);

  const planLabel = PLAN_LABELS[workspace.plan as PlanId] || workspace.plan;
  const nextPlanLabel = nextPlan ? PLAN_LABELS[nextPlan as PlanId] || nextPlan : null;
  const displayStatus = workspace.subscriptionStatus
    ? statusLabels(workspace.subscriptionStatus)
    : null;

  function statusLabels(status: string): string {
    const labels: Record<string, string> = {
      active: resolveTranslation(translations, "subscription.active", "Active"),
      past_due: resolveTranslation(translations, "subscription.past-due", "Past Due"),
      unpaid: resolveTranslation(translations, "subscription.unpaid", "Unpaid"),
      canceled: resolveTranslation(translations, "subscription.canceled", "Canceled"),
      incomplete: resolveTranslation(translations, "subscription.incomplete", "Incomplete"),
    };
    return labels[status] ?? status;
  }

  const handleUpgrade = useCallback(async () => {
    if (!nextPlan) return;
    setActionLoading("upgrade");
    setActionError(null);
    try {
      const result = await createCheckoutSession(workspace.id, nextPlan);
      if (result.url) window.location.href = result.url;
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Failed to start upgrade.");
    } finally {
      setActionLoading(null);
    }
  }, [workspace.id, nextPlan]);

  const handleManageBilling = useCallback(async () => {
    setActionLoading("portal");
    setActionError(null);
    try {
      const result = await createBillingPortalSession(workspace.id);
      if (result.url) window.location.href = result.url;
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Failed to open billing portal.");
    } finally {
      setActionLoading(null);
    }
  }, [workspace.id]);

  const section = (key: string, fallback: string) =>
    resolveTranslation(translations, key, fallback);

  return (
    <div className="space-y-6">
      {/* Plan Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>{section("plan.title", "Current Plan")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Badge variant="default" className="text-sm px-3 py-1">{planLabel}</Badge>
              {displayStatus && (
                <Badge variant={STATUS_VARIANT[workspace.subscriptionStatus ?? ""] ?? "outline"}>
                  {displayStatus}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {workspace.stripeCustomerId && (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={actionLoading === "portal"}
                  onClick={handleManageBilling}
                >
                  {actionLoading === "portal"
                    ? section("opening", "Opening...")
                    : section("manage-subscription", "Manage Subscription")}
                </Button>
              )}
              {nextPlan && (
                <Button
                  variant="default"
                  size="sm"
                  disabled={actionLoading === "upgrade"}
                  onClick={handleUpgrade}
                >
                  {actionLoading === "upgrade"
                    ? section("opening", "Opening...")
                    : section("upgrade", "Upgrade to {plan}").replace("{plan}", nextPlanLabel ?? nextPlan)}
                </Button>
              )}
            </div>
          </div>

          {actionError && (
            <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {actionError}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage Meters */}
      <Card>
        <CardHeader>
          <CardTitle>{section("usage.title", "Usage")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <UsageMeter
            label={section("usage.sites", "Published Sites")}
            used={currentSites}
            limit={effectiveLimit}
            hint={workspace.addonSites > 0
              ? `(${workspace.siteLimit} base + ${workspace.addonSites} add-on)`
              : undefined}
          />
          <UsageMeter
            label={section("usage.ai-blocks", "AI Translations")}
            used={workspace.aiBlocksUsed}
            limit={aiLimit}
          />
        </CardContent>
      </Card>

      {/* Plan Features */}
      <Card>
        <CardHeader>
          <CardTitle>{section("features.title", "What's Included")}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <FeatureItem
              label={section("features.sites", "Published Sites")}
              value={sitesLabel}
            />
            <FeatureItem
              label={section("features.languages", "Languages per Site")}
              value={isUnlimited(planConfig.limits.languagesPerSite) ? "∞" : String(planConfig.limits.languagesPerSite)}
            />
            <FeatureItem
              label={section("features.ai-blocks", "AI Translation Blocks")}
              value={aiUnlimited ? "∞" : String(aiLimit)}
            />
            <FeatureItem
              label={section("features.custom-domains", "Custom Domains")}
              value={planConfig.features.customDomains ? "✓" : "—"}
            />
            <FeatureItem
              label={section("features.team-members", "Team Members")}
              value={isUnlimited(planConfig.limits.teamMembers) ? "∞" : String(planConfig.limits.teamMembers)}
            />
            <FeatureItem
              label={section("features.priority-support", "Priority Support")}
              value={planConfig.features.prioritySupport ? "✓" : "—"}
            />
            <FeatureItem
              label={section("features.branding", "White-Label")}
              value={planConfig.features.branding === "none" ? "✓" : "—"}
            />
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function UsageMeter({ label, used, limit, hint }: { label: string; used: number; limit: number; hint?: string }) {
  const unlimited = isUnlimited(limit);
  const pct = unlimited ? 100 : Math.min(100, Math.round((used / Math.max(1, limit)) * 100));
  const display = unlimited ? `${used} / ∞` : `${used} / ${limit}`;

  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-xs text-muted-foreground">{display} {hint && <span className="text-muted-foreground">{hint}</span>}</span>
      </div>
      {!unlimited && (
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}

function FeatureItem({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </li>
  );
}
