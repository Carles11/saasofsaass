"use client";

import { BLOCK_CATALOG } from "@/2-widgets/tenant/BlockRenderer/config/blockCatalog";
import { updateBlockTranslations } from "@/3-features/manage-site-blocks";
import type { Block } from "@/5-shared/lib/db/schema";
import type { SupportedLocaleType } from "@/5-shared/types";
import type { BlockKind } from "@/5-shared/types/tenants/blocks";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { isRtl } from "@/5-shared/lib/next/rtl";
import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";

interface BlockTranslatableFieldsProps {
  block: Block;
  activeLocale: SupportedLocaleType;
  locales: string[];
  defaultLocale: string;
}

export function BlockTranslatableFields({
  block,
  activeLocale,
  locales,
  defaultLocale,
}: BlockTranslatableFieldsProps) {
  const catalogFields =
    BLOCK_CATALOG[block.type as BlockKind]?.fields?.filter(
      (f) => f.inputType !== "image",
    ) ?? [];

  const [buffers, setBuffers] = useState<Record<string, Record<string, string>>>({});

  useEffect(() => {
    const blockTrans = (block.translations ?? {}) as Record<string, Record<string, string>>;
    const next: Record<string, Record<string, string>> = {};
    for (const loc of locales) {
      next[loc] = { ...(blockTrans[loc] ?? {}) };
    }
    setBuffers(next);
  }, [block.id, block.translations, locales]);

  if (catalogFields.length === 0) return null;

  function setField(locale: string, key: string, value: string) {
    setBuffers((prev) => ({
      ...prev,
      [locale]: { ...(prev[locale] ?? {}), [key]: value },
    }));
  }

  async function handleBlur(locale: string, payload: Record<string, string>) {
    await updateBlockTranslations(block.id, block.tenantId, locale as SupportedLocaleType, payload);
  }

  const dir = isRtl(activeLocale) ? "rtl" : "ltr";
  const current = buffers[activeLocale] ?? {};

  return (
    <div className="flex flex-col gap-4 p-4 border-b border-border">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Section Content
      </p>
      {catalogFields.map((field) => (
        <div key={field.key} className="flex flex-col gap-1.5">
          <Label htmlFor={`heading-${field.key}`}>{field.label}</Label>
          {field.inputType === "textarea" ? (
            <Textarea
              id={`heading-${field.key}`}
              value={current[field.key] ?? ""}
              dir={dir}
              placeholder={field.placeholder ?? ""}
              rows={3}
              onChange={(e) => setField(activeLocale, field.key, e.target.value)}
              onBlur={() => {
                const payload = { ...(buffers[activeLocale] ?? {}) };
                handleBlur(activeLocale, payload);
              }}
            />
          ) : (
            <Input
              id={`heading-${field.key}`}
              value={current[field.key] ?? ""}
              dir={dir}
              placeholder={field.placeholder ?? ""}
              onChange={(e) => setField(activeLocale, field.key, e.target.value)}
              onBlur={() => {
                const payload = { ...(buffers[activeLocale] ?? {}) };
                handleBlur(activeLocale, payload);
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}
