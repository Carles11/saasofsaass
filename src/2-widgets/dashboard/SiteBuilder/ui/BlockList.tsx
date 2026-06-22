"use client";

import { addBlock, reorderBlocks } from "@/3-features/manage-site-blocks";
import type { Block, Tenant, TenantEntity, TenantTranslation } from "@/5-shared/lib/db/schema";
import type { SupportedLocaleType } from "@/5-shared/types";
import {
  resolveTranslation,
  type TranslationDict,
} from "@/5-shared/lib/translations/resolve";
import { cn } from "@/5-shared/lib/utils";
import type { BlockKind } from "@/5-shared/types/tenants/blocks";
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
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  FileText,
  GripVertical,
  Images,
  Mail,
  Menu,
  Mic2,
  Newspaper,
  Sparkles,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { BlockCard } from "./BlockCard";

const BLOCK_PICKER_ITEMS: {
  kind: BlockKind;
  icon: LucideIcon;
  name: string;
  description: string;
  hint: string;
}[] = [
  {
    kind: "navbar",
    icon: Menu,
    name: "Navigation Bar",
    description: "Top navigation with logo, links, and optional CTA button",
    hint: "Add your site title and configure navigation links",
  },
  {
    kind: "hero",
    icon: Sparkles,
    name: "Hero Section",
    description: "Bold headline, subtitle, and primary call-to-action",
    hint: "Write a compelling headline and upload a background image",
  },
  {
    kind: "blog-feed",
    icon: Newspaper,
    name: "Blog Feed",
    description: "Automatically displays blog posts in a grid layout",
    hint: "Write blog posts in the Content tab to populate this section",
  },
  {
    kind: "podcast-feed",
    icon: Mic2,
    name: "Podcast Feed",
    description: "Showcases podcast episodes with cover art and descriptions",
    hint: "Add podcast episodes in the Content tab",
  },
  {
    kind: "awards",
    icon: Trophy,
    name: "Awards",
    description: "Displays a list of awards, certifications, or recognitions",
    hint: "Add your awards in the Content tab",
  },
  {
    kind: "contact",
    icon: Mail,
    name: "Contact Section",
    description:
      "Contact information with email, phone, address, and optional form",
    hint: "Add your contact details and set up email forwarding",
  },
  {
    kind: "text-content",
    icon: FileText,
    name: "Text Content",
    description: "Freeform prose section — about us, policies, or any text-only content",
    hint: "Write your content with optional heading and body text",
  },
  {
    kind: "image-gallery",
    icon: Images,
    name: "Image Gallery",
    description: "Visual image gallery with lightbox viewing",
    hint: "Upload images and add captions in the Gallery tab",
  },
];

const ALL_BLOCK_KINDS: BlockKind[] = BLOCK_PICKER_ITEMS.map(
  (item) => item.kind,
);

type EntityRow = { entity: TenantEntity; translation: TenantTranslation | null };

interface BlockListProps {
  blocks: Block[];
  tenantId: string;
  tenant: Tenant;
  activeLocale: SupportedLocaleType;
  initialEntities: EntityRow[];
  userRole?: "owner" | "editor" | null;
  translations?: TranslationDict;
  onLocaleChange?: (locale: SupportedLocaleType) => void;
}

export function BlockList({
  blocks,
  tenantId,
  tenant,
  activeLocale,
  initialEntities,
  userRole,
  translations,
  onLocaleChange,
}: BlockListProps) {
  const [newKind, setNewKind] = useState<BlockKind>(ALL_BLOCK_KINDS[0]);
  const [orderedBlocks, setOrderedBlocks] = useState<Block[]>(blocks);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Sync local order when blocks prop changes (e.g. after add/delete)
  useEffect(() => {
    setOrderedBlocks(blocks);
  }, [blocks]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor),
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);

      if (!over || active.id === over.id) return;

      const oldIndex = orderedBlocks.findIndex((b) => b.id === active.id);
      const newIndex = orderedBlocks.findIndex((b) => b.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;

      const reordered = arrayMove(orderedBlocks, oldIndex, newIndex);
      setOrderedBlocks(reordered);
      await reorderBlocks(
        tenantId,
        reordered.map((b) => b.id),
      );
    },
    [orderedBlocks, tenantId],
  );

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
  }, []);

  const selectedItem = BLOCK_PICKER_ITEMS.find((item) => item.kind === newKind);
  const activeBlock = activeId
    ? (orderedBlocks.find((b) => b.id === activeId) ?? null)
    : null;

  const emptyState = resolveTranslation(
    translations,
    "empty",
    "No blocks yet. Add your first block below.",
  );
  const addBlockLabel = resolveTranslation(translations, "add", "+ Add Block");
  const addDialogTitle = resolveTranslation(
    translations,
    "add-dialog.title",
    "Add a New Block",
  );
  const addDialogConfirm = resolveTranslation(
    translations,
    "add-dialog.confirm",
    'Add "{name}"',
    { name: selectedItem?.name ?? newKind },
  );

  return (
    <div className="flex flex-col gap-3 w-full">
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SortableContext
          items={orderedBlocks.map((b) => b.id)}
          strategy={verticalListSortingStrategy}
        >
          {orderedBlocks.map((block) => (
            <BlockCard
              key={block.id}
              block={block}
              tenantId={tenantId}
              tenant={tenant}
              activeLocale={activeLocale}
              initialEntities={initialEntities}
              userRole={userRole}
              translations={translations}
              onLocaleChange={onLocaleChange}
            />
          ))}
        </SortableContext>

        <DragOverlay>
          {activeBlock && (
            <div className="flex items-center gap-2 p-3 sm:p-4 bg-card rounded-xl border-2 border-primary shadow-lg opacity-90">
              <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
              <Badge variant="secondary" className="font-mono text-xs shrink-0">
                {activeBlock.type}
              </Badge>
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {orderedBlocks.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">
          {emptyState}
        </p>
      )}

      {userRole === "owner" && (
        <Dialog>
          <DialogTrigger asChild>
            <Button tenantVariant="outline" className="mt-2">
              {addBlockLabel}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{addDialogTitle}</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[340px] overflow-y-auto pr-1">
                {BLOCK_PICKER_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isSelected = newKind === item.kind;
                  return (
                    <button
                      key={item.kind}
                      type="button"
                      onClick={() => setNewKind(item.kind)}
                      className={cn(
                        "flex flex-col items-start gap-2 rounded-xl border p-3.5 text-left transition-all cursor-pointer",
                        isSelected
                          ? "ring-2 ring-primary border-primary bg-muted/20"
                          : "border-border/60 bg-card hover:border-primary/40 hover:bg-muted/30",
                      )}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <span className="rounded-lg bg-primary/10 p-2.5 shrink-0">
                          <Icon className="h-5 w-5 text-primary" />
                        </span>
                        <span className="font-medium text-sm text-foreground">
                          {item.name}
                        </span>
                        {isSelected && (
                          <span className="ml-auto text-primary shrink-0">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              className="h-5 w-5"
                            >
                              <path
                                fillRule="evenodd"
                                d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {item.description}
                      </p>
                      <p className="text-xs text-muted-foreground/60 mt-0.5 italic">
                        {item.hint}
                      </p>
                    </button>
                  );
                })}
              </div>
              <DialogClose asChild>
                <Button
                  onClick={() => addBlock(tenantId, newKind)}
                  className="w-full"
                  disabled={!selectedItem}
                >
                  {addDialogConfirm}
                </Button>
              </DialogClose>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
