"use client";

import {
  deleteBlock,
  toggleBlockVisibility,
} from "@/3-features/manage-site-blocks";
import type {
  Block,
  Tenant,
  TenantEntity,
  TenantTranslation,
} from "@/5-shared/lib/db/schema";
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
import { useSortable } from "@dnd-kit/sortable";
import { GripVertical } from "lucide-react";
import { useState, useTransition } from "react";
import { BlockEditForm } from "./BlockEditForm";
import { BlockExpandedArea } from "./BlockExpandedArea";
import { CollectionManager } from "./CollectionManager";
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
  userRole?: "owner" | "editor" | null;
  translations?: TranslationDict;
}

export function BlockCard({
  block,
  tenantId,
  tenant,
  activeLocale,
  initialEntities,
  userRole,
  translations,
}: BlockCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isCollectionBlock = [
    "blog-feed",
    "podcast-feed",
    "awards",
    "image-gallery",
  ].includes(block.type);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: block.id,
    disabled: userRole !== "owner",
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
          {userRole === "owner" && (
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
          <Badge variant="secondary" className="font-mono text-xs shrink-0">
            {block.type}
          </Badge>
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
          {userRole === "owner" && (
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
          )}
        </div>
      </div>

      {/* ── Expanded inline editor ──────────────────────────────────── */}
      <BlockExpandedArea isExpanded={isExpanded}>
        <div className="border-t border-border">
          {block.type === "image-gallery" ? (
            <div className="p-3 sm:p-4">
              <GalleryManager
                blockId={block.id}
                tenant={tenant}
                activeLocale={activeLocale}
                onImagesChange={() => {}}
              />
            </div>
          ) : isCollectionBlock ? (
            <div className="p-3 sm:p-4">
              <CollectionManager
                tenant={tenant}
                activeLocale={activeLocale}
                initialEntities={initialEntities}
                blockType={block.type}
                blockId={block.id}
                translations={translations}
              />
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
      </BlockExpandedArea>
    </div>
  );
}
