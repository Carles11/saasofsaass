"use client";

import { BLOCK_CATALOG } from "@/2-widgets/tenant/BlockRenderer/config/blockCatalog";
import { canManageStructure } from "@/5-shared/config/permissions";
import type { BlockKind } from "@/5-shared/types/tenants/blocks";
import {
  deleteBlock,
  toggleBlockVisibility,
  updateBlockConfig,
} from "@/3-features/manage-site-blocks";
import type {
  Block,
  Tenant,
  TenantEntity,
  TenantTranslation,
} from "@/5-shared/lib/db/schema";
import { toast } from "@/5-shared/lib/ui/toast";
import {
  resolveTranslation,
  type TranslationDict,
} from "@/5-shared/lib/translations/resolve";
import type { SupportedLocaleType } from "@/5-shared/types";
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
import { Spinner } from "@/components/ui/spinner";
import { useSortable } from "@dnd-kit/sortable";
import { GripVertical } from "lucide-react";
import { useState, useTransition } from "react";
import { BlockEditForm } from "./BlockEditForm";
import { BlockEditorHeader } from "./BlockEditorHeader";
import { BlockExpandedArea } from "./BlockExpandedArea";
import { BlockTranslatableFields } from "./BlockTranslatableFields";
import { CollectionManager } from "./CollectionManager";
import { DonationsForm } from "./DonationsForm";
import { GalleryManager } from "./GalleryManager";

type EntityRow = {
  entity: TenantEntity;
  translation: TenantTranslation | null;
};

interface BlockCardProps {
  block: Block;
  tenantId: string;
  tenant: Tenant;
  activeLocale: SupportedLocaleType;
  initialEntities: EntityRow[];
  userRole?: "owner" | "webmaster" | "editor" | null;
  translations?: TranslationDict;
  onLocaleChange?: (locale: SupportedLocaleType) => void;
  plan?: string;
}

export function BlockCard({
  block,
  tenantId,
  tenant,
  activeLocale,
  initialEntities,
  userRole,
  translations,
  onLocaleChange,
}: BlockCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isCollectionBlock = [
    "blog-feed",
    "podcast-feed",
    "awards",
    "image-gallery",
    "testimonials",
    "sponsors",
  ].includes(block.type);

  // ── Completeness: do all enabled languages have the required content? ──
  const completeness: "complete" | "incomplete" = (() => {
    const locales = tenant.locales as string[];
    const defaultLocale = tenant.defaultLocale;
    // Gallery content lives in its own tables — not assessable here.
    if (block.type === "image-gallery") return "complete";
    if (isCollectionBlock) {
      const items = initialEntities.filter((r) => r.entity.blockId === block.id);
      return items.length > 0 ? "complete" : "incomplete";
    }
    const fieldKeys = (BLOCK_CATALOG[block.type as BlockKind]?.fields ?? [])
      .filter((f) => f.inputType !== "image")
      .map((f) => f.key);
    if (fieldKeys.length === 0) return "complete";
    const trans = (block.translations ?? {}) as Record<string, Record<string, string>>;
    const def = trans[defaultLocale] ?? {};
    const required = fieldKeys.filter((k) => (def[k] ?? "").trim().length > 0);
    if (required.length === 0) return "incomplete"; // no content in default language yet
    for (const loc of locales) {
      const lt = trans[loc] ?? {};
      for (const k of required) if (!(lt[k] ?? "").trim()) return "incomplete";
    }
    return "complete";
  })();
  const completeLabel = resolveTranslation(translations, "status.complete", "Complete");
  const incompleteLabel = resolveTranslation(translations, "status.incomplete", "Incomplete");

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: block.id,
    disabled: !canManageStructure(userRole),
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        transition,
      }
    : undefined;

  const editLabel = resolveTranslation(translations, "action.edit", "Edit");
  const manageContentLabel = resolveTranslation(
    translations,
    "action.manage-content",
    "Manage Content",
  );
  const closeLabel = resolveTranslation(translations, "action.close", "Close");
  const hiddenLabel = resolveTranslation(
    translations,
    "status.hidden",
    "hidden",
  );
  const deleteLabel = resolveTranslation(
    translations,
    "action.delete",
    "Delete",
  );
  const deleteTitle = resolveTranslation(
    translations,
    "delete-confirm.title",
    'Delete "{name}" block?',
    { name: block.type },
  );
  const deleteWarning = resolveTranslation(
    translations,
    "delete-confirm.warning",
    "This action cannot be undone.",
  );
  const deleteConfirm = resolveTranslation(
    translations,
    "delete-confirm.confirm",
    "Confirm Delete",
  );
  const cancelLabel = resolveTranslation(translations, "cancel", "Cancel");
  const protectedBlockMessage = resolveTranslation(
    translations,
    "protected-block",
    "This section cannot be removed.",
  );

  const isHero = block.type === "hero";
  const isFooter = block.type === "footer";
  const blockConfig = (block.config ?? {}) as Record<string, unknown>;
  const includeInNavDefault = BLOCK_CATALOG[block.type as BlockKind]?.includeInNav ?? false;
  const includeInNavValue = isHero
    ? true
    : ((blockConfig.includeInNav as boolean | undefined) ??
      includeInNavDefault);

  const includeInNavLabel = resolveTranslation(
    translations,
    "include-in-nav",
    "Show in navigation",
  );
  const includeInNavDisabledNote = resolveTranslation(
    translations,
    "include-in-nav-disabled-note",
    "(always shown)",
  );

  async function handleIncludeInNavChange(checked: boolean) {
    const newConfig = { ...blockConfig, includeInNav: checked };
    await updateBlockConfig(block.id, tenantId, newConfig);
  }


  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-card border border-border transition-opacity ${
        isExpanded ? "rounded-b-none border-b-0" : ""
      } ${isDragging ? "opacity-50 z-10" : ""} ${isPending ? "opacity-50 pointer-events-none" : ""}`}
    >
      {/* ── Card header ─────────────────────────────────────────────── */}
      <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 sm:p-4">
        <div className="flex items-center gap-2 min-w-0">
          {canManageStructure(userRole) && (
            <button
              type="button"
              suppressHydrationWarning
              className="cursor-grab active:cursor-grabbing touch-none text-muted-foreground hover:text-foreground shrink-0 p-1"
              {...attributes}
              {...listeners}
              aria-label="Drag to reorder"
            >
              <GripVertical className="h-4 w-4" />
            </button>
          )}
          <Badge variant="secondary" className="text-xs shrink-0">
            {resolveTranslation(
              translations,
              `picker.${block.type}.name`,
              BLOCK_CATALOG[block.type as BlockKind]?.name ?? block.type,
            )}
          </Badge>
          {completeness === "complete" ? (
            <Badge
              variant="outline"
              className="text-xs shrink-0 border-emerald-500/40 text-emerald-600 dark:text-emerald-400"
            >
              {completeLabel}
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="text-xs shrink-0 border-amber-500/50 text-amber-600 dark:text-amber-400"
            >
              {incompleteLabel}
            </Badge>
          )}
          {!block.isVisible && (
            <span className="text-xs text-muted-foreground italic truncate">
              {hiddenLabel}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1 shrink-0">
          {/* Visibility toggle */}
          <Button
            tenantVariant="ghost"
            size="sm"
            disabled={isPending}
            aria-label="Toggle visibility"
            onClick={() =>
              startTransition(() =>
                toggleBlockVisibility(block.id, tenantId, block.isVisible),
              )
            }
          >
            {block.isVisible ? "👁" : "🙈"}
          </Button>

          {/* Edit / Manage Content — toggle expansion */}
          <Button
            tenantVariant={
              isExpanded
                ? "secondary"
                : isCollectionBlock
                  ? "default"
                  : "outline"
            }
            size="sm"
            disabled={isPending}
            onClick={() => setIsExpanded((prev) => !prev)}
          >
            {isExpanded
              ? closeLabel
              : isCollectionBlock
                ? manageContentLabel
                : editLabel}
          </Button>

          {/* Delete — owner only */}
          {isHero || isFooter ? (
            <Button
              tenantVariant="destructive"
              size="sm"
              disabled
              title={protectedBlockMessage}
            >
              {deleteLabel}
            </Button>
          ) : canManageStructure(userRole) ? (
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  tenantVariant="destructive"
                  size="sm"
                  disabled={isPending}
                >
                  {deleteLabel}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{deleteTitle}</DialogTitle>
                </DialogHeader>
                <p className="text-sm text-muted-foreground mb-4">
                  {deleteWarning}
                </p>
                <div className="flex gap-2 justify-end">
                  <DialogClose asChild>
                    <Button tenantVariant="outline">{cancelLabel}</Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button
                      tenantVariant="destructive"
                      onClick={() =>
                        startTransition(() => deleteBlock(block.id, tenantId))
                      }
                    >
                      {deleteConfirm}
                    </Button>
                  </DialogClose>
                </div>
              </DialogContent>
            </Dialog>
          ) : null}
        </div>
      </div>

      {/* ── Expanded inline editor ──────────────────────────────────── */}
      <BlockExpandedArea isExpanded={isExpanded}>
        <div className="border-t border-border relative">
          <BlockEditorHeader
            tenantId={tenantId}
            blockId={block.id}
            blockType={block.type}
            locales={tenant.locales}
            activeLocale={activeLocale}
            onLocaleChange={onLocaleChange ?? (() => {})}
            defaultLocale={tenant.defaultLocale}
            onTranslate={setIsTranslating}
            translations={translations}
          />

          {/* ── includeInNav toggle — not shown for footer ──────────── */}
          {!isFooter && (
            <label className="flex items-center gap-3 cursor-pointer px-4 py-3 border-t border-border">
              <button
                type="button"
                role="switch"
                aria-checked={includeInNavValue}
                disabled={isHero}
                onClick={() =>
                  !isHero && handleIncludeInNavChange(!includeInNavValue)
                }
                className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
                  includeInNavValue ? "bg-primary" : "bg-input"
                }`}
              >
                <span
                  className={`pointer-events-none block h-4 w-4 rounded-full bg-background shadow-sm ring-0 transition-transform ${
                    includeInNavValue
                      ? "translate-x-[18px]"
                      : "translate-x-[2px]"
                  }`}
                />
              </button>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{includeInNavLabel}</span>
                {isHero && (
                  <span className="text-xs text-muted-foreground">
                    {includeInNavDisabledNote}
                  </span>
                )}
              </div>
            </label>
          )}

          <div
            className={
              "border-t border-border" +
              (isTranslating ? " pointer-events-none" : "")
            }
          >
            {block.type === "image-gallery" ? (
              <div className="p-3 sm:p-4">
                <GalleryManager
                  blockId={block.id}
                  tenant={tenant}
                  activeLocale={activeLocale}
                  onImagesChange={() => {}}
                />
              </div>
            ) : block.type === "donations" ? (
              <>
                <BlockTranslatableFields
                  block={block}
                  activeLocale={activeLocale}
                  locales={tenant.locales as string[]}
                  defaultLocale={tenant.defaultLocale}
                />
                <DonationsForm
                  blockId={block.id}
                  tenantId={tenantId}
                  translations={translations}
                  onSuccess={() => setIsExpanded(false)}
                />
              </>
            ) : isCollectionBlock ? (
              <div className="flex flex-col">
                <BlockTranslatableFields
                  block={block}
                  activeLocale={activeLocale}
                  locales={tenant.locales as string[]}
                  defaultLocale={tenant.defaultLocale}
                />
                <div className="p-3 sm:p-4">
                  <CollectionManager
                    tenant={tenant}
                    activeLocale={activeLocale}
                    initialEntities={initialEntities}
                    blockType={block.type}
                    blockId={block.id}
                    blockConfig={blockConfig}
                    translations={translations}
                  />
                </div>
              </div>
            ) : (
              <BlockEditForm
                block={block}
                tenant={tenant}
                activeLocale={activeLocale}
                translations={translations}
                onSuccess={() => setIsExpanded(false)}
              />
            )}
          </div>

          {isTranslating && (
            <div className="absolute inset-0 bg-background/60 flex items-center justify-center z-10">
              <Spinner className="size-6" />
            </div>
          )}
        </div>
      </BlockExpandedArea>
    </div>
  );
}
