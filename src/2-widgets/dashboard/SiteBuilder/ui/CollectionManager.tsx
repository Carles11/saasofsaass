"use client";

import { deleteEntity, getEntityTranslations, setEntityStatus } from "@/3-features/manage-entities";
import { updateBlockConfig } from "@/3-features/manage-site-blocks";
import type {
  Tenant,
  TenantEntity,
  TenantTranslation,
} from "@/5-shared/lib/db/schema";
import {
  resolveTranslation,
  type TranslationDict,
} from "@/5-shared/lib/translations/resolve";
import { toast } from "@/5-shared/lib/ui/toast";
import type { SupportedLocaleType } from "@/5-shared/types";
import type { EntityKind } from "@/5-shared/types/tenants/entities";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, EyeOff, GalleryHorizontalEnd, Info, LayoutGrid, MoreVertical, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { CollectionItemEditor } from "./CollectionItemEditor";

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
  blockConfig?: Record<string, unknown>;
  translations?: TranslationDict;
}

export function CollectionManager({
  tenant,
  activeLocale,
  initialEntities,
  blockType,
  blockId,
  blockConfig,
  translations,
}: CollectionManagerProps) {
  const router = useRouter();

  // Grid / slider view toggle (card-based feed blocks only).
  const supportsViewMode = ["blog-feed", "podcast-feed", "awards"].includes(blockType ?? "");
  const [viewMode, setViewMode] = useState<"grid" | "slider">(
    ((blockConfig?.viewMode as string) === "slider" ? "slider" : "grid"),
  );
  function changeViewMode(next: "grid" | "slider") {
    if (!blockId) return;
    setViewMode(next);
    updateBlockConfig(blockId, tenant.id, { ...(blockConfig ?? {}), viewMode: next }).catch(() => {});
  }

  const entityKinds = useMemo((): EntityKind[] => {
    if (blockType === "blog-feed") return ["blog_post"];
    if (blockType === "podcast-feed") return ["podcast_episode"];
    if (blockType === "awards") return ["award_item"];
    if (blockType === "testimonials") return ["testimonial"];
    return ["blog_post", "podcast_episode", "award_item"];
  }, [blockType]);

  const [newKind, setNewKind] = useState<EntityKind>(entityKinds[0]);
  const effectiveKind = entityKinds.includes(newKind) ? newKind : entityKinds[0];

  // Editor state: null = closed; { entity } = edit; { entity: null } = new.
  const [editor, setEditor] = useState<{ entity: TenantEntity | null; kind: EntityKind } | null>(null);

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

  // Overlay active-locale translations for list display (title + status).
  const [localeOverrides, setLocaleOverrides] = useState<
    Map<string, { payload: Record<string, string>; translationStatus: string } | null>
  >(new Map());

  const entityIds = useMemo(
    () => initialFiltered.map((r) => r.entity.id),
    [initialFiltered],
  );

  useEffect(() => {
    if (entityIds.length === 0) {
      setLocaleOverrides(new Map());
      return;
    }
    getEntityTranslations(tenant.id, entityIds, activeLocale).then((rows) => {
      const map = new Map<string, { payload: Record<string, string>; translationStatus: string } | null>();
      for (const r of rows) {
        map.set(r.entityId, { payload: r.payload, translationStatus: r.translationStatus });
      }
      setLocaleOverrides(map);
    });
  }, [activeLocale, tenant.id, entityIds]);

  const defaultPayloadMap = new Map<string, Record<string, string>>();
  for (const row of initialFiltered) {
    if (row.translation?.payload) {
      defaultPayloadMap.set(row.entity.id, row.translation.payload as Record<string, string>);
    }
  }

  const newItemLabel = resolveTranslation(translations, "new-item", "New Item");
  const kindLabel = resolveTranslation(translations, "label.kind", "Kind");
  const emptyLabel = resolveTranslation(
    translations,
    "empty",
    "No content yet. Create your first item above.",
  );
  const editLabel = resolveTranslation(translations, "edit", "Edit");

  function refresh() {
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ── Create new entity ──────────────────────────────────────── */}
      <div className="flex flex-wrap items-end gap-3 p-4 bg-muted border border-dashed border-border rounded-xl">
        {entityKinds.length > 1 && (
          <div className="flex flex-col gap-1 min-w-40">
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {kindLabel}
            </span>
            <Select value={newKind} onValueChange={(v) => setNewKind(v as EntityKind)}>
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
        <Button onClick={() => setEditor({ entity: null, kind: effectiveKind })} className="gap-1.5">
          <Plus className="h-4 w-4" />
          {newItemLabel}
        </Button>

        {supportsViewMode && (
          <div className="ml-auto flex items-center gap-2">
            <InfoHint
              text={resolveTranslation(
                translations,
                "view.hint",
                "Choose how items appear on your site: Grid shows a few in a tidy grid (with a “See all” link); Slider shows them in a swipeable carousel.",
              )}
            />
            <div className="flex items-center gap-1 rounded-lg border border-border bg-background p-0.5">
              <button
                type="button"
                onClick={() => changeViewMode("grid")}
                aria-label={resolveTranslation(translations, "view.grid", "Grid view")}
                title={resolveTranslation(translations, "view.grid", "Grid view")}
                className={`p-1.5 rounded-md cursor-pointer transition-colors ${viewMode === "grid" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => changeViewMode("slider")}
                aria-label={resolveTranslation(translations, "view.slider", "Slider view")}
                title={resolveTranslation(translations, "view.slider", "Slider view")}
                className={`p-1.5 rounded-md cursor-pointer transition-colors ${viewMode === "slider" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                <GalleryHorizontalEnd className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Entity list ────────────────────────────────────────────── */}
      {initialFiltered.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">{emptyLabel}</p>
      )}

      <div className="flex flex-col gap-3">
        {initialFiltered.map(({ entity }) => {
          const override = localeOverrides.get(entity.id);
          const payload = override?.payload ?? {};
          const defaultPayload = defaultPayloadMap.get(entity.id) ?? {};
          const displayTitle =
            payload.title || defaultPayload.title || entity.slug || entity.id;
          const translationStatus = override?.translationStatus;

          return (
            <div
              key={entity.id}
              className="flex items-center justify-between gap-2 p-4 bg-card rounded-xl border border-border hover:border-primary/60 hover:shadow-sm transition-all"
            >
              <button
                type="button"
                onClick={() => setEditor({ entity, kind: entity.kind as EntityKind })}
                className="flex flex-1 flex-col gap-1.5 min-w-0 text-left cursor-pointer"
              >
                <span className="text-sm font-medium text-card-foreground truncate max-w-80">
                  {displayTitle}
                </span>
                <div className="flex items-center gap-2">
                  <Badge variant={entity.status === "published" ? "default" : "secondary"} className="text-xs">
                    {resolveTranslation(translations, `status.${entity.status}`, entity.status)}
                  </Badge>
                  {translationStatus && (
                    <Badge
                      variant={translationStatus === "translated" ? "outline" : "secondary"}
                      className="text-xs"
                    >
                      {resolveTranslation(translations, `status.${translationStatus}`, translationStatus)}
                    </Badge>
                  )}
                </div>
              </button>
              <div className="flex items-center gap-2 shrink-0">
                <span className="hidden sm:inline text-xs font-medium text-muted-foreground">{editLabel}</span>
                <EntityRowActions
                  entity={entity}
                  tenantId={tenant.id}
                  translations={translations}
                  onChanged={refresh}
                />
              </div>
            </div>
          );
        })}
      </div>

      {editor && (
        <CollectionItemEditor
          open={!!editor}
          onOpenChange={(o) => {
            if (!o) setEditor(null);
          }}
          tenant={tenant}
          kind={editor.kind}
          blockId={blockId}
          entity={editor.entity}
          translations={translations}
          onSaved={refresh}
        />
      )}
    </div>
  );
}

// ── Info hint: hover (desktop) + tap (mobile) ───────────────────────────────
function InfoHint({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="relative flex items-center"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-label={text}
        onClick={() => setOpen((v) => !v)}
        className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
      >
        <Info className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-9 z-30 w-64 rounded-lg border border-border bg-popover p-3 text-xs leading-relaxed text-popover-foreground shadow-lg">
          {text}
        </div>
      )}
    </div>
  );
}

// ── Per-row quick actions (publish / unpublish / delete) ─────────────────────
function EntityRowActions({
  entity,
  tenantId,
  translations,
  onChanged,
}: {
  entity: TenantEntity;
  tenantId: string;
  translations?: TranslationDict;
  onChanged: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const isPublished = entity.status === "published";

  function toggleStatus() {
    startTransition(async () => {
      await setEntityStatus(entity.id, tenantId, isPublished ? "draft" : "published");
      toast({
        title: isPublished
          ? resolveTranslation(translations, "editor.unpublished", "Unpublished.")
          : resolveTranslation(translations, "editor.published", "Published."),
        status: "success",
      });
      onChanged();
    });
  }

  function remove() {
    startTransition(async () => {
      await deleteEntity(entity.id, tenantId);
      toast({ title: resolveTranslation(translations, "editor.deleted", "Item deleted."), status: "success" });
      onChanged();
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          disabled={isPending}
          aria-label="Item actions"
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={toggleStatus}>
          {isPublished ? (
            <>
              <EyeOff className="h-4 w-4" />
              {resolveTranslation(translations, "editor.unpublish", "Unpublish")}
            </>
          ) : (
            <>
              <Eye className="h-4 w-4" />
              {resolveTranslation(translations, "editor.publish", "Publish")}
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={remove}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
          {resolveTranslation(translations, "editor.delete", "Delete")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
