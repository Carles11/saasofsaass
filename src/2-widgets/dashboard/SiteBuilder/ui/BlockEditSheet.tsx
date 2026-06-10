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
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
// Config fields that are non-translatable, per block type
const CONFIG_FIELDS: Partial<
  Record<BlockKind, Array<{ key: string; label: string; inputType?: string }>>
> = {
  hero: [
    { key: "ctaUrl", label: "CTA URL" },
    { key: "layout", label: "Layout (centered / left-aligned)" },
    { key: "heroImage", label: "Hero Image", inputType: "image" },
  ],
  contact: [
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "address", label: "Address" },
  ],
};

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

  // Hide sidebar for collection/content blocks
  if (["blog-feed", "podcast-feed", "awards", "image-gallery"].includes(block.type)) {
    return null;
  }

  const entry = blockFields[block.type as BlockKind];
  const fields = entry ?? [];
  const cfFields = CONFIG_FIELDS[block.type as BlockKind] ?? [];

  const blockLocaleTranslations = (block.translations ?? {}) as Record<string, Record<string, string>>;
  const current =
    blockLocaleTranslations[activeLocale] ?? blockLocaleTranslations[tenant.defaultLocale] ?? {};
  const config = (block.config ?? {}) as Record<string, unknown>;
  const dir = isRtl(activeLocale) ? "rtl" : "ltr";
  const editTitle = resolveTranslation(
    translations,
    "title",
    "Edit \"{name}\" — {locale}",
    { name: block.type, locale: activeLocale.toUpperCase() },
  );
  const sectionTranslations = resolveTranslation(
    translations,
    "section.translations",
    "Translations",
  );
  const sectionSettings = resolveTranslation(translations, "section.settings", "Settings");
  const saveTranslations = resolveTranslation(
    translations,
    "save-translations",
    "Save Translations",
  );
  const saveSettings = resolveTranslation(translations, "save-settings", "Save Settings");
  const removeImage = resolveTranslation(translations, "remove-image", "Remove image");
  const noFields = resolveTranslation(
    translations,
    "no-fields",
    "This block has no editable fields. Manage its content in the Content tab.",
  );

  async function handleTranslationSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload: Record<string, string> = {};
    for (const field of fields) {
      payload[field.key] = (fd.get(field.key) as string) ?? "";
    }
    await updateBlockTranslations(block!.id, tenant.id, activeLocale, payload);
    onClose();
  }

  async function handleConfigSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    // Always start from the current config, but overwrite heroImage if uploading
    const newConfig: Record<string, unknown> = { ...(block!.config as Record<string, unknown>) };
    let heroImageUpdated = false;
    for (const f of cfFields) {
      if (f.key === "heroImage") {
        const file = fd.get("heroImage");
        if (file && file instanceof File && file.size > 0) {
          // Upload to /api/hero/upload
          const uploadForm = new FormData();
          uploadForm.append("file", file);
          uploadForm.append("alt", "Hero image");
          const res = await fetch("/api/hero/upload", {
            method: "POST",
            body: uploadForm,
          });
          if (res.ok) {
            const data = await res.json();
            // Add cache-busting param to url
            const heroImage = {
              ...data.heroImage,
              // eslint-disable-next-line react-hooks/purity
              url: data.heroImage.url + (data.heroImage.s3Key ? `?t=${Date.now()}` : ""),
              s3Key: data.heroImage.s3Key,
            };
            newConfig.heroImage = heroImage;
            heroImageUpdated = true;
          } else {
            toast({ title: "Image upload failed", status: "error" });
            return;
          }
        } else if (file === "__REMOVE__") {
          newConfig.heroImage = null;
          heroImageUpdated = true;
        }
      } else {
        newConfig[f.key] = fd.get(f.key) ?? "";
      }
    }
    await updateBlockConfig(block!.id, tenant.id, newConfig);
    // Optionally, force a UI refresh by updating the block config in place if needed
  }

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

        {/* ── Translation fields ─────────────────────────────────────── */}
        {fields.length > 0 && (
          <form onSubmit={handleTranslationSubmit} className="flex flex-col gap-4 mt-6" dir={dir}>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {sectionTranslations}
            </p>
            {fields.map((field) => (
              <div key={field.key} className="flex flex-col gap-1">
                <Label htmlFor={field.key}>{field.label}</Label>
                {field.inputType === "textarea" ? (
                  <Textarea
                    id={field.key}
                    name={field.key}
                    defaultValue={current[field.key] ?? ""}
                    rows={4}
                    dir={dir}
                  />
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
            <Button type="submit" className="mt-2">
              {saveTranslations}
            </Button>
          </form>
        )}

        {/* ── Config fields (non-translatable) ──────────────────────── */}
        {cfFields.length > 0 && (
          <>
            <Separator className="my-6" />
            <form onSubmit={handleConfigSubmit} className="flex flex-col gap-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {sectionSettings}
              </p>
              {cfFields.map((f) => (
                <div key={f.key} className="flex flex-col gap-1">
                  <Label htmlFor={`cfg-${f.key}`}>{f.label}</Label>
                  {f.inputType === "image" ? (
                    <>
                      {typeof config.heroImage === "object" &&
                        config.heroImage &&
                        "url" in config.heroImage && (
                          <div className="mb-2">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
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
                                // Fallback: try to extract s3Key from URL if missing
                                if (!s3Key && (config.heroImage as any)?.url) {
                                  const url: string = (config.heroImage as any).url;
                                  // Example: https://dxkr25c81be58.cloudfront.net/b3f26528-6814-4b1e-88d0-71e9fb34581b/hero/hero-image-hero-social-work-gora-association.webp
                                  // s3Key = everything after the domain
                                  try {
                                    const match = url.match(/cloudfront\.net\/(.+)$/);
                                    if (match && match[1]) {
                                      s3Key = match[1];
                                      console.debug(
                                        "[HeroImage] Fallback s3Key extracted from url",
                                        s3Key
                                      );
                                    }
                                  } catch (e) {
                                    console.error(
                                      "[HeroImage] Failed to extract s3Key from url",
                                      url,
                                      e
                                    );
                                  }
                                }
                                console.debug("[HeroImage] Attempting delete", {
                                  s3Key,
                                  blockId: block.id,
                                  tenantId: tenant.id,
                                });
                                if (!s3Key) {
                                  toast({ title: "No hero image key found.", status: "error" });
                                  console.error("[HeroImage] No s3Key found for hero image", {
                                    config,
                                  });
                                  return;
                                }
                                try {
                                  const res = await fetch(
                                    `/api/hero/delete?s3Key=${encodeURIComponent(s3Key)}`,
                                    {
                                      method: "DELETE",
                                    }
                                  );
                                  console.debug("[HeroImage] Delete API response", res);
                                  if (!res.ok) {
                                    let errMsg = "Failed to delete hero image";
                                    try {
                                      const err = await res.json();
                                      errMsg = err.error || errMsg;
                                      console.error("[HeroImage] Delete API error", err);
                                    } catch (e) {
                                      console.error(
                                        "[HeroImage] Error parsing delete API error",
                                        e
                                      );
                                    }
                                    toast({ title: errMsg, status: "error" });
                                    return;
                                  }
                                  await updateBlockConfig(block.id, tenant.id, {
                                    ...config,
                                    heroImage: null,
                                  });
                                  toast({ title: "Hero image removed.", status: "success" });
                                  console.debug(
                                    "[HeroImage] Hero image removed and config updated"
                                  );
                                } catch (e) {
                                  toast({
                                    title: "Failed to delete hero image (network error)",
                                    status: "error",
                                  });
                                  console.error("[HeroImage] Network error during delete", e);
                                }
                              }}
                            >
                              {removeImage}
                            </button>
                          </div>
                        )}
                      <Input id={`cfg-${f.key}`} name={f.key} type="file" accept="image/*" />
                    </>
                  ) : (
                    <Input
                      id={`cfg-${f.key}`}
                      name={f.key}
                      defaultValue={
                        typeof config[f.key] === "string" ? (config[f.key] as string) : ""
                      }
                    />
                  )}
                </div>
              ))}
              <Button type="submit" className="mt-2">
                {saveSettings}
              </Button>
            </form>
          </>
        )}

        {fields.length === 0 && cfFields.length === 0 && (
          <p className="mt-6 text-sm text-muted-foreground">
            {noFields}
          </p>
        )}
      </SheetContent>
    </Sheet>
  );
}
