"use client";

import {
  createEntity,
  getEntityTranslations,
  publishEntity,
  updateEntityTranslation,
  updateEntityMetadata,
} from "@/3-features/manage-entities";
import type {
  Tenant,
  TenantEntity,
  TenantTranslation,
} from "@/5-shared/lib/db/schema";
import { isRtl } from "@/5-shared/lib/next/rtl";
import {
  resolveTranslation,
  type TranslationDict,
} from "@/5-shared/lib/translations/resolve";
import type { SupportedLocaleType } from "@/5-shared/types";
import type { EntityKind } from "@/5-shared/types/tenants/entities";
import { Button } from "@/components/tenant/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useMemo, useState, useTransition } from "react";

type EntityRow = {
  entity: TenantEntity;
  translation: TenantTranslation | null;
};

interface CollectionManagerProps {
  tenant: Tenant;
  activeLocale: SupportedLocaleType;
  initialEntities: EntityRow[];
  blockType?: string;
  blockId?: string;
  translations?: TranslationDict;
}

export function CollectionManager({
  tenant,
  activeLocale,
  initialEntities,
  blockType,
  blockId,
  translations,
}: CollectionManagerProps) {
  const [isPending, startTransition] = useTransition();
  const entityKinds = useMemo((): EntityKind[] => {
    if (blockType === "blog-feed") return ["blog_post"];
    if (blockType === "podcast-feed") return ["podcast_episode"];
    if (blockType === "awards") return ["award_item"];
    if (blockType === "testimonials") return ["testimonial"];
    return ["blog_post", "podcast_episode", "award_item"];
  }, [blockType]);

  // Derive effective kind from entityKinds; if blockType changed, reset to first
  const [newKind, setNewKind] = useState<EntityKind>(entityKinds[0]);
  const effectiveKind = entityKinds.includes(newKind)
    ? newKind
    : entityKinds[0];
  const [newSlug, setNewSlug] = useState("");
  const [newRating, setNewRating] = useState<number>(0);
  const dir = isRtl(activeLocale) ? "rtl" : "ltr";

  // ── Locale-reactive entity rows ──────────────────────────────────────
  // Start with initialEntities filtered by blockId
  const initialFiltered = useMemo(() => {
    return blockId
      ? initialEntities.filter(
          (row) =>
            row.entity.blockId === blockId &&
            entityKinds.includes(row.entity.kind as EntityKind),
        )
      : initialEntities.filter((row) =>
          entityKinds.includes(row.entity.kind as EntityKind),
        );
  }, [initialEntities, blockId, entityKinds]);

  // Store locale-specific translation overrides (separate from base data)
  const [localeOverrides, setLocaleOverrides] = useState<
    Map<
      string,
      { payload: Record<string, string>; translationStatus: string } | null
    >
  >(new Map());

  // Derive final rows by overlaying locale translations onto base data
  const entityRows = useMemo(() => {
    return initialFiltered.map((row) => {
      const override = localeOverrides.get(row.entity.id);
      if (override === undefined) return row;
      if (override === null) return { ...row, translation: null };
      return {
        ...row,
        translation: {
          ...(row.translation ?? {
            id: "",
            tenantId: tenant.id,
            entityId: row.entity.id,
            locale: activeLocale,
            isLocked: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          }),
          payload: override.payload,
          translationStatus: override.translationStatus,
          locale: activeLocale,
        } as TenantTranslation,
      };
    });
  }, [initialFiltered, localeOverrides, tenant.id, activeLocale]);

  // Build a lookup of default-locale payloads for title fallback
  const defaultPayloadMap = new Map<string, Record<string, string>>();
  for (const row of initialFiltered) {
    if (row.translation?.payload) {
      defaultPayloadMap.set(
        row.entity.id,
        row.translation.payload as Record<string, string>,
      );
    }
  }

  // Stable entity ID list for the translation effect
  const entityIds = useMemo(
    () => initialFiltered.map((r) => r.entity.id),
    [initialFiltered],
  );

  // Fetch translations for the active locale
  useEffect(() => {
    if (entityIds.length === 0) return;

    getEntityTranslations(tenant.id, entityIds, activeLocale).then(
      (localeRows) => {
        const map = new Map<
          string,
          { payload: Record<string, string>; translationStatus: string } | null
        >();
        for (const r of localeRows) {
          map.set(r.entityId, {
            payload: r.payload,
            translationStatus: r.translationStatus,
          });
        }
        setLocaleOverrides(map);
      },
    );
  }, [activeLocale, tenant.id, entityIds]);

  const newItemLabel = resolveTranslation(translations, "new-item", "New Item");
  const kindLabel = resolveTranslation(translations, "label.kind", "Kind");
  const slugLabel = resolveTranslation(translations, "label.slug", "Slug");
  const slugPlaceholder = resolveTranslation(
    translations,
    "placeholder.slug",
    "my-first-post",
  );
  const createLabel = resolveTranslation(translations, "create", "Create");
  const emptyLabel = resolveTranslation(
    translations,
    "empty",
    "No content yet. Create your first item above.",
  );

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newSlug.trim()) return;
    const metadata =
      effectiveKind === "testimonial" && newRating > 0
        ? { rating: newRating }
        : undefined;
    await createEntity({
      tenantId: tenant.id,
      kind: newKind,
      slug: newSlug.trim(),
      blockId,
      metadata,
    });
    setNewSlug("");
    setNewRating(0);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ── Create new entity ──────────────────────────────────────── */}

      {/* Only show the Kind dropdown if more than one kind is possible */}
      <form
        onSubmit={handleCreate}
        className="flex flex-col gap-3 p-4 bg-muted border border-dashed border-border"
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {newItemLabel}
        </p>
        <div className="flex flex-wrap gap-3 items-end">
          {entityKinds.length > 1 && (
            <div className="flex flex-col gap-1 min-w-35">
              <Label>{kindLabel}</Label>
              <Select
                value={newKind}
                onValueChange={(v) => setNewKind(v as EntityKind)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {entityKinds.map((k) => (
                    <SelectItem key={k} value={k}>
                      {k.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="flex flex-col gap-1 flex-1 min-w-40">
            <Label>{slugLabel}</Label>
            <Input
              value={newSlug}
              onChange={(e) => setNewSlug(e.target.value)}
              placeholder={slugPlaceholder}
              pattern="[a-z0-9-]+"
              title="lowercase letters, numbers and hyphens only"
            />
          </div>

          {effectiveKind === "testimonial" && (
            <div className="flex flex-col gap-1 min-w-24">
              <Label>
                {resolveTranslation(translations, "label.rating", "Rating (1-5)")}
              </Label>
              <Input
                type="number"
                min={1}
                max={5}
                value={newRating || ""}
                onChange={(e) => setNewRating(Number(e.target.value))}
              />
            </div>
          )}

          <Button
            type="submit"
            tenantVariant="default"
            disabled={isPending || !newSlug.trim()}
          >
            {createLabel}
          </Button>
        </div>
      </form>

      <Separator />

      {/* ── Entity list ────────────────────────────────────────────── */}
      {entityRows.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">
          {emptyLabel}
        </p>
      )}

      <div className="flex flex-col gap-3">
        {entityRows.map(({ entity, translation }) => (
          <EntityRow
            key={entity.id}
            entity={entity}
            translation={translation}
            defaultPayload={
              (defaultPayloadMap.get(entity.id) ?? {}) as Record<string, string>
            }
            tenantId={tenant.id}
            activeLocale={activeLocale}
            dir={dir}
            translations={translations}
          />
        ))}
      </div>
    </div>
  );
}

// ── EntityRow ──────────────────────────────────────────────────────────────────

interface EntityRowProps {
  entity: TenantEntity;
  translation: TenantTranslation | null;
  defaultPayload: Record<string, string>;
  tenantId: string;
  activeLocale: SupportedLocaleType;
  dir: "ltr" | "rtl";
  translations?: TranslationDict;
}

function EntityRow({
  entity,
  translation,
  defaultPayload,
  tenantId,
  activeLocale,
  dir,
  translations,
}: EntityRowProps) {
  const [isPending, startTransition] = useTransition();
  const payload = (translation?.payload ?? {}) as Record<string, string>;
  const displayTitle =
    payload.title ?? defaultPayload.title ?? entity.slug ?? entity.id;

  const noTranslationLabel = resolveTranslation(
    translations,
    "no-translation",
    "no translation for {locale}",
    { locale: activeLocale },
  );
  const editLabel = resolveTranslation(
    translations,
    "edit-translation",
    "Edit Translation — {locale}",
    { locale: activeLocale.toUpperCase() },
  );
  const publishLabel = resolveTranslation(translations, "publish", "Publish");
  const metadataLabel = resolveTranslation(translations, "label.edit-metadata", "Edit Metadata");
  const ratingLabel = resolveTranslation(translations, "label.rating", "Rating (1—5)");

  const testimonialMeta = entity.metadata as { authorRole?: string; rating?: number } | null;

  const [metadataOpen, setMetadataOpen] = useState(false);

  return (
    <div className="flex items-center justify-between p-4 bg-card rounded-xl border border-border">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs font-mono">
            {entity.kind}
          </Badge>
          <span className="text-sm font-medium text-card-foreground truncate max-w-50">
            {displayTitle}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={entity.status === "published" ? "default" : "secondary"}
            className="text-xs"
          >
            {entity.status}
          </Badge>
          {translation ? (
            <TranslationStatusBadge
              status={translation.translationStatus}
              translations={translations}
            />
          ) : (
            <span className="text-xs text-amber-500">{noTranslationLabel}</span>
          )}
        </div>

        {entity.kind === "testimonial" && testimonialMeta?.rating != null && (
          <span className="text-xs text-muted-foreground">
            Rating: {"★".repeat(Math.min(Math.max(testimonialMeta.rating, 0), 5))}
            {"☆".repeat(Math.max(5 - Math.min(Math.max(testimonialMeta.rating, 0), 5), 0))} ({testimonialMeta.rating}/5)
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Edit translation */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" disabled={isPending}>
              {editLabel}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <div dir={dir}>
              <DialogHeader>
                <DialogTitle>
                  Edit Translation &mdash; {activeLocale.toUpperCase()}
                </DialogTitle>
              </DialogHeader>
              <TranslationForm
                entity={entity}
                tenantId={tenantId}
                activeLocale={activeLocale}
                currentPayload={payload}
                dir={dir}
                translations={translations}
              />
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit metadata (testimonials — rating) */}
        {entity.kind === "testimonial" && (
          <Dialog open={metadataOpen} onOpenChange={setMetadataOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" disabled={isPending}>
                {metadataLabel}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <div dir={dir}>
                <DialogHeader>
                  <DialogTitle>
                    Edit Metadata &mdash; {activeLocale.toUpperCase()}
                  </DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const fd = new FormData(e.currentTarget);
                    const rating = Number(fd.get("rating"));
                    const meta: Record<string, unknown> = {
                      ...testimonialMeta,
                      rating: rating > 0 ? rating : undefined,
                    };
                    await updateEntityMetadata(entity.id, tenantId, meta);
                    setMetadataOpen(false);
                  }}
                  className="flex flex-col gap-4 mt-4"
                  dir={dir}
                >
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="md-rating">{ratingLabel}</Label>
                    <Input
                      id="md-rating"
                      name="rating"
                      type="number"
                      min={1}
                      max={5}
                      defaultValue={testimonialMeta?.rating ?? ""}
                    />
                  </div>
                  <DialogClose asChild>
                    <Button type="submit" className="mt-2">
                      Save
                    </Button>
                  </DialogClose>
                </form>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Publish */}
        {entity.status !== "published" && (
          <Button
            size="sm"
            disabled={isPending}
            onClick={() =>
              startTransition(() => publishEntity(entity.id, tenantId))
            }
          >
            {publishLabel}
          </Button>
        )}
      </div>
    </div>
  );
}

// ── TranslationForm ──────────────────────────────────────────────────────────

interface TranslationFormProps {
  entity: TenantEntity;
  tenantId: string;
  activeLocale: SupportedLocaleType;
  currentPayload: Record<string, string>;
  dir: "ltr" | "rtl";
  translations?: TranslationDict;
}

function TranslationForm({
  entity,
  tenantId,
  activeLocale,
  currentPayload,
  dir,
  translations,
}: TranslationFormProps) {
  const isBlog = entity.kind === "blog_post";
  const isPodcast = entity.kind === "podcast_episode";
  const isTestimonial = entity.kind === "testimonial";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload: Record<string, string> = {};
    for (const [k, v] of fd.entries()) {
      payload[k] = v as string;
    }
    await updateEntityTranslation(entity.id, tenantId, activeLocale, payload);
  }

  return (
    <form
      key={activeLocale}
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 mt-4"
      dir={dir}
    >
      <div className="flex flex-col gap-1">
        <Label htmlFor="et-title">
          {resolveTranslation(translations, "label.title", "Title")}
        </Label>
        <Input
          id="et-title"
          name="title"
          defaultValue={currentPayload.title ?? ""}
          dir={dir}
          required
        />
      </div>

      {(isBlog || isPodcast) && (
        <div className="flex flex-col gap-1">
          <Label htmlFor="et-excerpt">
            {isBlog
              ? resolveTranslation(translations, "label.excerpt", "Excerpt")
              : resolveTranslation(
                  translations,
                  "label.description",
                  "Description",
                )}
          </Label>
          <Textarea
            id="et-excerpt"
            name={isBlog ? "excerpt" : "description"}
            defaultValue={
              isBlog
                ? (currentPayload.excerpt ?? "")
                : (currentPayload.description ?? "")
            }
            rows={3}
            dir={dir}
          />
        </div>
      )}

      {isTestimonial && (
        <div className="flex flex-col gap-1">
          <Label htmlFor="et-quote">
            {resolveTranslation(translations, "label.quote", "Quote")}
          </Label>
          <Textarea
            id="et-quote"
            name="quote"
            defaultValue={currentPayload.quote ?? ""}
            rows={4}
            dir={dir}
          />
        </div>
      )}

      {!isBlog && !isPodcast && !isTestimonial && (
        <div className="flex flex-col gap-1">
          <Label htmlFor="et-desc">
            {resolveTranslation(
              translations,
              "label.description",
              "Description",
            )}
          </Label>
          <Textarea
            id="et-desc"
            name="description"
            defaultValue={currentPayload.description ?? ""}
            rows={3}
            dir={dir}
          />
        </div>
      )}

      {isBlog && (
        <div className="flex flex-col gap-1">
          <Label htmlFor="et-slug">
            {resolveTranslation(
              translations,
              "label.localized-slug",
              "Localized Slug",
            )}
          </Label>
          <Input
            id="et-slug"
            name="localizedSlug"
            defaultValue={currentPayload.localizedSlug ?? ""}
          />
        </div>
      )}

      <DialogClose asChild>
        <Button type="submit" className="mt-2">
          {resolveTranslation(
            translations,
            "save-translation",
            "Save Translation",
          )}
        </Button>
      </DialogClose>
    </form>
  );
}

// ── Translation Status Badge ───────────────────────────────────────────────────

type TranslationStatus = "pending" | "translated" | "failed" | "locked";

const STATUS_CONFIG: Record<
  TranslationStatus,
  {
    label: string;
    icon: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  pending: { label: "pending", icon: "⏳", variant: "secondary" },
  translated: { label: "translated", icon: "✓", variant: "default" },
  failed: { label: "failed", icon: "✗", variant: "destructive" },
  locked: { label: "locked", icon: "🔒", variant: "outline" },
};

function TranslationStatusBadge({
  status,
  translations,
}: {
  status: string;
  translations?: TranslationDict;
}) {
  const cfg = STATUS_CONFIG[status as TranslationStatus] ?? {
    label: resolveTranslation(translations, `status.${status}`, status),
    icon: "?",
    variant: "outline" as const,
  };

  if (STATUS_CONFIG[status as TranslationStatus]) {
    cfg.label = resolveTranslation(translations, `status.${status}`, cfg.label);
  }

  return (
    <Badge variant={cfg.variant} className="gap-1 text-xs">
      {cfg.icon} {cfg.label}
    </Badge>
  );
}
