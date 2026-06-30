"use client";

import {
  deleteGalleryImage,
  getGalleryImages,
  reorderGalleryImages,
  saveGalleryCaptions,
  updateBlockConfig,
} from "@/3-features/manage-site-blocks";
import { Tenant } from "@/5-shared/lib/db/schema";
import { toast } from "@/5-shared/lib/ui/toast";
import { SupportedLocaleType } from "@/5-shared/types";
import { GalleryImage } from "@/5-shared/types/tenants/blocks";
import { Button, Input, Label, Separator, Spinner } from "@/components/ui";

import { DndContext } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable } from "@dnd-kit/sortable";
import { useEffect, useRef, useState } from "react";

interface GalleryManagerProps {
  blockId: string;
  tenant: Tenant;
  activeLocale: SupportedLocaleType;
  onImagesChange: (images: GalleryImage[]) => void;
}

export function GalleryManager({ blockId, tenant, activeLocale, onImagesChange }: GalleryManagerProps) {
  const [loading, setLoading] = useState(true);
  const [galleryName, setGalleryName] = useState("");
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingCaptions, setPendingCaptions] = useState<Record<string, string>>({});
  const galleryNameTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  function applyImages(next: GalleryImage[]) {
    setImages(next);
    onImagesChange(next);
  }

  // Load images from the tables (source of truth) + gallery name from config.
  useEffect(() => {
    setLoading(true);
    Promise.all([
      getGalleryImages(blockId, tenant.id),
      fetch(`/api/blocks/${blockId}`).then((r) => r.json()).catch(() => ({})),
    ])
      .then(([imgs, data]) => {
        applyImages(imgs);
        setGalleryName((data?.block?.config?.galleryName as string) ?? "");
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockId, tenant.id]);

  if (loading) return <div className="text-sm text-muted-foreground">Loading gallery…</div>;

  async function handleDragEnd(event: any) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = images.findIndex((img) => img.s3Key === active.id);
    const newIndex = images.findIndex((img) => img.s3Key === over.id);
    const next = arrayMove(images, oldIndex, newIndex);
    applyImages(next); // optimistic
    try {
      const result = await reorderGalleryImages(blockId, tenant.id, next.map((i) => i.s3Key));
      applyImages(result);
    } catch {
      toast({ title: "Could not save the new order.", status: "error" });
    }
  }

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > 5 * 1024 * 1024) {
          toast({ title: `${file.name} is too large (max 5MB).`, status: "error" });
          continue;
        }
        const form = new FormData();
        form.append("file", file);
        form.append("lang", activeLocale);
        form.append("blockId", blockId);
        form.append("tenantId", tenant.id);
        const res = await fetch("/api/gallery/upload", { method: "POST", body: form });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          toast({ title: err.error || `Failed to upload ${file.name}`, status: "error" });
          continue;
        }
        toast({ title: `Image added.`, status: "success" });
      }
      // Refresh from the table so urls/meta/i18n are authoritative.
      const refreshed = await getGalleryImages(blockId, tenant.id);
      applyImages(refreshed);
    } catch (err: any) {
      toast({ title: err?.message || "Upload failed.", status: "error" });
    } finally {
      setIsUploading(false);
    }
  }

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setGalleryName(value);
    if (galleryNameTimer.current) clearTimeout(galleryNameTimer.current);
    galleryNameTimer.current = setTimeout(() => {
      updateBlockConfig(blockId, tenant.id, { galleryName: value, images }).catch(() => {});
    }, 600);
  }

  async function handleRemoveImage(s3Key: string) {
    try {
      const result = await deleteGalleryImage(blockId, tenant.id, s3Key);
      applyImages(result);
      toast({ title: "Image removed.", status: "success" });
    } catch (e: any) {
      toast({ title: e?.message || "Failed to delete image.", status: "error" });
    }
  }

  function handleCaptionChange(s3Key: string, value: string) {
    setPendingCaptions((prev) => ({ ...prev, [s3Key]: value }));
  }

  async function handleSaveCaptions() {
    setIsSaving(true);
    try {
      const payload = images.map((img) => ({
        s3Key: img.s3Key,
        caption: pendingCaptions[img.s3Key] ?? img.i18n?.[activeLocale]?.caption ?? "",
      }));
      const result = await saveGalleryCaptions(blockId, tenant.id, activeLocale, payload);
      applyImages(result);
      setPendingCaptions({});
      toast({ title: "Captions saved and translated.", status: "success" });
    } catch (err: any) {
      toast({ title: err?.message || "Failed to save captions.", status: "error" });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 relative">
      {isUploading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/70 backdrop-blur-sm rounded-lg">
          <div className="flex flex-col items-center gap-2">
            <Spinner className="size-8 text-primary" />
            <span className="text-sm text-muted-foreground font-medium mt-2">Uploading image…</span>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="gallery-name">Gallery Name</Label>
        <Input id="gallery-name" value={galleryName} onChange={handleNameChange} maxLength={64} />
      </div>

      <Separator />

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label>Images ({images.length}/11)</Label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            disabled={images.length >= 11 || isUploading}
            onChange={(e) => handleUpload(e.target.files)}
            style={{ display: "none" }}
            id="gallery-upload-input"
          />
          <label htmlFor="gallery-upload-input">
            <Button asChild disabled={images.length >= 11 || isUploading}>
              <span>Add Images</span>
            </Button>
          </label>
        </div>

        <DndContext onDragEnd={handleDragEnd}>
          <SortableContext items={images.map((img) => img.s3Key)}>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
              {images.map((img) => (
                <GalleryImageCard
                  key={img.s3Key}
                  img={img}
                  lang={activeLocale}
                  onRemove={() => handleRemoveImage(img.s3Key)}
                  onCaptionChange={handleCaptionChange}
                  captionValue={pendingCaptions[img.s3Key] ?? img.i18n?.[activeLocale]?.caption ?? ""}
                  disabled={isUploading}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {images.length > 0 && (
          <div className="flex justify-end mt-4">
            <Button onClick={handleSaveCaptions} disabled={isSaving} className="min-w-[140px]">
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <Spinner className="size-4" /> Saving…
                </span>
              ) : (
                "Save Captions"
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

interface GalleryImageCardProps {
  img: GalleryImage;
  lang: string;
  onRemove: () => void;
  onCaptionChange: (s3Key: string, value: string) => void;
  captionValue: string;
  disabled?: boolean;
}

function GalleryImageCard({ img, lang, onRemove, onCaptionChange, captionValue, disabled }: GalleryImageCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: img.s3Key });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        transition,
      }}
      className="relative border border-border rounded-xs p-2 bg-card flex flex-col gap-2 shadow-sm"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={img.url}
        alt={img.i18n?.[lang]?.alt ?? ""}
        className="rounded w-full aspect-video object-cover cursor-move"
        {...attributes}
        {...listeners}
      />
      <Label htmlFor={`caption-${img.s3Key}`} className="text-xs font-medium pl-1">
        Caption
      </Label>
      <Input
        id={`caption-${img.s3Key}`}
        placeholder="Describe your image"
        value={captionValue}
        onChange={(e) => onCaptionChange(img.s3Key, e.target.value)}
        className="text-xs"
        maxLength={160}
        disabled={disabled}
      />
      <Button
        variant="destructive"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="absolute top-2 right-2 hover:cursor-pointer"
        disabled={disabled}
        aria-label="Delete image"
      >
        ✕
      </Button>
    </div>
  );
}
