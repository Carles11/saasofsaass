"use client";

import { useState, useTransition } from "react";
import { updateTenantFonts } from "@/3-features/manage-tenants/actions/updateTenantFonts";
import {
  AVAILABLE_TITLE_FONTS,
  AVAILABLE_BODY_FONTS,
  getFontById,
  DEFAULT_FONTS,
} from "@/5-shared/lib/fonts/fontRegistry";
import { resolveTranslation, type TranslationDict } from "@/5-shared/lib/translations/resolve";

interface TypographySectionProps {
  tenantId: string;
  tenantName: string;
  initialTitleFont: string;
  initialBodyFont: string;
  translations?: TranslationDict;
}

function groupByCategory(fonts: typeof AVAILABLE_TITLE_FONTS) {
  const map: Record<string, typeof fonts> = {};
  for (const f of fonts) {
    (map[f.category] ??= []).push(f);
  }
  return map;
}

export function TypographySection({
  tenantId,
  tenantName,
  initialTitleFont,
  initialBodyFont,
  translations,
}: TypographySectionProps) {
  const [titleFont, setTitleFont] = useState(initialTitleFont);
  const [bodyFont, setBodyFont] = useState(initialBodyFont);
  const [isSaving, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const t = (key: string, fallback: string) =>
    resolveTranslation(translations, key, fallback);

  const title = t("settings.typography.title", "Typography");
  const titleFontLabel = t("settings.typography.title-font", "Heading Font");
  const bodyFontLabel = t("settings.typography.body-font", "Body Font");
  const previewLabel = t("settings.typography.preview-label", "Preview");
  const savingLabel = t("settings.typography.saving", "Saving...");
  const errorMsg = t("settings.typography.error", "Failed to update fonts");

  const titleGroups = groupByCategory(AVAILABLE_TITLE_FONTS);
  const bodyGroups = groupByCategory(AVAILABLE_BODY_FONTS);

  const titleFontMeta = getFontById(titleFont) ?? getFontById(DEFAULT_FONTS.title);
  const bodyFontMeta = getFontById(bodyFont) ?? getFontById(DEFAULT_FONTS.body);

  function handleTitleChange(id: string) {
    setTitleFont(id);
    setError(null);
    startTransition(async () => {
      try {
        await updateTenantFonts(tenantId, id, bodyFont);
      } catch {
        setTitleFont(initialTitleFont);
        setError(errorMsg);
      }
    });
  }

  function handleBodyChange(id: string) {
    setBodyFont(id);
    setError(null);
    startTransition(async () => {
      try {
        await updateTenantFonts(tenantId, titleFont, id);
      } catch {
        setBodyFont(initialBodyFont);
        setError(errorMsg);
      }
    });
  }

  return (
    <div className="mb-8">
      <h3 className="font-semibold mb-2">{title}</h3>
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            {titleFontLabel}
          </label>
          <select
            value={titleFont}
            onChange={(e) => handleTitleChange(e.target.value)}
            disabled={isSaving}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
          >
            {Object.entries(titleGroups).map(([category, fonts]) => (
              <optgroup key={category} label={category}>
                {fonts.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            {bodyFontLabel}
          </label>
          <select
            value={bodyFont}
            onChange={(e) => handleBodyChange(e.target.value)}
            disabled={isSaving}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
          >
            {Object.entries(bodyGroups).map(([category, fonts]) => (
              <optgroup key={category} label={category}>
                {fonts.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        <div>
          <p className="mb-1 text-xs font-medium text-muted-foreground">{previewLabel}</p>
          <div className="rounded-lg border border-border bg-card p-4 space-y-2">
            <p
              className="text-xl font-bold"
              style={{ fontFamily: titleFontMeta ? `var(${titleFontMeta.variable})` : undefined }}
            >
              {tenantName}
            </p>
            <p
              className="text-sm text-muted-foreground"
              style={{ fontFamily: bodyFontMeta ? `var(${bodyFontMeta.variable})` : undefined }}
            >
              This is a preview of your body font. The quick brown fox jumps over the lazy dog.
            </p>
          </div>
        </div>

        {isSaving && (
          <p className="text-xs text-blue-500">{savingLabel}</p>
        )}

        {error && (
          <p className="text-xs text-red-500">{error}</p>
        )}
      </div>
    </div>
  );
}
