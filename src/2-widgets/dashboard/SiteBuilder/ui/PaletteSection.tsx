"use client";

import { useState, useTransition } from "react";
import { updateTenantPalette } from "@/3-features/manage-tenants/actions/updateTenantPalette";
import { TENANT_PALETTES } from "@/5-shared/lib/palettes/paletteRegistry";
import { resolveTranslation, type TranslationDict } from "@/5-shared/lib/translations/resolve";

interface PaletteSectionProps {
  tenantId: string;
  initialPalette: string;
  translations?: TranslationDict;
}

export function PaletteSection({
  tenantId,
  initialPalette,
  translations,
}: PaletteSectionProps) {
  const [selected, setSelected] = useState(initialPalette);
  const [isSaving, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const t = (key: string, fallback: string) =>
    resolveTranslation(translations, key, fallback);

  const title = t("settings.palette.title", "Color Palette");
  const savingLabel = t("settings.palette.saving", "Saving...");
  const errorMsg = t("settings.palette.error", "Failed to update palette");

  function handleSelect(id: string) {
    setSelected(id);
    setError(null);
    startTransition(async () => {
      try {
        await updateTenantPalette(tenantId, id);
      } catch {
        setSelected(initialPalette);
        setError(errorMsg);
      }
    });
  }

  return (
    <div className="mb-8">
      <h3 className="font-semibold mb-2">{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {TENANT_PALETTES.map((palette) => {
          const isSelected = selected === palette.id;
          return (
            <button
              key={palette.id}
              type="button"
              disabled={isSaving}
              onClick={() => handleSelect(palette.id)}
              className={`rounded-lg border-2 p-4 text-left transition-all cursor-pointer ${
                isSelected
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-border hover:border-muted-foreground/30"
              } disabled:opacity-50`}
            >
              <p className="text-sm font-semibold mb-3">{palette.name}</p>
              <div className="flex gap-2">
                <div
                  className="h-6 w-6 rounded-full border border-border"
                  style={{ backgroundColor: palette.primarySwatch }}
                />
                <div
                  className="h-6 w-6 rounded-full border border-border"
                  style={{ backgroundColor: palette.accentSwatch }}
                />
              </div>
            </button>
          );
        })}
      </div>

      {isSaving && (
        <p className="mt-2 text-xs text-blue-500">{savingLabel}</p>
      )}

      {error && (
        <p className="mt-2 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}
