import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PLAN_LABELS, type PlanId } from "@/5-shared/lib/billing/plans";
import { resolveTranslation, type TranslationDict } from "@/5-shared/lib/translations/resolve";

interface WorkspaceInfoSectionProps {
  workspace: {
    id: string;
    plan: string;
    siteLimit: number;
    currentSites: number;
    subscriptionStatus: string | null;
    stripeCustomerId: string | null;
  } | null;
  translations?: TranslationDict;
}

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  active: "default",
  past_due: "destructive",
  unpaid: "destructive",
  canceled: "outline",
  incomplete: "outline",
};

export function WorkspaceInfoSection({ workspace, translations }: WorkspaceInfoSectionProps) {
  const title = resolveTranslation(translations, "workspace.title", "Workspace");
  const planLabel = resolveTranslation(translations, "workspace.plan", "Plan");
  const sitesUsed = resolveTranslation(translations, "workspace.sites-used", "{used} / {limit} sites used");
  const manageBilling = resolveTranslation(translations, "workspace.manage-billing", "Manage Billing");
  const noWorkspace = resolveTranslation(translations, "workspace.no-workspace", "No workspace found.");

  const statusLabels: Record<string, string> = {
    active: resolveTranslation(translations, "workspace.subscription-active", "Active"),
    past_due: resolveTranslation(translations, "workspace.subscription-past-due", "Past Due"),
    unpaid: resolveTranslation(translations, "workspace.subscription-unpaid", "Unpaid"),
    canceled: resolveTranslation(translations, "workspace.subscription-canceled", "Canceled"),
  };

  if (!workspace) {
    return (
      <Card>
        <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{noWorkspace}</p>
        </CardContent>
      </Card>
    );
  }

  const displayPlan = PLAN_LABELS[workspace.plan as PlanId] || workspace.plan;
  const displayStatus = workspace.subscriptionStatus
    ? statusLabels[workspace.subscriptionStatus] ?? workspace.subscriptionStatus
    : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground">{planLabel}</p>
            <p className="text-sm font-medium mt-0.5">{displayPlan}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Sites</p>
            <p className="text-sm font-medium mt-0.5">
              {sitesUsed.replace("{used}", String(workspace.currentSites)).replace("{limit}", String(workspace.siteLimit))}
            </p>
          </div>
          {displayStatus && (
            <div>
              <p className="text-xs font-medium text-muted-foreground">Status</p>
              <Badge variant={STATUS_VARIANT[workspace.subscriptionStatus ?? ""] ?? "outline"} className="mt-1">
                {displayStatus}
              </Badge>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {workspace.stripeCustomerId && (
            <Button variant="outline" size="sm" asChild>
              <a href={`/dashboard/billing`}>{manageBilling}</a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
