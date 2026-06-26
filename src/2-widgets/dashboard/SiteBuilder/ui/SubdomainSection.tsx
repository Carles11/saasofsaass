"use client";

import { updateTenantSlug } from "@/3-features/manage-tenants/actions/updateTenantSlug";
import { generatePreviewToken } from "@/3-features/manage-site-blocks/actions/generatePreviewToken";
import {
  resolveTranslation,
  type TranslationDict,
} from "@/5-shared/lib/translations/resolve";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useTransition } from "react";

interface SubdomainSectionProps {
  tenantId: string;
  initialSlug: string;
  translations?: TranslationDict;
  onSlugChange: (newSlug: string) => void;
  isDev: boolean;
  devPort: string;
  prodRoot: string;
  activeLocale: string;
}

export function SubdomainSection({
  tenantId,
  initialSlug,
  translations,
  onSlugChange,
  isDev,
  devPort,
  prodRoot,
  activeLocale,
}: SubdomainSectionProps) {
  const [slug, setSlug] = useState(initialSlug);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPreviewing, startPreviewTransition] = useTransition();

  function handlePreview() {
    startPreviewTransition(async () => {
      const url = await generatePreviewToken(tenantId);
      window.open(url, "_blank", "noopener,noreferrer");
    });
  }

  const title = resolveTranslation(
    translations,
    "settings.subdomain.title",
    "Subdomain",
  );
  const inputLabel = resolveTranslation(
    translations,
    "settings.subdomain.input-label",
    "Subdomain slug",
  );
  const saveButton = resolveTranslation(
    translations,
    "settings.subdomain.save-button",
    "Save",
  );
  const savingLabel = resolveTranslation(
    translations,
    "settings.subdomain.saving",
    "Saving...",
  );
  const previewLabel = resolveTranslation(translations, "preview", "Preview");

  const suffix = isDev ? `.localhost:${devPort}` : `.${prodRoot}`;

  const hasChanged = slug !== initialSlug;

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await updateTenantSlug(tenantId, slug, initialSlug);
      setSuccess(true);
      onSlugChange(result.slug);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to update subdomain.";
      setError(resolveTranslation(translations, msg, msg));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col md:flex-row items-end gap-2">
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              {inputLabel}
            </label>
            <div className="flex items-center rounded-lg border border-border bg-background px-3 py-2 text-sm focus-within:ring-2 focus-within:ring-ring">
              <input
                type="text"
                value={slug}
                onChange={(e) => {
                  setSlug(
                    e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                  );
                  setError(null);
                  setSuccess(false);
                }}
                className="flex-1 focus:outline-none"
                disabled={saving}
              />
              <span className="ml-2 shrink-0 text-xs text-muted-foreground">
                {suffix}
              </span>
            </div>
          </div>
          <Button onClick={handleSave} disabled={saving || !hasChanged}>
            {saving ? savingLabel : saveButton}
          </Button>
        </div>

        {success && (
          <p className="text-sm text-green-600">
            {resolveTranslation(
              translations,
              "settings.subdomain.success",
              "Subdomain updated",
            )}
          </p>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          onClick={handlePreview}
          disabled={isPreviewing}
          className="inline-block text-xs font-medium text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors disabled:opacity-50"
        >
          {isPreviewing
            ? resolveTranslation(translations, "settings.preview.opening", "Opening…")
            : previewLabel}
        </button>
      </CardContent>
    </Card>
  );
}
