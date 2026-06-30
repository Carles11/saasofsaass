"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  addExtraSiteForCurrentUser,
  createCheckoutSessionForCurrentUser,
} from "@/3-features/manage-billing/actions/billingActions";
import {
  resolveTranslation,
  type TranslationDict,
} from "@/5-shared/lib/translations/resolve";

interface PublishCapDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Current plan ID (typically "pro" — Free hits the cap too but the offer is to upgrade to Pro). */
  plan: string;
  /** Current add-on count, for soft-cap detection. */
  addonSites: number;
  softCap: number;
  /** Called after a successful add-on purchase so the caller can retry publish. */
  onExtraSiteAdded?: () => void;
  translations?: TranslationDict;
}

/**
 * Shown when a publish action is blocked by the plan's site cap.
 *
 * Pro path: parallel CTAs — "Add this site (€19/mo)" vs "Upgrade to Enterprise".
 * At the soft cap or above, the add-site CTA is hidden and we lean fully on the
 * Enterprise upsell (it becomes cheaper than further add-ons).
 * Free path: single CTA to upgrade to Pro (no add-ons available on Free).
 */
export function PublishCapDialog({
  open,
  onOpenChange,
  plan,
  addonSites,
  softCap,
  onExtraSiteAdded,
  translations,
}: PublishCapDialogProps) {
  const [loading, setLoading] = useState<"add" | "upgrade" | null>(null);

  const t = useCallback(
    (key: string, fallback: string) =>
      resolveTranslation(translations, key, fallback),
    [translations],
  );

  const canBuyAddon = plan === "pro" && addonSites < softCap;
  const isPro = plan === "pro";

  const handleAddSite = useCallback(async () => {
    setLoading("add");
    try {
      await addExtraSiteForCurrentUser();
      toast.success(
        t("add-extra-site.success", "Extra site added. Try publishing again."),
      );
      onExtraSiteAdded?.();
      onOpenChange(false);
    } catch (err: unknown) {
      toast.error(
        err instanceof Error
          ? err.message
          : t("add-extra-site.error", "Could not add an extra site."),
      );
    } finally {
      setLoading(null);
    }
  }, [t, onExtraSiteAdded, onOpenChange]);

  const handleUpgrade = useCallback(async () => {
    setLoading("upgrade");
    try {
      const targetPlan = isPro ? "enterprise" : "pro";
      const result = await createCheckoutSessionForCurrentUser(targetPlan);
      if (result.url) window.location.href = result.url;
    } catch (err: unknown) {
      toast.error(
        err instanceof Error
          ? err.message
          : t("upgrade.error", "Could not start checkout."),
      );
      setLoading(null);
    }
  }, [isPro, t]);

  const title = isPro
    ? t("publish-cap.title-pro", "You've reached your published-site limit")
    : t("publish-cap.title-free", "Free plan allows one published site");

  const description = isPro
    ? canBuyAddon
      ? t(
          "publish-cap.description-pro",
          "Add one more site to your Pro plan for €19/mo (prorated), or unlock unlimited sites with Enterprise.",
        )
      : t(
          "publish-cap.description-pro-at-cap",
          "You've reached the add-on limit for Pro. Enterprise gives you unlimited sites for a lower total cost.",
        )
    : t(
        "publish-cap.description-free",
        "Upgrade to Pro to publish more sites and unlock custom domains, search indexing, and team collaboration.",
      );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          {isPro && canBuyAddon && (
            <Button
              variant="outline"
              disabled={loading !== null}
              onClick={handleAddSite}
            >
              {loading === "add"
                ? t("add-extra-site.adding", "Adding…")
                : t("publish-cap.add-cta", "Add this site — €19/mo")}
            </Button>
          )}
          <Button disabled={loading !== null} onClick={handleUpgrade}>
            {loading === "upgrade"
              ? t("opening", "Opening…")
              : isPro
                ? t("publish-cap.enterprise-cta", "Upgrade to Enterprise")
                : t("publish-cap.pro-cta", "Upgrade to Pro")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
