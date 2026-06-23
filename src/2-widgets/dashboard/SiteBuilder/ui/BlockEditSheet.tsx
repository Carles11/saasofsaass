"use client";

import { resolveTranslation, type TranslationDict } from "@/5-shared/lib/translations/resolve";
import type { Block, Tenant } from "@/5-shared/lib/db/schema";
import type { SupportedLocaleType } from "@/5-shared/types";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { BlockEditForm } from "./BlockEditForm";

interface BlockEditSheetProps {
  block: Block | null;
  tenant: Tenant;
  activeLocale: SupportedLocaleType;
  open: boolean;
  onClose: () => void;
  translations?: TranslationDict;
}

export function BlockEditSheet({
  block,
  tenant,
  activeLocale,
  open,
  onClose,
  translations,
}: BlockEditSheetProps) {
  if (!block) return null;

  const editTitle = resolveTranslation(
    translations,
    "title",
    "Edit \"{name}\" — {locale}",
    { name: block.type, locale: activeLocale.toUpperCase() },
  );

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <SheetContent className="overflow-y-auto w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{editTitle}</SheetTitle>
        </SheetHeader>

        <div className="mt-6">
          <BlockEditForm
            block={block}
            tenant={tenant}
            activeLocale={activeLocale}
            translations={translations}
            onSuccess={onClose}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
