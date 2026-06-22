"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/5-shared/theme/ThemeToggle";
import { PaletteSwitcher } from "@/5-shared/theme/PaletteSwitcher";
import { resolveTranslation, type TranslationDict } from "@/5-shared/lib/translations/resolve";

interface PreferencesSectionProps {
  translations?: TranslationDict;
}

export function PreferencesSection({ translations }: PreferencesSectionProps) {
  const title = resolveTranslation(translations, "preferences.title", "Preferences");
  const themeLabel = resolveTranslation(translations, "preferences.theme-label", "Appearance");
  const themeDesc = resolveTranslation(translations, "preferences.theme-description", "Toggle between light and dark mode.");
  const paletteLabel = resolveTranslation(translations, "preferences.palette-label", "Palette");
  const paletteDesc = resolveTranslation(translations, "preferences.palette-description", "Choose your platform color palette.");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{themeLabel}</p>
            <p className="text-xs text-muted-foreground">{themeDesc}</p>
          </div>
          <ThemeToggle />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{paletteLabel}</p>
            <p className="text-xs text-muted-foreground">{paletteDesc}</p>
          </div>
          <PaletteSwitcher />
        </div>
      </CardContent>
    </Card>
  );
}
