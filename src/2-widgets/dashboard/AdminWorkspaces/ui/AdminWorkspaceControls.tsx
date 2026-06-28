"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Button,
  Input,
  Label,
} from "@/components/ui";
import {
  setWorkspacePlan,
  grantAddonSites,
} from "@/3-features/admin/actions/adminActions";
import { unpublishTenant } from "@/3-features/manage-tenants/actions/publishTenant";
import { archiveTenant } from "@/3-features/manage-tenants/actions/archiveTenant";
import {
  PLAN_ORDER,
  PLAN_LABELS,
  type PlanId,
} from "@/5-shared/lib/billing/plans";

interface SiteRow {
  id: string;
  name: string;
  status: string;
}

interface AdminWorkspaceControlsProps {
  workspaceId: string;
  currentPlan: string;
  addonSites: number;
  sites: SiteRow[];
}

export function AdminWorkspaceControls({
  workspaceId,
  currentPlan,
  addonSites,
  sites,
}: AdminWorkspaceControlsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [plan, setPlan] = useState(currentPlan);
  const [addonInput, setAddonInput] = useState(String(addonSites));

  function handlePlanChange(value: string) {
    setPlan(value);
    startTransition(async () => {
      try {
        await setWorkspacePlan(workspaceId, value);
        toast.success(`Plan changed to ${PLAN_LABELS[value as PlanId] ?? value}`);
        router.refresh();
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to update plan";
        toast.error(message);
        setPlan(currentPlan);
      }
    });
  }

  function handleSaveAddons() {
    const n = parseInt(addonInput, 10);
    if (isNaN(n) || n < 0) {
      toast.error("Add-on sites must be a non-negative number");
      return;
    }
    startTransition(async () => {
      try {
        await grantAddonSites(workspaceId, n);
        toast.success(`Add-on sites set to ${n}`);
        router.refresh();
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to update add-on sites";
        toast.error(message);
        setAddonInput(String(addonSites));
      }
    });
  }

  function handleUnpublish(tenantId: string, name: string) {
    startTransition(async () => {
      try {
        await unpublishTenant(tenantId);
        toast.success(`"${name}" unpublished`);
        router.refresh();
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to unpublish";
        toast.error(message);
      }
    });
  }

  function handleArchive(tenantId: string, name: string) {
    startTransition(async () => {
      try {
        await archiveTenant(tenantId);
        toast.success(`"${name}" archived`);
        router.refresh();
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to archive";
        toast.error(message);
      }
    });
  }

  return (
    <div className="space-y-8">
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-base font-bold text-card-foreground mb-4">
          Plan Override
        </h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="plan-select">Plan</Label>
            <Select value={plan} onValueChange={handlePlanChange}>
              <SelectTrigger id="plan-select" className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PLAN_ORDER.map((p) => (
                  <SelectItem key={p} value={p}>
                    {PLAN_LABELS[p]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="addon-sites">Add-on Published Sites</Label>
            <div className="flex items-center gap-3">
              <Input
                id="addon-sites"
                type="number"
                min={0}
                value={addonInput}
                onChange={(e) => setAddonInput(e.target.value)}
                className="w-32"
              />
              <Button
                variant="outline"
                size="sm"
                disabled={isPending}
                onClick={handleSaveAddons}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      </div>

      {sites.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-base font-bold text-card-foreground mb-4">
            Site Actions
          </h3>
          <div className="space-y-2">
            {sites.map((site) => {
              const isPublished = site.status === "published";
              const isArchived = site.status === "archived";
              return (
                <div
                  key={site.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border bg-background"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-card-foreground">
                      {site.name}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full gap-1 px-2 py-0.5 text-[10px] font-semibold ${
                        isPublished
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : isArchived
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <span
                        className={`rounded-full size-1 ${
                          isPublished
                            ? "bg-emerald-500"
                            : isArchived
                              ? "bg-amber-500"
                              : "bg-muted-foreground"
                        }`}
                      />
                      {site.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isPublished && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isPending}
                        onClick={() => handleUnpublish(site.id, site.name)}
                      >
                        Unpublish
                      </Button>
                    )}
                    {!isArchived && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isPending}
                        onClick={() => handleArchive(site.id, site.name)}
                      >
                        Archive
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
