"use client";

import { blockFields } from "@/2-widgets/tenant/BlockRenderer/config/block-fields";
import { updateBlockConfig, updateBlockTranslations } from "@/3-features/manage-site-blocks";
import type { Block, Tenant } from "@/5-shared/lib/db/schema";
import { isRtl } from "@/5-shared/lib/next/rtl";
import { resolveTranslation, type TranslationDict } from "@/5-shared/lib/translations/resolve";
import { toast } from "@/5-shared/lib/ui/toast";
import type { SupportedLocaleType } from "@/5-shared/types";
import type { BlockKind } from "@/5-shared/types/tenants/blocks";
import { Button } from "@/components/tenant/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

const CONFIG_FIELDS: Partial<
  Record<BlockKind, Array<{ key: string; label: string; inputType?: string }>>
> = {
  "cta-banner": [
    { key: "ctaUrl", label: "CTA URL" },
  ],
  hero: [
    { key: "ctaUrl", label: "CTA URL" },
    { key: "layout", label: "Layout (centered / left-aligned)" },
  ],
  contact: [
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "address", label: "Address" },
  ],
  footer: [
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
  ],
};

interface BlockEditFormProps {
  block: Block;
  tenant: Tenant;
  activeLocale: SupportedLocaleType;
  translations?: TranslationDict;
  onSuccess?: () => void;
}

export function BlockEditForm({
  block,
  tenant,
  activeLocale,
  translations,
  onSuccess,
}: BlockEditFormProps) {
  const entry = blockFields[block.type as BlockKind];
  const fields = entry ?? [];
  const cfFields = CONFIG_FIELDS[block.type as BlockKind] ?? [];

  const blockLocaleTranslations = (block.translations ?? {}) as Record<string, Record<string, string>>;
  const current =
    blockLocaleTranslations[activeLocale] ?? blockLocaleTranslations[tenant.defaultLocale] ?? {};
  const config = (block.config ?? {}) as Record<string, unknown>;
  const dir = isRtl(activeLocale) ? "rtl" : "ltr";

  const isHero = block.type === "hero";
  const isCtaBanner = block.type === "cta-banner";
  const isFooter = block.type === "footer";

  const sectionTranslations = resolveTranslation(
    translations,
    "section.translations",
    "Translations",
  );
  const sectionSettings = resolveTranslation(translations, "section.settings", "Settings");
  const sectionCtaSettings = resolveTranslation(translations, "section.cta-settings", "CTA Settings");
  const saveLabel = resolveTranslation(translations, "save", "Save");
  const removeImage = resolveTranslation(translations, "remove-image", "Remove image");
  const noFieldsLabel = resolveTranslation(translations, "no-fields", "This block has no editable fields.");

  const [socialLinks, setSocialLinks] = useState<Array<{ label: string; url: string }>>(
    (config.socialLinks as Array<{ label: string; url: string }>) ?? [],
  );

  async function handleSocialLinksSave() {
    const newConfig = { ...config, socialLinks };
    await updateBlockConfig(block.id, tenant.id, newConfig);
    toast({ title: "Social links saved", status: "success" });
  }

  const hasTranslations = fields.length > 0;
  const hasConfig = cfFields.length > 0;
  const configSectionTitle = isCtaBanner || isHero ? sectionCtaSettings : sectionSettings;

  async function handleTranslationSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    // Handle image upload (heroImage) if present in translation fields
    const imageField = fields.find(f => f.inputType === "image");
    if (imageField) {
      const file = fd.get(imageField.key);
      if (file && file instanceof File && file.size > 0) {
        const uploadForm = new FormData();
        uploadForm.append("file", file);
        uploadForm.append("alt", "Hero image");
        const res = await fetch("/api/hero/upload", {
          method: "POST",
          body: uploadForm,
        });
        if (res.ok) {
          const data = await res.json();
          const heroImage = {
            ...data.heroImage,
            url: data.heroImage.url + (data.heroImage.s3Key ? `?t=${Date.now()}` : ""),
            s3Key: data.heroImage.s3Key,
          };
          await updateBlockConfig(block.id, tenant.id, {
            ...config,
            heroImage,
          });
        } else {
          toast({ title: "Image upload failed", status: "error" });
          return;
        }
      }
    }

    // Save text translations
    const payload: Record<string, string> = {};
    for (const field of fields) {
      if (field.inputType === "image") continue;
      payload[field.key] = (fd.get(field.key) as string) ?? "";
    }
    await updateBlockTranslations(block.id, tenant.id, activeLocale, payload);
    onSuccess?.();
  }

  async function handleConfigSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const newConfig: Record<string, unknown> = { ...(block.config as Record<string, unknown>) };
    for (const f of cfFields) {
      newConfig[f.key] = fd.get(f.key) ?? "";
    }
    await updateBlockConfig(block.id, tenant.id, newConfig);
  }

  function getFieldLabel(field: { key: string; label: string }) {
    return resolveTranslation(
      translations,
      `block-fields.${block.type}.${field.key}`,
      field.label,
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4" dir={dir}>
      {/* ── Translation fields ──────────────────────────────────────── */}
      {hasTranslations && (
        <>
          <Separator />
          <form key={activeLocale} onSubmit={handleTranslationSubmit} className="flex flex-col gap-4" dir={dir}>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {sectionTranslations}
            </p>
            {fields.map((field) => (
              <div key={field.key} className="flex flex-col gap-1">
                <Label htmlFor={field.key}>{getFieldLabel(field)}</Label>
                {field.inputType === "textarea" ? (
                  <Textarea
                    id={field.key}
                    name={field.key}
                    defaultValue={current[field.key] ?? ""}
                    rows={4}
                    dir={dir}
                  />
                ) : field.inputType === "image" ? (
                  <>
                    {typeof config.heroImage === "object" &&
                      config.heroImage &&
                      "url" in config.heroImage && (
                        <div className="mb-2">
                          <img
                            src={(config.heroImage as any).url}
                            alt={(config.heroImage as any).alt || "Hero image"}
                            className="max-h-32 rounded"
                          />
                          <button
                            type="button"
                            className="text-xs text-red-500 underline mt-1 cursor-pointer"
                            onClick={async () => {
                              let s3Key = (config.heroImage as any)?.s3Key;
                              if (!s3Key && (config.heroImage as any)?.url) {
                                const url: string = (config.heroImage as any).url;
                                try {
                                  const match = url.match(/cloudfront\.net\/(.+)$/);
                                  if (match && match[1]) {
                                    s3Key = match[1];
                                  }
                                } catch (e) {
                                  console.error("[HeroImage] Failed to extract s3Key", url, e);
                                }
                              }
                              if (!s3Key) {
                                toast({ title: "No hero image key found.", status: "error" });
                                return;
                              }
                              try {
                                const res = await fetch(
                                  `/api/hero/delete?s3Key=${encodeURIComponent(s3Key)}`,
                                  { method: "DELETE" },
                                );
                                if (!res.ok) {
                                  let errMsg = "Failed to delete hero image";
                                  try {
                                    const err = await res.json();
                                    errMsg = err.error || errMsg;
                                  } catch (e) {
                                    console.error("[HeroImage] Error parsing delete error", e);
                                  }
                                  toast({ title: errMsg, status: "error" });
                                  return;
                                }
                                await updateBlockConfig(block.id, tenant.id, {
                                  ...config,
                                  heroImage: null,
                                });
                                toast({ title: "Hero image removed.", status: "success" });
                              } catch (e) {
                                toast({
                                  title: "Failed to delete hero image (network error)",
                                  status: "error",
                                });
                              }
                            }}
                          >
                            {removeImage}
                          </button>
                        </div>
                      )}
                    <Input id={field.key} name={field.key} type="file" accept="image/*" />
                  </>
                ) : (
                  <Input
                    id={field.key}
                    name={field.key}
                    defaultValue={current[field.key] ?? ""}
                    dir={dir}
                  />
                )}
              </div>
            ))}
            <Button type="submit" className="self-start">
              {saveLabel}
            </Button>
          </form>
        </>
      )}

      {/* ── Config fields (non-translatable) ─────────────────────────── */}
      {hasConfig && (
        <>
          <Separator />
          <form onSubmit={handleConfigSubmit} className="flex flex-col gap-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {configSectionTitle}
            </p>
            {cfFields.map((f) => (
              <div key={f.key} className="flex flex-col gap-1">
                <Label htmlFor={`cfg-${f.key}`}>{f.label}</Label>
                <Input
                  id={`cfg-${f.key}`}
                  name={f.key}
                  defaultValue={
                    typeof config[f.key] === "string" ? (config[f.key] as string) : ""
                  }
                />
              </div>
            ))}
            <Button type="submit" className="self-start">
              {saveLabel}
            </Button>
          </form>
        </>
      )}

      {/* ── Social links — footer only ──────────────────────────────── */}
      {isFooter && (
        <>
          <Separator />
          <div className="flex flex-col gap-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Social Links
            </p>
            {socialLinks.map((link, i) => (
              <div key={i} className="flex items-end gap-2">
                <div className="flex flex-col gap-1 flex-1">
                  <Label htmlFor={`sl-label-${i}`}>Label</Label>
                  <Input
                    id={`sl-label-${i}`}
                    value={link.label}
                    onChange={(e) => {
                      const next = [...socialLinks];
                      next[i] = { ...next[i], label: e.target.value };
                      setSocialLinks(next);
                    }}
                  />
                </div>
                <div className="flex flex-col gap-1 flex-[2]">
                  <Label htmlFor={`sl-url-${i}`}>URL</Label>
                  <Input
                    id={`sl-url-${i}`}
                    value={link.url}
                    onChange={(e) => {
                      const next = [...socialLinks];
                      next[i] = { ...next[i], url: e.target.value };
                      setSocialLinks(next);
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setSocialLinks(socialLinks.filter((_, j) => j !== i))}
                  className="p-2 text-muted-foreground hover:text-red-500 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <div className="flex gap-2">
              <Button
                type="button"
                tenantVariant="outline"
                size="sm"
                onClick={() => setSocialLinks([...socialLinks, { label: "", url: "" }])}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Link
              </Button>
              <Button type="button" size="sm" onClick={handleSocialLinksSave}>
                {saveLabel}
              </Button>
            </div>
          </div>
        </>
      )}

      {/* ── Empty state ─────────────────────────────────────────────── */}
      {!hasTranslations && !hasConfig && !isFooter && (
        <div className="py-8 text-center">
          <p className="text-sm text-muted-foreground">{noFieldsLabel}</p>
        </div>
      )}
    </div>
  );
}
