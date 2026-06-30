"use client";

import {
  createEntity,
  deleteEntity,
  getEntityAllTranslations,
  removeEntityImage,
  setEntityStatus,
  updateEntityMetadata,
  updateEntityTranslation,
} from "@/3-features/manage-entities";
import { triggerEntityTranslation } from "@/3-features/auto-translate-content";
import type { Tenant, TenantEntity } from "@/5-shared/lib/db/schema";
import { isRtl } from "@/5-shared/lib/next/rtl";
import { toast } from "@/5-shared/lib/ui/toast";
import {
  resolveTranslation,
  type TranslationDict,
} from "@/5-shared/lib/translations/resolve";
import type { EntityKind } from "@/5-shared/types/tenants/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/5-shared/lib/utils";
import { Check, ImagePlus, Sparkles, X } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { FullscreenPickerSheet } from "./FullscreenPickerSheet";
import { RichTextEditor } from "./RichTextEditor";

type FieldType = "input" | "textarea" | "richtext";
interface FieldDef {
  key: string;
  labelKey: string;
  labelFallback: string;
  type: FieldType;
}

/** Translatable fields per entity kind. `richtext` fields store sanitized HTML. */
function fieldsForKind(kind: EntityKind): FieldDef[] {
  const title: FieldDef = { key: "title", labelKey: "label.title", labelFallback: "Title", type: "input" };
  switch (kind) {
    case "blog_post":
      return [
        title,
        { key: "excerpt", labelKey: "label.excerpt", labelFallback: "Intro", type: "textarea" },
        { key: "body", labelKey: "label.body", labelFallback: "Body", type: "richtext" },
      ];
    case "podcast_episode":
      return [
        title,
        { key: "description", labelKey: "label.description", labelFallback: "Description", type: "textarea" },
      ];
    case "award_item":
      return [
        title,
        { key: "description", labelKey: "label.description", labelFallback: "Description", type: "richtext" },
      ];
    case "testimonial":
      return [
        title,
        { key: "quote", labelKey: "label.quote", labelFallback: "Quote", type: "textarea" },
      ];
    default:
      return [title];
  }
}

interface CollectionItemEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenant: Tenant;
  kind: EntityKind;
  blockId?: string;
  /** Present in edit mode; absent for a new item. */
  entity?: TenantEntity | null;
  translations?: TranslationDict;
  onSaved?: () => void;
}

type Buffers = Record<string, Record<string, string>>;

export function CollectionItemEditor({
  open,
  onOpenChange,
  tenant,
  kind,
  blockId,
  entity,
  translations,
  onSaved,
}: CollectionItemEditorProps) {
  const locales = tenant.locales as string[];
  const defaultLocale = tenant.defaultLocale;
  const fields = fieldsForKind(kind);
  const isTestimonial = kind === "testimonial";
  const isPodcast = kind === "podcast_episode";
  const hasImage = kind === "blog_post" || kind === "award_item" || kind === "podcast_episode";

  const [activeLocale, setActiveLocale] = useState(defaultLocale);
  const [buffers, setBuffers] = useState<Buffers>({});
  const [rating, setRating] = useState<number>(0);
  const [mediaUrl, setMediaUrl] = useState<string>("");
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  const t = (key: string, fallback: string, params?: Record<string, string>) =>
    resolveTranslation(translations, key, fallback, params);

  // (Re)load buffers whenever the sheet opens.
  useEffect(() => {
    if (!open) return;
    setActiveLocale(defaultLocale);
    setPendingFile(null);
    setCoverUrl(entity?.coverImageUrl ?? null);
    if (entity) {
      setLoading(true);
      getEntityAllTranslations(tenant.id, entity.id)
        .then((rows) => {
          const next: Buffers = {};
          for (const loc of locales) next[loc] = {};
          for (const r of rows) next[r.locale] = { ...(r.payload as Record<string, string>) };
          setBuffers(next);
          // Open on the language that actually has content (default preferred),
          // so an item authored in a non-default language isn't shown empty.
          const order = [defaultLocale, ...locales.filter((l) => l !== defaultLocale)];
          const withContent = order.find((l) =>
            Object.values(next[l] ?? {}).some((v) => typeof v === "string" && v.trim()),
          );
          setActiveLocale(withContent ?? defaultLocale);
          const meta = (entity.metadata ?? {}) as { rating?: number; url?: string };
          setRating(meta.rating ?? 0);
          setMediaUrl(meta.url ?? "");
        })
        .finally(() => setLoading(false));
    } else {
      const next: Buffers = {};
      for (const loc of locales) next[loc] = {};
      setBuffers(next);
      setRating(0);
      setMediaUrl("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, entity?.id]);

  function setField(locale: string, key: string, value: string) {
    setBuffers((prev) => ({ ...prev, [locale]: { ...(prev[locale] ?? {}), [key]: value } }));
  }

  function localeHasContent(locale: string): boolean {
    const buf = buffers[locale] ?? {};
    return Object.values(buf).some((v) => typeof v === "string" && v.trim().length > 0);
  }

  const buildMetadata = (): Record<string, unknown> | undefined => {
    const m: Record<string, unknown> = { ...((entity?.metadata as Record<string, unknown>) ?? {}) };
    if (isTestimonial) m.rating = rating > 0 ? rating : undefined;
    if (isPodcast) m.url = mediaUrl.trim() || undefined;
    return m;
  };
  const metadata = buildMetadata();

  function handleSave() {
    // A title in ANY language is enough (default language preferred as the
    // source). This lets multilingual authors write in whichever language.
    const localeOrder = [defaultLocale, ...locales.filter((l) => l !== defaultLocale)];
    const sourceLocale = localeOrder.find((l) => (buffers[l]?.title ?? "").trim());
    if (!sourceLocale) {
      toast({
        title: t("editor.title-required", "Add a title in at least one language."),
        status: "error",
      });
      return;
    }

    startTransition(async () => {
      try {
        let entityId = entity?.id;
        if (!entityId) {
          const created = await createEntity({
            tenantId: tenant.id,
            blockId,
            kind,
            title: buffers[sourceLocale].title,
            defaultPayload: buffers[sourceLocale],
            sourceLocale,
            metadata,
          });
          entityId = created.id;
          // Persist any other locale buffers entered before first save.
          for (const loc of locales) {
            if (loc === sourceLocale) continue;
            if (localeHasContent(loc)) {
              await updateEntityTranslation(entityId, tenant.id, loc, buffers[loc]);
            }
          }
        } else {
          for (const loc of locales) {
            if (localeHasContent(loc)) {
              await updateEntityTranslation(entityId, tenant.id, loc, buffers[loc]);
            }
          }
          if (isTestimonial || isPodcast) {
            await updateEntityMetadata(entityId, tenant.id, buildMetadata() ?? {});
          }
        }

        // Cover image: upload pending file, or remove if cleared.
        if (hasImage) {
          if (pendingFile) {
            const fd = new FormData();
            fd.append("file", pendingFile);
            fd.append("tenantId", tenant.id);
            fd.append("entityId", entityId);
            const res = await fetch("/api/entity-image/upload", { method: "POST", body: fd });
            if (!res.ok) {
              toast({ title: t("editor.image-failed", "Image upload failed."), status: "error" });
            }
          } else if (!coverUrl && entity?.coverImageUrl) {
            await removeEntityImage(entityId, tenant.id);
          }
        }

        toast({ title: t("editor.saved", "Saved."), status: "success" });
        onSaved?.();
        onOpenChange(false);
      } catch (err) {
        toast({
          title: err instanceof Error ? err.message : t("editor.save-failed", "Could not save."),
          status: "error",
        });
      }
    });
  }

  function handleAutoTranslate() {
    if (!entity?.id) return;
    startTransition(async () => {
      try {
        const res = await triggerEntityTranslation(entity.id, tenant.id);
        if (res.needsSeed) {
          toast({ title: t("editor.translate-no-source", "Add content in your default language first."), status: "info" });
          return;
        }
        const rows = await getEntityAllTranslations(tenant.id, entity.id);
        const next: Buffers = {};
        for (const loc of locales) next[loc] = {};
        for (const r of rows) next[r.locale] = { ...(r.payload as Record<string, string>) };
        setBuffers(next);
        toast({
          title: t("editor.translated", "✨ {count} language(s) translated.", { count: String(res.succeeded) }),
          status: "success",
        });
      } catch {
        toast({ title: t("editor.translate-failed", "Translation failed."), status: "error" });
      }
    });
  }

  function handleDelete() {
    if (!entity?.id) return;
    startTransition(async () => {
      await deleteEntity(entity.id, tenant.id);
      toast({ title: t("editor.deleted", "Item deleted."), status: "success" });
      onSaved?.();
      onOpenChange(false);
    });
  }

  function handleToggleStatus() {
    if (!entity?.id) return;
    const next = entity.status === "published" ? "draft" : "published";
    startTransition(async () => {
      await setEntityStatus(entity.id, tenant.id, next);
      toast({
        title: next === "published" ? t("editor.published", "Published.") : t("editor.unpublished", "Unpublished."),
        status: "success",
      });
      onSaved?.();
    });
  }

  const dir = isRtl(activeLocale) ? "rtl" : "ltr";
  const KIND_FALLBACK: Record<string, string> = {
    blog_post: "blog post",
    podcast_episode: "podcast episode",
    award_item: "award",
    testimonial: "testimonial",
  };
  const kindLabel = t(`kind.${kind}`, KIND_FALLBACK[kind] ?? "item");
  const titleLabel = entity
    ? t("editor.edit-title-kind", "Edit {kind}", { kind: kindLabel })
    : t("editor.new-title-kind", "New {kind}", { kind: kindLabel });

  return (
    <FullscreenPickerSheet
      open={open}
      onOpenChange={onOpenChange}
      title={titleLabel}
      toolbar={
        locales.length > 1 ? (
          <div className="flex gap-2 overflow-x-auto">
            {locales.map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => setActiveLocale(loc)}
                className={cn(
                  "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium uppercase whitespace-nowrap transition-colors cursor-pointer",
                  activeLocale === loc
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                )}
              >
                {loc}
                {localeHasContent(loc) && (
                  <Check className="h-3 w-3 opacity-80" />
                )}
                {loc === defaultLocale && (
                  <span className="text-[10px] opacity-70">({t("editor.default", "default")})</span>
                )}
              </button>
            ))}
          </div>
        ) : undefined
      }
      footer={
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {entity && (
              <>
                <Button variant="outline" size="sm" disabled={isPending} onClick={handleToggleStatus}>
                  {entity.status === "published"
                    ? t("editor.unpublish", "Unpublish")
                    : t("editor.publish", "Publish")}
                </Button>
                <Button variant="ghost" size="sm" disabled={isPending} onClick={handleDelete}
                  className="text-destructive hover:text-destructive">
                  {t("editor.delete", "Delete")}
                </Button>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            {entity && locales.length > 1 && (
              <Button variant="outline" size="sm" disabled={isPending} onClick={handleAutoTranslate} className="gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                {t("editor.auto-translate", "Auto-translate")}
              </Button>
            )}
            <Button disabled={isPending || loading} onClick={handleSave}>
              {isPending ? t("editor.saving", "Saving…") : t("save", "Save")}
            </Button>
          </div>
        </div>
      }
    >
      <div className="max-w-3xl mx-auto" dir={dir}>
        {loading ? (
          <p className="text-sm text-muted-foreground py-8 text-center">{t("editor.loading", "Loading…")}</p>
        ) : (
          <div className="flex flex-col gap-5">
            {hasImage && (
              <div className="flex flex-col gap-2">
                <Label>{t("editor.image", "Image")}</Label>
                {pendingFile || coverUrl ? (
                  <div className="relative w-full max-w-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={pendingFile ? URL.createObjectURL(pendingFile) : coverUrl!}
                      alt=""
                      className="w-full aspect-[16/9] object-cover rounded-[var(--radius)] border border-border"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPendingFile(null);
                        setCoverUrl(null);
                      }}
                      className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-background/90 border border-border text-muted-foreground hover:text-destructive"
                      aria-label={t("editor.remove-image", "Remove image")}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex w-full max-w-sm cursor-pointer flex-col items-center justify-center gap-2 rounded-[var(--radius)] border border-dashed border-border bg-muted/40 py-8 text-muted-foreground hover:bg-muted transition-colors">
                    <ImagePlus className="h-6 w-6" />
                    <span className="text-sm">{t("editor.add-image", "Add image")}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) setPendingFile(f);
                      }}
                    />
                  </label>
                )}
              </div>
            )}
            {fields.map((f) => {
              const value = buffers[activeLocale]?.[f.key] ?? "";
              const label = t(f.labelKey, f.labelFallback);
              return (
                <div key={f.key} className="flex flex-col gap-1.5">
                  <Label htmlFor={`f-${f.key}`}>{label}</Label>
                  {f.type === "input" ? (
                    <Input
                      id={`f-${f.key}`}
                      value={value}
                      dir={dir}
                      onChange={(e) => setField(activeLocale, f.key, e.target.value)}
                    />
                  ) : f.type === "richtext" ? (
                    <RichTextEditor
                      value={value}
                      dir={dir}
                      resetKey={`${activeLocale}-${f.key}`}
                      onChange={(html) => setField(activeLocale, f.key, html)}
                    />
                  ) : (
                    <Textarea
                      id={`f-${f.key}`}
                      value={value}
                      dir={dir}
                      rows={4}
                      onChange={(e) => setField(activeLocale, f.key, e.target.value)}
                    />
                  )}
                </div>
              );
            })}

            {isTestimonial && activeLocale === defaultLocale && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="f-rating">{t("label.rating", "Rating (1–5)")}</Label>
                <Input
                  id="f-rating"
                  type="number"
                  min={1}
                  max={5}
                  value={rating || ""}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="w-28"
                />
              </div>
            )}

            {isPodcast && activeLocale === defaultLocale && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="f-url">{t("label.media-url", "Video / audio URL (YouTube, Vimeo, …)")}</Label>
                <Input
                  id="f-url"
                  type="url"
                  inputMode="url"
                  placeholder="https://youtube.com/watch?v=…"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </FullscreenPickerSheet>
  );
}
