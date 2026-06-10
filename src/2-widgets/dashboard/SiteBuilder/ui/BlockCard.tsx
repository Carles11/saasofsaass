"use client";

import { deleteBlock, reorderBlock, toggleBlockVisibility } from "@/3-features/manage-site-blocks";
import type { Block } from "@/5-shared/lib/db/schema";
import { resolveTranslation, type TranslationDict } from "@/5-shared/lib/translations/resolve";
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
import { useTransition } from "react";

interface BlockCardProps {
  block: Block;
  tenantId: string;
  isFirst: boolean;
  isLast: boolean;
  onEdit: (blockId: string) => void;
  setActiveTab?: (tab: string) => void;
  userRole?: "owner" | "editor" | null;
  translations?: TranslationDict;
}

export function BlockCard({
  block,
  tenantId,
  isFirst,
  isLast,
  onEdit,
  setActiveTab,
  userRole,
  translations,
}: BlockCardProps) {
  const [isPending, startTransition] = useTransition();

  const hiddenLabel = resolveTranslation(translations, "status.hidden", "hidden");
  const manageContentLabel = resolveTranslation(
    translations,
    "action.manage-content",
    "Manage Content",
  );
  const editLabel = resolveTranslation(translations, "action.edit", "Edit");
  const deleteLabel = resolveTranslation(translations, "action.delete", "Delete");
  const deleteTitle = resolveTranslation(
    translations,
    "delete-confirm.title",
    "Delete \"{name}\" block?",
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
      className={`flex items-center justify-between p-4 bg-card rounded-xl border border-border transition-opacity ${
        isPending ? "opacity-50 pointer-events-none" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        <Badge variant="secondary" className="font-mono text-xs">
          {block.type}
        </Badge>
        {!block.isVisible && <span className="text-xs text-muted-foreground italic">{hiddenLabel}</span>}
      </div>

      <div className="flex items-center gap-1">
        {/* Visibility toggle */}
        <Button
          tenantVariant="ghost"
          size="sm"
          disabled={isPending}
          aria-label="Toggle visibility"
          onClick={() =>
            startTransition(() => toggleBlockVisibility(block.id, tenantId, block.isVisible))
          }
        >
          {block.isVisible ? "👁" : "🙈"}
        </Button>

        {/* Reorder up — owner only */}
        {userRole === "owner" && !isFirst && (
          <Button
            tenantVariant="ghost"
            size="sm"
            disabled={isPending}
            aria-label="Move up"
            onClick={() => startTransition(() => reorderBlock(tenantId, block.id, "up"))}
          >
            ↑
          </Button>
        )}

        {/* Reorder down — owner only */}
        {userRole === "owner" && !isLast && (
          <Button
            tenantVariant="ghost"
            size="sm"
            disabled={isPending}
            aria-label="Move down"
            onClick={() => startTransition(() => reorderBlock(tenantId, block.id, "down"))}
          >
            ↓
          </Button>
        )}

        {/* Manage Content for collection blocks */}
        {block.type === "blog-feed" ||
        block.type === "awards" ||
        block.type === "image-gallery" ||
        block.type === "podcast-feed" ? (
          <Button
            tenantVariant="default"
            size="sm"
            onClick={() => {
              onEdit(block.id);
              if (setActiveTab) setActiveTab("content");
            }}
          >
            {manageContentLabel}
          </Button>
        ) : (
          <Button
            tenantVariant="outline"
            size="sm"
            disabled={isPending}
            onClick={() => onEdit(block.id)}
          >
            {editLabel}
          </Button>
        )}

        {/* Delete — owner only */}
        {userRole === "owner" && (
          <Dialog>
            <DialogTrigger asChild>
              <Button tenantVariant="destructive" size="sm" disabled={isPending}>
                {deleteLabel}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{deleteTitle}</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-muted-foreground mb-4">{deleteWarning}</p>
              <div className="flex gap-2 justify-end">
                <DialogClose asChild>
                  <Button tenantVariant="outline">{cancelLabel}</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button
                    tenantVariant="destructive"
                    onClick={() => startTransition(() => deleteBlock(block.id, tenantId))}
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
  );
}
