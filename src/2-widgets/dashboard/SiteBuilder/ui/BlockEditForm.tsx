"use client";

import { BLOCK_CATALOG } from "@/2-widgets/tenant/BlockRenderer/config/blockCatalog";
import { updateBlockConfig, updateBlockTranslations } from "@/3-features/manage-site-blocks";
import type { Block, Tenant } from "@/5-shared/lib/db/schema";
import { isRtl } from "@/5-shared/lib/next/rtl";
import { resolveTranslation, type TranslationDict } from "@/5-shared/lib/translations/resolve";
import { toast } from "@/5-shared/lib/ui/toast";
import type { SupportedLocaleType } from "@/5-shared/types";
import type { BlockKind } from "@/5-shared/types/tenants/blocks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { RichTextEditor } from "./RichTextEditor";

const CONFIG_FIELDS: Partial<
  Record<BlockKind, Array<{ key: string; label: string }>>
> = {
  "cta-banner": [{ key: "ctaUrl", label: "CTA URL" }],
  "cta-banner-image": [
    { key: "ctaUrl", label: "CTA URL" },
    { key: "layout", label: "Layout (image-left / image-right / background — blank = auto)" },
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
  map: [{ key: "address", label: "Address / Location" }],
  footer: [
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
  ],
};

type LocaleBuffers = Record<string, Record<string, string>>;
interface HeroImage {
  url?: string;
  s3Key?: string;
  alt?: string;
}

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
  const allFields = BLOCK_CATALOG[block.type as BlockKind]?.fields ?? [];
  const imageField = allFields.find((f) => f.inputType === "image");
  const imageKey = imageField?.key ?? "heroImage";
  const textFields = allFields.filter((f) => f.inputType !== "image");
  const cfFields = CONFIG_FIELDS[block.type as BlockKind] ?? [];
  const isFooter = block.type === "footer";
  const dir = isRtl(activeLocale) ? "rtl" : "ltr";

  const t = (key: string, fallback: string) => resolveTranslation(translations, key, fallback);

  // ── Controlled state (initialised from the block; reset when the block changes) ──
  const [trans, setTrans] = useState<LocaleBuffers>({});
  const [cfg, setCfg] = useState<Record<string, string>>({});
  const [socialLinks, setSocialLinks] = useState<Array<{ label: string; url: string }>>([]);
  const [heroImage, setHeroImage] = useState<HeroImage | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const blockTrans = (block.translations ?? {}) as LocaleBuffers;
    const next: LocaleBuffers = {};
    for (const loc of tenant.locales as string[]) {
      next[loc] = { ...(blockTrans[loc] ?? {}) };
    }
    setTrans(next);

    const config = (block.config ?? {}) as Record<string, unknown>;
    const cfgInit: Record<string, string> = {};
    for (const f of cfFields) cfgInit[f.key] = typeof config[f.key] === "string" ? (config[f.key] as string) : "";
    setCfg(cfgInit);
    setSocialLinks((config.socialLinks as Array<{ label: string; url: string }>) ?? []);
    setHeroImage((config[imageKey] as HeroImage) ?? null);
    setImageFile(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [block.id]);

  function setField(key: string, value: string) {
    setTrans((prev) => ({ ...prev, [activeLocale]: { ...(prev[activeLocale] ?? {}), [key]: value } }));
  }

  const sectionTranslations = t("section.translations", "Content");
  const sectionSettings = t("section.settings", "Settings");
  const saveLabel = t("save", "Save");
  const savingLabel = t("saving", "Saving…");
  const noFieldsLabel = t("no-fields", "This block has no editable fields.");

  function getFieldLabel(field: { key: string; label: string }) {
    return resolveTranslation(translations, `block-fields.${block.type}.${field.key}`, field.label);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const config = (block.config ?? {}) as Record<string, unknown>;
      const nextConfig: Record<string, unknown> = { ...config };
      for (const f of cfFields) nextConfig[f.key] = cfg[f.key] ?? "";
      if (isFooter) nextConfig.socialLinks = socialLinks;

      // Hero image: upload a freshly-picked file, or persist a clear.
      if (imageField) {
        if (imageFile) {
          const uploadForm = new FormData();
          uploadForm.append("file", imageFile);
          uploadForm.append("alt", "");
          uploadForm.append("tenantId", tenant.id);
          uploadForm.append("section", block.type);
          const res = await fetch("/api/hero/upload", { method: "POST", body: uploadForm });
          if (!res.ok) {
            toast({ title: t("image-upload-failed", "Image upload failed"), status: "error" });
            setSaving(false);
            return;
          }
          const data = await res.json();
          nextConfig[imageKey] = {
            ...data.heroImage,
            url: data.heroImage.url + (data.heroImage.s3Key ? `?t=${Date.now()}` : ""),
            s3Key: data.heroImage.s3Key,
          };
        } else {
          nextConfig[imageKey] = heroImage;
        }
      }

      await updateBlockConfig(block.id, tenant.id, nextConfig);

      // Persist every locale buffer (so edits made before switching tabs aren't lost).
      for (const [loc, payload] of Object.entries(trans)) {
        await updateBlockTranslations(block.id, tenant.id, loc as SupportedLocaleType, payload);
      }

      toast({ title: t("saved", "Saved."), status: "success" });
      onSuccess?.();
    } catch {
      toast({ title: t("save-failed", "Could not save."), status: "error" });
    } finally {
      setSaving(false);
    }
  }

  const hasAnything = textFields.length > 0 || imageField || cfFields.length > 0 || isFooter;
  const current = trans[activeLocale] ?? {};

  return (
    <div className="flex flex-col gap-5 p-4" dir={dir}>
      {/* ── Translatable content ─────────────────────────────────────── */}
      {(textFields.length > 0 || imageField) && (
        <>
          <Separator />
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {sectionTranslations}
          </p>

          {imageField && (
            <div className="flex flex-col gap-1">
              <Label>{getFieldLabel(imageField)}</Label>
              {heroImage?.url && !imageFile && (
                <div className="mb-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={heroImage.url} alt={heroImage.alt || "Hero image"} className="max-h-32 rounded" />
                  <button
                    type="button"
                    className="text-xs text-destructive underline mt-1 cursor-pointer"
                    onClick={() => setHeroImage(null)}
                  >
                    {t("remove-image", "Remove image")}
                  </button>
                </div>
              )}
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
              />
            </div>
          )}

          {textFields.map((field) => (
            <div key={field.key} className="flex flex-col gap-1">
              <Label htmlFor={`f-${field.key}`}>{getFieldLabel(field)}</Label>
              {field.inputType === "textarea" ? (
                <Textarea
                  id={`f-${field.key}`}
                  value={current[field.key] ?? ""}
                  placeholder={field.placeholder ?? ""}
                  rows={4}
                  dir={dir}
                  onChange={(e) => setField(field.key, e.target.value)}
                />
              ) : field.inputType === "richtext" ? (
                <RichTextEditor
                  value={current[field.key] ?? ""}
                  resetKey={`${activeLocale}-${field.key}`}
                  dir={dir}
                  onChange={(html) => setField(field.key, html)}
                />
              ) : (
                <Input
                  id={`f-${field.key}`}
                  value={current[field.key] ?? ""}
                  dir={dir}
                  onChange={(e) => setField(field.key, e.target.value)}
                />
              )}
            </div>
          ))}
        </>
      )}

      {/* ── Config (non-translatable) ────────────────────────────────── */}
      {cfFields.length > 0 && (
        <>
          <Separator />
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {sectionSettings}
          </p>
          {cfFields.map((f) => (
            <div key={f.key} className="flex flex-col gap-1">
              <Label htmlFor={`cfg-${f.key}`}>{f.label}</Label>
              <Input
                id={`cfg-${f.key}`}
                value={cfg[f.key] ?? ""}
                onChange={(e) => setCfg((prev) => ({ ...prev, [f.key]: e.target.value }))}
              />
            </div>
          ))}
        </>
      )}

      {/* ── Social links (footer) ────────────────────────────────────── */}
      {isFooter && (
        <>
          <Separator />
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {t("section.social", "Social Links")}
          </p>
          {socialLinks.map((link, i) => (
            <div key={i} className="flex items-end gap-2">
              <div className="flex flex-col gap-1 flex-1">
                <Label htmlFor={`sl-label-${i}`}>{t("label.link-label", "Label")}</Label>
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
                <Label htmlFor={`sl-url-${i}`}>{t("label.url", "URL")}</Label>
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
                className="p-2 text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="self-start"
            onClick={() => setSocialLinks([...socialLinks, { label: "", url: "" }])}
          >
            <Plus className="h-4 w-4 mr-1" />
            {t("add-link", "Add Link")}
          </Button>
        </>
      )}

      {!hasAnything && (
        <p className="py-8 text-center text-sm text-muted-foreground">{noFieldsLabel}</p>
      )}

      {/* ── Single unified Save ──────────────────────────────────────── */}
      {hasAnything && (
        <div className="sticky bottom-0 -mx-4 mt-2 border-t border-border bg-popover px-4 py-3">
          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? savingLabel : saveLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
