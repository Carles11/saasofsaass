"use client";

import { useState } from "react";
import type { SupportedLocaleType } from "@/5-shared/types";
import { resolveTranslation, type TranslationDict } from "@/5-shared/lib/translations/resolve";
import { AutoTranslateButton } from "./AutoTranslateButton";
import { LanguageSelector } from "./LanguageSelector";

interface BlockEditorHeaderProps {
  tenantId: string;
  blockId: string;
  blockType?: string;
  locales: string[];
  activeLocale: SupportedLocaleType;
  onLocaleChange: (locale: SupportedLocaleType) => void;
  defaultLocale: string;
  onTranslate?: (isTranslating: boolean) => void;
  translations?: TranslationDict;
}

const COLLECTION_BLOCKS = ["blog-feed", "podcast-feed", "awards", "testimonials"];

export function BlockEditorHeader({
  tenantId,
  blockId,
  blockType,
  locales,
  activeLocale,
  onLocaleChange,
  defaultLocale,
  onTranslate,
  translations,
}: BlockEditorHeaderProps) {
  const [isTranslating, setIsTranslating] = useState(false);

  function handleTranslate(v: boolean) {
    setIsTranslating(v);
    onTranslate?.(v);
  }

  // Image gallery captions auto-translate on save — no manual button needed.
  const showTranslate = blockType !== "image-gallery";
  const isCollection = !!blockType && COLLECTION_BLOCKS.includes(blockType);
  const translateLabel = isCollection
    ? resolveTranslation(translations, "settings.auto-translate.translate-all", "Translate all")
    : undefined;

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 p-3 sm:p-4 border-b border-border">
      <LanguageSelector
        locales={locales}
        activeLocale={activeLocale}
        onChange={onLocaleChange}
        disabled={isTranslating}
      />
      {showTranslate && (
        <AutoTranslateButton
          tenantId={tenantId}
          blockId={blockId}
          defaultLocale={defaultLocale}
          onTranslate={handleTranslate}
          translations={translations}
          label={translateLabel}
        />
      )}
    </div>
  );
}
