"use client";

import { useUpgradeModal } from "@/2-widgets/dashboard/UpgradeModal";
import { updateTenantTemplate } from "@/3-features/manage-site-blocks/actions/tenantActions";
import {
  TEMPLATE_META,
  TEMPLATE_STYLE_TAGS,
  TEMPLATES,
  TenantTemplateId,
  type TemplateStyleTag,
} from "@/5-shared/config/templates";
import { getNextPlan, hasFeature, type PlanId } from "@/5-shared/lib/billing/plans";
import { resolveTranslation, type TranslationDict } from "@/5-shared/lib/translations/resolve";
import { useStore } from "@/5-shared/store";
import { cn } from "@/5-shared/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Lock } from "lucide-react";
import Image from "next/image";
import { useState, useTransition } from "react";
import { FullscreenPickerSheet } from "./FullscreenPickerSheet";

interface TemplateGallerySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentTemplateId: TenantTemplateId;
  previewTemplateId: TenantTemplateId;
  setPreviewTemplateId: (id: TenantTemplateId) => void;
  plan: string;
  translations?: TranslationDict;
}

export function TemplateGallerySheet({
  open,
  onOpenChange,
  currentTemplateId,
  previewTemplateId,
  setPreviewTemplateId,
  plan,
  translations,
}: TemplateGallerySheetProps) {
  const tenant = useStore((s) => s.activeTenant);
  const setTenant = useStore((s) => s.setTenant);
  const { showUpgrade } = useUpgradeModal();
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const canUsePremium = hasFeature(plan, "premiumTemplates");
  const [styleFilter, setStyleFilter] = useState<TemplateStyleTag | null>(null);
  const [noImageOnly, setNoImageOnly] = useState(false);

  const t = (key: string, fallback: string) =>
    resolveTranslation(translations, key, fallback);

  const visibleIds = (Object.keys(TEMPLATES) as TenantTemplateId[]).filter((id) => {
    const meta = TEMPLATE_META[id];
    if (styleFilter && !meta.styleTags.includes(styleFilter)) return false;
    if (noImageOnly && meta.heroHasImage) return false;
    return true;
  });

  const title = t("settings.template.gallery-title", "Choose a template");
  const description = t(
    "settings.template.gallery-description",
    "Pick the look of your site. You can change it anytime — your content stays the same.",
  );
  const activeLabel = t("settings.template.active", "Active");
  const previewingLabel = t("settings.template.previewing", "Previewing");
  const applyLabel = t("settings.template.apply", "Apply this template");
  const applyingLabel = t("settings.template.applying", "Applying…");
  const premiumLabel = t("settings.template.premium-badge", "Premium");
  const upgradeCta = t("settings.template.upgrade-cta", "Upgrade to use");

  function openUpgrade() {
    showUpgrade({
      requiredPlan: (getNextPlan(plan) ?? "pro") as PlanId,
      title: t("settings.template.upgrade-title", "Unlock premium templates"),
      description: t(
        "settings.template.upgrade-description",
        "Premium templates feature distinctive layouts and curated visual identities, designed to make your site stand out.",
      ),
      benefits: [
        t(
          "settings.template.upgrade-benefit-1",
          "Distinctive visual identity out of the box",
        ),
        t(
          "settings.template.upgrade-benefit-2",
          "Carefully tuned typography and spacing",
        ),
        t(
          "settings.template.upgrade-benefit-3",
          "Stand out from sites built on the free templates",
        ),
      ],
      canUpgrade: true,
      currentPlan: plan,
    });
  }

  function handleCardClick(id: TenantTemplateId, isPremium: boolean) {
    if (isPremium && !canUsePremium) {
      openUpgrade();
      return;
    }
    setErrorMsg(null);
    setPreviewTemplateId(id);
  }

  function handleApply() {
    if (!tenant) return;
    const template = TEMPLATES[previewTemplateId];
    if (template.gating.isPremium && !canUsePremium) {
      openUpgrade();
      return;
    }
    startTransition(async () => {
      try {
        await updateTenantTemplate(tenant.id, previewTemplateId);
        setTenant({ ...tenant, templateId: previewTemplateId });
        onOpenChange(false);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Could not apply template.";
        setErrorMsg(msg);
      }
    });
  }

  const canApply = previewTemplateId !== currentTemplateId;

  return (
    <FullscreenPickerSheet
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      toolbar={
        <div className="flex gap-2 overflow-x-auto">
          {[null, ...TEMPLATE_STYLE_TAGS].map((tag) => (
            <button
              key={tag ?? "all"}
              type="button"
              onClick={() => setStyleFilter(tag)}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-sm font-medium whitespace-nowrap capitalize transition-colors cursor-pointer",
                styleFilter === tag
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground",
              )}
            >
              {tag ? t(`settings.template.style.${tag}`, tag) : t("settings.template.style.all", "All")}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setNoImageOnly((v) => !v)}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors cursor-pointer",
              noImageOnly
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground",
            )}
          >
            {t("settings.template.filter.no-hero-image", "Hero without image")}
          </button>
        </div>
      }
      footer={
        <div className="flex items-center justify-end gap-4">
          {errorMsg && (
            <p className="text-sm text-destructive mr-auto">{errorMsg}</p>
          )}
          <Button onClick={handleApply} disabled={!canApply || isPending}>
            {isPending ? applyingLabel : applyLabel}
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {visibleIds.map((id) => {
          const tpl = TEMPLATES[id];
          const isActive = id === currentTemplateId;
          const isPreviewing = id === previewTemplateId;
          const isLocked = tpl.gating.isPremium && !canUsePremium;
          const label = t(`settings.template.${id}.label`, id);
          const tagline = t(`settings.template.${id}.tagline`, "");

          return (
            <button
              key={id}
              type="button"
              onClick={() => handleCardClick(id, tpl.gating.isPremium)}
              className={`group relative flex flex-col rounded-xl border-2 overflow-hidden text-left transition-all ${
                isPreviewing
                  ? "border-primary shadow-lg"
                  : "border-border hover:border-primary/60"
              }`}
            >
              {/* Screenshot */}
              <div className="relative w-full aspect-[4/3] bg-muted">
                <Image
                  src={tpl.meta.screenshotPath}
                  alt={`${label} template preview`}
                  fill
                  sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                  unoptimized
                />

                {/* Premium lock overlay */}
                {isLocked && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/80 backdrop-blur-sm">
                    <Lock className="h-6 w-6 text-foreground" />
                    <span className="text-xs font-medium text-foreground">
                      {upgradeCta}
                    </span>
                  </div>
                )}

                {/* Active / Previewing pills */}
                <div className="absolute top-2 left-2 flex gap-1">
                  {isActive && (
                    <Badge variant="default" className="text-[10px] uppercase">
                      <Check className="h-3 w-3 mr-0.5" />
                      {activeLabel}
                    </Badge>
                  )}
                  {isPreviewing && !isActive && (
                    <Badge variant="outline" className="text-[10px] uppercase bg-background">
                      {previewingLabel}
                    </Badge>
                  )}
                </div>

                {/* Premium badge (top-right) */}
                {tpl.gating.isPremium && (
                  <div className="absolute top-2 right-2">
                    <Badge
                      className="text-[10px] uppercase"
                      style={{ background: tpl.meta.accentColor, color: "white" }}
                    >
                      {premiumLabel}
                    </Badge>
                  </div>
                )}
              </div>

              {/* Card body */}
              <div className="flex flex-col gap-1 p-3 bg-card">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-card-foreground">
                    {label}
                  </span>
                  <span
                    aria-hidden
                    className="h-3 w-3 rounded-full shrink-0"
                    style={{ background: tpl.meta.accentColor }}
                  />
                </div>
                {tagline && (
                  <span className="text-xs text-muted-foreground">{tagline}</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </FullscreenPickerSheet>
  );
}
