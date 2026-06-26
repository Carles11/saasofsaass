"use client";

import { useState, useTransition } from "react";
import { updateTenantSeo } from "@/3-features/manage-tenants/actions/updateTenantSeo";
import { resolveTranslation, type TranslationDict } from "@/5-shared/lib/translations/resolve";
import { hasFeature, getNextPlan, type PlanId } from "@/5-shared/lib/billing/plans";
import { useUpgradeModal } from "@/2-widgets/dashboard/UpgradeModal";
import { Search, Lock } from "lucide-react";

interface SeoSectionProps {
  tenantId: string;
  initialSeoEnabled: boolean;
  plan: string;
  translations?: TranslationDict;
}

export function SeoSection({
  tenantId,
  initialSeoEnabled,
  plan,
  translations,
}: SeoSectionProps) {
  const { showUpgrade } = useUpgradeModal();
  const [seoEnabled, setSeoEnabled] = useState(initialSeoEnabled);
  const [isSaving, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const t = (key: string, fallback: string) =>
    resolveTranslation(translations, key, fallback);

  // Free sites are never indexed; only plans with `searchIndexing` can control it.
  const canIndex = hasFeature(plan, "searchIndexing");
  const switchOn = canIndex ? seoEnabled : false;

  const title = t("settings.seo.title", "SEO & Visibility");
  const toggleLabel = t("settings.seo.toggle-label", "Search engine indexing");
  const toggleHint = t(
    "settings.seo.toggle-hint",
    "Let people find this site on Google and AI search engines.",
  );
  const savingLabel = t("settings.seo.saving", "Saving...");
  const errorMsg = t("settings.seo.error", "Failed to update SEO settings");
  const hiddenWarning = t(
    "settings.seo.hidden-warning",
    "This site is currently hidden from search engines.",
  );
  const getFound = t("settings.seo.get-found", "Get found on Google");

  function openUpgrade() {
    showUpgrade({
      requiredPlan: (getNextPlan(plan) ?? "pro") as PlanId,
      title: t("settings.seo.upgrade-title", "Get found on Google"),
      description: t(
        "settings.seo.upgrade-desc",
        "Let search engines and AI assistants discover, index, and recommend this site.",
      ),
      benefits: [
        t("settings.seo.benefit-1", "Appear in Google & Bing search results"),
        t("settings.seo.benefit-2", "Be cited by AI answer engines"),
        t("settings.seo.benefit-3", "Automatically included in your sitemap"),
      ],
      canUpgrade: true,
    });
  }

  function handleToggle() {
    if (!canIndex) {
      openUpgrade();
      return;
    }
    const next = !seoEnabled;
    setSeoEnabled(next);
    setError(null);
    startTransition(async () => {
      try {
        await updateTenantSeo(tenantId, next);
      } catch {
        setSeoEnabled(initialSeoEnabled);
        setError(errorMsg);
      }
    });
  }

  return (
    <div className="mb-8">
      <h3 className="font-semibold mb-2">{title}</h3>
      <div className="flex items-start justify-between rounded-lg border border-border bg-card p-4 gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <Search className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
          <div className="min-w-0">
            <p className="text-sm font-medium">{toggleLabel}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{toggleHint}</p>
            {!canIndex && (
              <button
                type="button"
                onClick={openUpgrade}
                className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                <Lock className="h-3 w-3" />
                {getFound}
              </button>
            )}
            {canIndex && !seoEnabled && (
              <p className="text-xs text-amber-600 mt-1">{hiddenWarning}</p>
            )}
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-2">
          {isSaving && (
            <span className="text-xs text-blue-500">{savingLabel}</span>
          )}
          <button
            type="button"
            role="switch"
            aria-checked={switchOn}
            disabled={isSaving}
            onClick={handleToggle}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
              switchOn ? "bg-primary" : "bg-input"
            } ${!canIndex ? "opacity-60" : ""}`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm ring-0 transition-transform ${
                switchOn ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>

      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
    </div>
  );
}
