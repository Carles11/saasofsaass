"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Sparkles } from "lucide-react";
import { PLAN_LABELS, type PlanId } from "@/5-shared/lib/billing/plans";
import { marketingUrl } from "@/5-shared/lib/auth/auth-urls";
import { resolveTranslation, type TranslationDict } from "@/5-shared/lib/translations/resolve";
import type { UpgradeConfig } from "../UpgradeModalProvider";

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: UpgradeConfig | null;
  translations?: TranslationDict;
  locale: string;
}

export function UpgradeModal({ open, onOpenChange, config, translations, locale }: UpgradeModalProps) {
  const t = (key: string, fallback: string) => resolveTranslation(translations, key, fallback);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {config && (
        <UpgradeModalContent config={config} locale={locale} t={t} onClose={() => onOpenChange(false)} />
      )}
    </Dialog>
  );
}

function UpgradeModalContent({
  config,
  locale,
  t,
  onClose,
}: {
  config: UpgradeConfig;
  locale: string;
  t: (key: string, fallback: string) => string;
  onClose: () => void;
}) {
  const planLabel = PLAN_LABELS[config.requiredPlan as PlanId] ?? config.requiredPlan;
  const canUpgrade = config.canUpgrade !== false;
  const availableOn = t("available-on", "Available on {plan}").replace("{plan}", planLabel);
  const ctaHref = marketingUrl(`/pricing?plan=${config.requiredPlan}`, locale);

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Sparkles className="h-5 w-5" />
        </span>
        <span className="mt-2 inline-flex w-fit items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
          {availableOn}
        </span>
        <DialogTitle className="mt-1">{config.title}</DialogTitle>
        <DialogDescription>{config.description}</DialogDescription>
      </DialogHeader>

      {config.benefits && config.benefits.length > 0 && (
        <ul className="flex flex-col gap-2.5">
          {config.benefits.map((b) => (
            <li key={b} className="flex items-start gap-2.5 text-sm">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span className="text-muted-foreground">{b}</span>
            </li>
          ))}
        </ul>
      )}

      {canUpgrade ? (
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            {t("maybe-later", "Maybe later")}
          </Button>
          <Button asChild>
            <a href={ctaHref}>{t("see-plans", "See plans")}</a>
          </Button>
        </DialogFooter>
      ) : (
        <DialogFooter className="sm:flex-col sm:items-stretch">
          <p className="text-xs text-muted-foreground sm:text-center">
            {t(
              "owner-only",
              "Only the workspace owner can change the plan. Ask them to upgrade to unlock this.",
            )}
          </p>
          <Button variant="outline" onClick={onClose}>
            {t("close", "Close")}
          </Button>
        </DialogFooter>
      )}
    </DialogContent>
  );
}
