"use client";

import { updateBlockConfig } from "@/3-features/manage-site-blocks/actions/blockActions";
import { getCloudFrontUrl } from "@/5-shared/lib/aws/cloudfront";
import { Block, Tenant } from "@/5-shared/lib/db/schema";
import { toast } from "@/5-shared/lib/ui/toast";
import { SupportedLocaleType } from "@/5-shared/types";
import { GalleryImage } from "@/5-shared/types/tenants/blocks";
import { Button, Input, Label, Separator, Spinner } from "@/components/ui";

import { DndContext } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable } from "@dnd-kit/sortable";
import { useState } from "react";

// Placeholder for upload and update actions
// import { uploadGalleryImages, updateGalleryConfig } from "@/3-features/manage-site-blocks";

import { useEffect } from "react";

interface GalleryManagerProps {
  blockId: string;
  tenant: Tenant;
  activeLocale: SupportedLocaleType;
  onImagesChange: (images: GalleryImage[]) => void;
}

export function GalleryManager({
  blockId,
  tenant,
  activeLocale,
  onImagesChange,
}: GalleryManagerProps) {
  const [block, setBlock] = useState<Block | null>(null);
  const [loading, setLoading] = useState(true);
  const [galleryName, setGalleryName] = useState("");
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingCaptions, setPendingCaptions] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/blocks/${blockId}`)
      .then((res) => res.json())
      .then((data) => {
        setBlock(data.block);
        const config = (data.block?.config ?? {}) as {
          galleryName?: string;
          images?: GalleryImage[];
        };
        setGalleryName(config.galleryName ?? "");
        setImages(config.images ?? []);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockId]);

  if (loading) return <div>Loading gallery...</div>;
  if (!block) return <div>Block not found.</div>;

  const config = (block.config ?? {}) as { galleryName?: string; images?: GalleryImage[] };

  // Drag-and-drop logic
  async function handleDragEnd(event: any) {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = images.findIndex((img) => img.s3Key === active.id);
      const newIndex = images.findIndex((img) => img.s3Key === over.id);
      const newImages = arrayMove(images, oldIndex, newIndex);
      setImages(newImages);
      onImagesChange(newImages);
      // Persist new order
      if (block) {
        await updateBlockConfig(block.id, tenant.id, { ...config, images: newImages });
      }
    }
  }

  // Upload handler (stub)

  async function handleUpload(files: FileList | null) {
    if (!files) return;
    setIsUploading(true);
    setError(null);
    const newImages: GalleryImage[] = [];
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > 5 * 1024 * 1024) {
          setError(`File ${file.name} is too large (max 5MB).`);
          continue;
        }
        // Prepare form data
        const form = new FormData();
        form.append("file", file);
        form.append("lang", activeLocale);
        if (block) {
          form.append("blockId", block.id);
        }
        // Do NOT send caption by default; only send if user provided one (future: UI input)
        // form.append("caption", file.name.replace(/\.[^/.]+$/, ""));
        // Upload to API
        const res = await fetch("/api/gallery/upload", {
          method: "POST",
          body: form,
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          setError(err.error || `Failed to upload ${file.name}`);
          continue;
        }
        const { image } = await res.json();
        // Compose GalleryImage object for UI
        newImages.push({
          s3Key: image.s3Key,
          meta: image.meta || {},
          i18n: {
            [activeLocale]: {
              alt: file.name.replace(/\.[^/.]+$/, ""),
              caption: "",
            },
          },
        });
        toast({ title: `Image '${file.name}' added to gallery.`, status: "success" });
      }
      if (newImages.length > 0) {
        const allImages = [...images, ...newImages].slice(0, 11);
        setImages(allImages);
        onImagesChange(allImages);
        if (block) {
          await updateBlockConfig(block.id, tenant.id, { ...config, images: allImages });
        }
      }
    } catch (err: any) {
      setError(err?.message || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  }

  // Add image button handler
  function handleAddImages(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    handleUpload(files);
  }

  // Gallery name change
  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setGalleryName(e.target.value);
    // Optionally: debounce and persist
  }

  // Remove image (calls API to delete from S3/DB, then updates UI)
  async function handleRemoveImage(s3Key: string) {
    setError(null);
    try {
      const res = await fetch(`/api/gallery/delete?s3Key=${encodeURIComponent(s3Key)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setError(err.error || "Failed to delete image");
        return;
      }
      const newImages = images.filter((img) => img.s3Key !== s3Key);
      setImages(newImages);
      onImagesChange(newImages);
      // Persist removal in block config
      if (block) {
        await updateBlockConfig(block.id, tenant.id, { ...config, images: newImages });
      }
      toast({ title: "Image removed from gallery.", status: "success" });
    } catch (e) {
      setError("Failed to delete image (network error)");
    }
  }

  // Caption change (local only)
  function handleCaptionChange(idx: number, lang: string, value: string) {
    const img = images[idx];
    setPendingCaptions((prev) => ({ ...prev, [img.s3Key]: value }));
  }

  // Save captions for all images (batch)
  async function handleSaveCaptions() {
    setIsSaving(true);
    setError(null);
    try {
      // POST to new API endpoint (to be implemented) with all captions
      const payload = images.map((img) => ({
        s3Key: img.s3Key,
        caption: pendingCaptions[img.s3Key] ?? "",
      }));
      const res = await fetch("/api/gallery/captions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blockId, captions: payload, locale: activeLocale }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setError(err.error || "Failed to save captions");
        return;
      }
      toast({ title: "Captions saved and translated!", status: "success" });
      // Optionally reload images from server to get translations
      // (Or update local state if backend returns updated images)
    } catch (err: any) {
      setError(err?.message || "Save failed");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 relative">
      {/* Overlay spinner during upload */}
      {isUploading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/70 backdrop-blur-sm rounded-lg">
          <div className="flex flex-col items-center gap-2">
            <Spinner className="size-8 text-blue-600" />
            <span className="text-sm text-blue-700 font-medium mt-2">Uploading image...</span>
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
            onChange={handleAddImages}
            style={{ display: "none" }}
            id="gallery-upload-input"
          />
          <label htmlFor="gallery-upload-input">
            <Button asChild disabled={images.length >= 11 || isUploading}>
              <span>Add Images</span>
            </Button>
          </label>
        </div>
        {error && <div className="text-red-500 text-xs">{error}</div>}
        <DndContext onDragEnd={handleDragEnd}>
          <SortableContext items={images.map((img) => img.s3Key)}>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
              {images.map((img, idx) => (
                <GalleryImageCard
                  key={img.s3Key}
                  img={img}
                  idx={idx}
                  lang={activeLocale}
                  onRemove={() => handleRemoveImage(img.s3Key)}
                  onCaptionChange={handleCaptionChange}
                  captionValue={
                    pendingCaptions[img.s3Key] ?? img.i18n?.[activeLocale]?.caption ?? ""
                  }
                  deleting={isUploading}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
        <div className="flex justify-end mt-4">
          <Button
            onClick={handleSaveCaptions}
            disabled={
              isSaving ||
              images.length === 0 ||
              Object.values(pendingCaptions).some((v) => !v.trim())
            }
            variant="default"
            className={`min-w-[140px] transition-colors duration-150
              ${
                isSaving ||
                images.length === 0 ||
                Object.values(pendingCaptions).some((v) => !v.trim())
                  ? "bg-gray-400 text-blue-400-900 border-gray-200 cursor-not-allowed hover:bg-gray-200 hover:text-gray-400"
                  : ""
              }
            `}
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <Spinner className="size-4" /> Saving...
              </span>
            ) : (
              "Save Captions"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// GalleryImageCard: Sortable image card with alt/caption editing
interface GalleryImageCardProps {
  img: GalleryImage;
  idx: number;
  lang: string;
  onRemove: () => void;
  onCaptionChange: (idx: number, lang: string, value: string) => void;
  captionValue: string;
  deleting?: boolean;
}

function GalleryImageCard({
  img,
  idx,
  lang,
  onRemove,
  onCaptionChange,
  captionValue,
  deleting,
}: GalleryImageCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: img.s3Key,
  });
  const cloudfrontDomain = getCloudFrontUrl(img.s3Key);

  function handleRemoveClick(e: React.MouseEvent) {
    e.stopPropagation();
    onRemove();
  }

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        transition,
      }}
      className="relative border rounded-lg p-2 bg-white flex flex-col gap-2 shadow-sm"
    >
      <img
        src={cloudfrontDomain}
        alt={img.i18n[lang]?.alt ?? ""}
        className="rounded w-full aspect-video object-cover cursor-move"
        {...attributes}
        {...listeners}
      />
      <Label htmlFor={`caption-${img.s3Key}`} className="text-xs font-medium pl-1">
        Image title*
      </Label>
      <Input
        id={`caption-${img.s3Key}`}
        placeholder="Describe your image"
        value={captionValue}
        onChange={(e) => onCaptionChange(idx, lang, e.target.value)}
        className="text-xs"
        maxLength={120}
        required
        disabled={deleting}
      />
      <Button
        variant="destructive"
        size="sm"
        onClick={handleRemoveClick}
        className="absolute top-2 right-2 hover:cursor-pointer"
        disabled={deleting}
        aria-disabled={deleting}
        aria-busy={deleting}
        aria-label={deleting ? "Deleting image" : "Delete image"}
      >
        ✕
      </Button>
    </div>
  );
}
