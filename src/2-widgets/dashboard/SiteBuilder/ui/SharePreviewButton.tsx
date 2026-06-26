"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Copy, Lock, Share2 } from "lucide-react";
import { generatePreviewToken } from "@/3-features/manage-site-blocks/actions/generatePreviewToken";
import { PLANS, PLAN_ORDER, getPlan, type PlanId } from "@/5-shared/lib/billing/plans";
import { resolveTranslation, type TranslationDict } from "@/5-shared/lib/translations/resolve";
import { useUpgradeModal, type UpgradeConfig } from "@/2-widgets/dashboard/UpgradeModal";

interface SharePreviewButtonProps {
  tenantId: string;
  plan: string;
  /** Locale for formatting the human-readable expiry date. */
  locale: string;
  /** Workspace owner? Only owners can upgrade — editors see "ask the owner". */
  isOwner: boolean;
  translations?: TranslationDict;
}

const DURATION_DAYS = [1, 7, 30, 90, 180] as const;

/** Lowest plan whose preview-link ceiling covers `days` (or that has the feature at all). */
function requiredPlanForDays(days: number | null): PlanId {
  for (const id of PLAN_ORDER) {
    const max = PLANS[id].features.previewLinkMaxDays;
    if (max !== null && (days === null || days <= max)) return id;
  }
  return "enterprise";
}

export function SharePreviewButton({
  tenantId,
  plan,
  locale,
  isOwner,
  translations,
}: SharePreviewButtonProps) {
  const { showUpgrade } = useUpgradeModal();
  const t = (key: string, fallback: string) => resolveTranslation(translations, key, fallback);

  const maxDays = getPlan(plan).features.previewLinkMaxDays; // null = feature unavailable
  // Stable "now" captured once (lazy init) so the expiry date is pure during render.
  const [now] = useState(() => Date.now());
  const [open, setOpen] = useState(false);
  const [selectedDays, setSelectedDays] = useState<number>(1);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  const durationLabel = (days: number): string => {
    const map: Record<number, [string, string]> = {
      1: ["settings.preview.expiry-1d", "1 day"],
      7: ["settings.preview.expiry-7d", "7 days"],
      30: ["settings.preview.expiry-30d", "30 days"],
      90: ["settings.preview.expiry-90d", "90 days"],
      180: ["settings.preview.expiry-180d", "6 months"],
    };
    const [key, fallback] = map[days];
    return t(key, fallback);
  };

  function previewUpgradeConfig(requiredPlan: PlanId): UpgradeConfig {
    return {
      requiredPlan,
      title: t("settings.preview.upgrade-title", "Share private preview links"),
      description: t(
        "settings.preview.upgrade-desc",
        "Send clients and collaborators a secure link to your site before you publish it.",
      ),
      benefits: [
        t("settings.preview.benefit-1", "Secure links — no account needed to view"),
        t("settings.preview.benefit-2", "Choose how long each link stays valid"),
        t("settings.preview.benefit-3", "Pro: up to 7 days · Enterprise: up to 6 months"),
      ],
      canUpgrade: isOwner,
    };
  }

  function handleShareClick() {
    // Feature unavailable on this plan → straight to the upgrade modal.
    if (maxDays === null) {
      showUpgrade(previewUpgradeConfig(requiredPlanForDays(null)));
      return;
    }
    setSelectedDays(1);
    setGeneratedUrl(null);
    setCopied(false);
    setOpen(true);
  }

  function selectDuration(days: number) {
    // Locked duration → upsell to the plan that unlocks it, don't select it.
    if (maxDays === null || days > maxDays) {
      showUpgrade(previewUpgradeConfig(requiredPlanForDays(days)));
      return;
    }
    setSelectedDays(days);
    setGeneratedUrl(null);
    setCopied(false);
  }

  function copyLink() {
    startTransition(async () => {
      const url = await generatePreviewToken(tenantId, selectedDays);
      await navigator.clipboard.writeText(url);
      setGeneratedUrl(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  const expiryDate = new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(
    new Date(now + selectedDays * 86400000),
  );
  const expiresLabel = t("settings.preview.expires-on", "Expires {date}").replace(
    "{date}",
    expiryDate,
  );

  return (
    <>
      <Button size="sm" variant="outline" onClick={handleShareClick}>
        <Share2 className="h-4 w-4" />
        {t("settings.preview.share", "Share preview link")}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("settings.preview.dialog-title", "Share a preview link")}</DialogTitle>
            <DialogDescription>
              {t(
                "settings.preview.dialog-desc",
                "Anyone with this link can view your site as it looks right now — even before it's published.",
              )}
            </DialogDescription>
          </DialogHeader>

          {/* Duration selector */}
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              {t("settings.preview.duration-label", "Link valid for")}
            </p>
            <div className="flex flex-wrap gap-2">
              {DURATION_DAYS.map((days) => {
                const locked = maxDays === null || days > maxDays;
                const selected = !locked && days === selectedDays;
                return (
                  <Button
                    key={days}
                    type="button"
                    size="sm"
                    variant={selected ? "default" : "outline"}
                    onClick={() => selectDuration(days)}
                    className={locked ? "text-muted-foreground" : undefined}
                  >
                    {locked && <Lock className="h-3 w-3" />}
                    {durationLabel(days)}
                  </Button>
                );
              })}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">{expiresLabel}</p>
          </div>

          {/* Generated link + copy */}
          {generatedUrl && (
            <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2">
              <input
                readOnly
                value={generatedUrl}
                onFocus={(e) => e.currentTarget.select()}
                className="flex-1 min-w-0 bg-transparent text-xs text-muted-foreground focus:outline-none"
              />
              <button
                type="button"
                onClick={copyLink}
                className="shrink-0 text-muted-foreground hover:text-foreground"
                aria-label={t("settings.preview.copy-link", "Copy link")}
              >
                {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          )}

          <Button onClick={copyLink} disabled={isPending}>
            {isPending
              ? t("settings.preview.copying", "Generating…")
              : copied
                ? t("settings.preview.copied", "Copied!")
                : t("settings.preview.copy-link", "Copy link")}
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
