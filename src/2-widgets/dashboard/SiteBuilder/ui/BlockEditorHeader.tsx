"use client";

import { useState } from "react";
import type { SupportedLocaleType } from "@/5-shared/types";
import { AutoTranslateButton } from "./AutoTranslateButton";
import { LanguageSelector } from "./LanguageSelector";

interface BlockEditorHeaderProps {
  tenantId: string;
  blockId: string;
  locales: string[];
  activeLocale: SupportedLocaleType;
  onLocaleChange: (locale: SupportedLocaleType) => void;
  defaultLocale: string;
  onTranslate?: (isTranslating: boolean) => void;
}

export function BlockEditorHeader({
  tenantId,
  blockId,
  locales,
  activeLocale,
  onLocaleChange,
  defaultLocale,
  onTranslate,
}: BlockEditorHeaderProps) {
  const [isTranslating, setIsTranslating] = useState(false);

  function handleTranslate(v: boolean) {
    setIsTranslating(v);
    onTranslate?.(v);
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 p-3 sm:p-4 border-b border-border">
      <LanguageSelector
        locales={locales}
        activeLocale={activeLocale}
        onChange={onLocaleChange}
        disabled={isTranslating}
      />
      <AutoTranslateButton
        tenantId={tenantId}
        blockId={blockId}
        defaultLocale={defaultLocale}
        onTranslate={handleTranslate}
      />
    </div>
  );
}
