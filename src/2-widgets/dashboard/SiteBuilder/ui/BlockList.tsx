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
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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
  ArrowRightCircle,
  FileText,
  GripVertical,
  Images,
  Mail,
  MapPin,
  Mic2,
  Newspaper,
  Sparkles,
  Trophy,
  XIcon,
  type LucideIcon,
  Copyright,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BlockCard } from "./BlockCard";

// ── Block picker data ──────────────────────────────────────────────────────

const BLOCK_PICKER_ITEMS: {
  kind: BlockKind;
  icon: LucideIcon;
  name: string;
  description: string;
}[] = [
  {
    kind: "hero",         icon: Sparkles,         name: "Hero Section",
    description: "Headline, subtitle, and primary call-to-action",
  },
  {
    kind: "blog-feed",    icon: Newspaper,        name: "Blog Feed",
    description: "Blog posts displayed in a grid layout",
  },
  {
    kind: "podcast-feed", icon: Mic2,             name: "Podcast Feed",
    description: "Podcast episodes with cover art and descriptions",
  },
  {
    kind: "awards",       icon: Trophy,           name: "Awards",
    description: "Awards, certifications, or recognitions",
  },
  {
    kind: "contact",      icon: Mail,             name: "Contact Section",
    description: "Email, phone, address, and optional contact form",
  },
  {
    kind: "cta-banner",   icon: ArrowRightCircle, name: "CTA Banner",
    description: "Call-to-action with heading, text, and button",
  },
  {
    kind: "text-content", icon: FileText,         name: "Text Content",
    description: "Freeform prose — about us, policies, or text-only",
  },
  {
    kind: "image-gallery",icon: Images,           name: "Image Gallery",
    description: "Visual image gallery with lightbox viewing",
  },
  {
    kind: "map",           icon: MapPin,           name: "Location",
    description: "Map with address and embedded Google Maps view",
  },
  {
    kind: "footer",        icon: Copyright,        name: "Footer",
    description: "Copyright, social links, and powered-by branding",
  },
];

const CATEGORY_MAP: Record<string, string> = {
  hero: "structure",
  "blog-feed": "content",
  "podcast-feed": "content",
  awards: "content",
  "text-content": "content",
  "image-gallery": "media",
  contact: "interactive",
  "cta-banner": "interactive",
  map: "interactive",
  footer: "structure",
};

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "structure", label: "Structure" },
  { id: "content", label: "Content" },
  { id: "media", label: "Media" },
  { id: "interactive", label: "Interactive" },
] as const;

// ── Selectable picker card ─────────────────────────────────────────────────

function PickerCard({
  item,
  isSelected,
  onToggle,
}: {
  item: (typeof BLOCK_PICKER_ITEMS)[number];
  isSelected: boolean;
  onToggle: () => void;
}) {
  const Icon = item.icon;

  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-all cursor-pointer",
        "hover:border-primary/50 hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0",
        isSelected
          ? "ring-2 ring-primary border-primary bg-primary/5"
          : "border-border/60 bg-card",
      )}
    >
      <div className="flex items-center gap-3 w-full">
        <span className="rounded-lg bg-primary/10 p-2.5 shrink-0">
          <Icon className="h-5 w-5 text-primary" />
        </span>
        <span className="font-semibold text-sm text-foreground flex-1">
          {item.name}
        </span>
        {isSelected && (
          <span className="text-primary shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
            </svg>
          </span>
        )}
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed pl-1">
        {item.description}
      </p>
    </button>
  );
}

// ── Main BlockList ─────────────────────────────────────────────────────────

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
  plan?: string;
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
  plan,
}: BlockListProps) {
  const [selectedKinds, setSelectedKinds] = useState<Set<BlockKind>>(new Set());
  const [category, setCategory] = useState<string>("all");
  const [orderedBlocks, setOrderedBlocks] = useState<Block[]>(blocks);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    setOrderedBlocks(blocks);
  }, [blocks]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor),
  );

  // ── Sortable drag handlers ─────────────────────────────────────────────

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

  // ── Multi-select ─────────────────────────────────────────────────────

  const toggleKind = useCallback((kind: BlockKind) => {
    setSelectedKinds((prev) => {
      const next = new Set(prev);
      if (next.has(kind)) next.delete(kind);
      else next.add(kind);
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => setSelectedKinds(new Set()), []);

  const handleBatchAdd = useCallback(async () => {
    if (selectedKinds.size === 0) return;
    for (const kind of selectedKinds) {
      await addBlock(tenantId, kind);
    }
    clearSelection();
  }, [selectedKinds, tenantId, clearSelection]);

  // ── Filtering ────────────────────────────────────────────────────────

  const filteredItems = useMemo(
    () =>
      category === "all"
        ? BLOCK_PICKER_ITEMS
        : BLOCK_PICKER_ITEMS.filter((i) => CATEGORY_MAP[i.kind] === category),
    [category],
  );

  // ── Active sortable item preview ──────────────────────────────────────

  const activeBlock = activeId
    ? orderedBlocks.find((b) => b.id === activeId) ?? null
    : null;

  // ── Translations ─────────────────────────────────────────────────────

  const emptyState = resolveTranslation(translations, "empty", "No blocks yet. Add your first block below.");
  const addBlockLabel = resolveTranslation(translations, "add", "+ Add Block");
  const addDialogTitle = resolveTranslation(translations, "add-dialog.title", "Add Blocks");
  const batchAddLabel = resolveTranslation(translations, "add-dialog.add-n", "Add {count} Block(s)", { count: selectedKinds.size });
  const selectHint = resolveTranslation(translations, "add-dialog.hint-selected", "{count} selected — add below", { count: selectedKinds.size });
  const mobileHint = selectedKinds.size > 0
    ? resolveTranslation(translations, "add-dialog.hint-mobile-selected", "{count} selected", { count: selectedKinds.size })
    : resolveTranslation(translations, "add-dialog.hint-mobile-empty", "Tap to select blocks");

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
            <div key={block.id}>
              <BlockCard
                block={block}
                tenantId={tenantId}
                tenant={tenant}
                activeLocale={activeLocale}
                initialEntities={initialEntities}
                userRole={userRole}
                translations={translations}
                onLocaleChange={onLocaleChange}
                plan={plan}
              />
            </div>
          ))}
        </SortableContext>

        {/* ── Drag overlay ──────────────────────────────────────────────── */}
        <DragOverlay>
          {activeBlock ? (
            <div className="flex items-center gap-2 p-3 sm:p-4 bg-card rounded-xl border-2 border-primary shadow-lg opacity-90">
              <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
              <Badge variant="secondary" className="font-mono text-xs shrink-0">
                {activeBlock.type}
              </Badge>
            </div>
          ) : null}
        </DragOverlay>

        {/* ── Add Block Sheet ─────────────────────────────────────────── */}
        {userRole === "owner" && (
          <Sheet onOpenChange={(open) => { if (!open) clearSelection(); }}>
            <SheetTrigger asChild>
              <Button tenantVariant="outline" className="mt-2">
                {addBlockLabel}
              </Button>
            </SheetTrigger>
            <SheetContent
              side="bottom"
              className="min-h-[100dvh] max-h-[100dvh] overflow-hidden p-0 flex flex-col"
              showCloseButton={false}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-6 pb-2 shrink-0">
                <SheetTitle className="text-xl font-bold text-foreground">
                  {addDialogTitle}
                </SheetTitle>
                <SheetClose asChild>
                  <button
                    type="button"
                    className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                  >
                    <XIcon className="h-5 w-5" />
                  </button>
                </SheetClose>
              </div>

              {/* Category pills */}
              <div className="flex gap-2 px-6 pb-4 shrink-0 overflow-x-auto">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={cn(
                      "px-3.5 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors cursor-pointer",
                      category === cat.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                    )}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Block grid */}
              <div className="flex-1 overflow-y-auto px-6 pb-4">
                {category === "all" ? (
                  CATEGORIES.filter((c) => c.id !== "all").map((cat) => {
                    const catItems = BLOCK_PICKER_ITEMS.filter(
                      (i) => CATEGORY_MAP[i.kind] === cat.id,
                    );
                    if (catItems.length === 0) return null;
                    return (
                      <div key={cat.id} className="mb-6">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                          {cat.label}
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                          {catItems.map((item) => (
                            <PickerCard
                              key={item.kind}
                              item={item}
                              isSelected={selectedKinds.has(item.kind)}
                              onToggle={() => toggleKind(item.kind)}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {filteredItems.map((item) => (
                      <PickerCard
                        key={item.kind}
                        item={item}
                        isSelected={selectedKinds.has(item.kind)}
                        onToggle={() => toggleKind(item.kind)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom bar */}
              <div className="shrink-0 border-t border-border bg-popover px-6 py-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm text-muted-foreground hidden sm:block">
                    {selectHint}
                  </p>
                  <p className="text-sm text-muted-foreground sm:hidden">
                    {mobileHint}
                  </p>
                  <SheetClose asChild>
                    <Button
                      tenantVariant="default"
                      disabled={selectedKinds.size === 0}
                      onClick={handleBatchAdd}
                    >
                      {batchAddLabel}
                    </Button>
                  </SheetClose>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        )}
      </DndContext>

      {orderedBlocks.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">
          {emptyState}
        </p>
      )}
    </div>
  );
}
