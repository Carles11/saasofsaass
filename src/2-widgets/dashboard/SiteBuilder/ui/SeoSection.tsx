"use client";

import { useState, useTransition } from "react";
import { updateTenantSeo } from "@/3-features/manage-tenants/actions/updateTenantSeo";
import { resolveTranslation, type TranslationDict } from "@/5-shared/lib/translations/resolve";
import { Search } from "lucide-react";

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
  const [seoEnabled, setSeoEnabled] = useState(initialSeoEnabled);
  const [isSaving, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const t = (key: string, fallback: string) =>
    resolveTranslation(translations, key, fallback);

  const title = t("settings.seo.title", "SEO & Visibility");
  const toggleLabel = t("settings.seo.toggle-label", "Search Engine Indexing");
  const toggleHint = t(
    "settings.seo.toggle-hint",
    "Allow Google and other search engines to find this site.",
  );
  const savingLabel = t("settings.seo.saving", "Saving...");
  const errorMsg = t("settings.seo.error", "Failed to update SEO settings");
  const proRequired = t(
    "settings.seo.pro-required",
    "Upgrade to Pro to control search engine visibility",
  );
  const hiddenWarning = t(
    "settings.seo.hidden-warning",
    "Your site is currently hidden from search engines.",
  );

  const isPro = plan === "pro";
  const canToggle = isPro;

  function handleToggle() {
    if (!canToggle) return;
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
            {!canToggle && (
              <p className="text-xs text-muted-foreground mt-1">
                {proRequired}{" "}
                <a
                  href="/dashboard/billing"
                  className="text-primary hover:underline font-medium"
                >
                  Upgrade
                </a>
              </p>
            )}
            {isPro && !seoEnabled && (
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
            aria-checked={seoEnabled}
            disabled={!canToggle || isSaving}
            onClick={handleToggle}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
              seoEnabled ? "bg-primary" : "bg-input"
            } ${!canToggle ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm ring-0 transition-transform ${
                seoEnabled ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>

      {error && (
        <p className="mt-2 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}
