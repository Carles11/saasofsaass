"use client";

import { updateBlockConfig } from "@/3-features/manage-site-blocks/actions/blockActions";
import { Block, Tenant } from "@/5-shared/lib/db/schema";
import { SupportedLocaleType } from "@/5-shared/types";
import { GalleryImage } from "@/5-shared/types/tenants/blocks";
import { Button } from "@/components/tenant/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
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

  useEffect(() => {
    console.log("GalleryManager blockId:", blockId);
    setLoading(true);
    fetch(`/api/blocks/${blockId}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("GalleryManager data:", data);
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
        form.append("alt", file.name.replace(/\.[^/.]+$/, ""));
        if (block) {
          form.append("blockId", block.id);
        }
        // Use filename (without extension) as default caption for SEO
        form.append("caption", file.name.replace(/\.[^/.]+$/, ""));
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

  // Remove image
  async function handleRemoveImage(s3Key: string) {
    const newImages = images.filter((img) => img.s3Key !== s3Key);
    setImages(newImages);
    onImagesChange(newImages);
    // Persist removal
    if (block) {
      await updateBlockConfig(block.id, tenant.id, { ...config, images: newImages });
    }
  }

  // Alt/caption change
  async function handleImageMetaChange(
    idx: number,
    lang: string,
    field: "alt" | "caption",
    value: string
  ) {
    const newImages = [...images];
    if (!newImages[idx].i18n[lang]) newImages[idx].i18n[lang] = { alt: "", caption: "" };
    // If editing caption and alt is empty, auto-generate alt from caption
    if (field === "caption") {
      newImages[idx].i18n[lang]["caption"] = value;
      if (!newImages[idx].i18n[lang]["alt"]) {
        newImages[idx].i18n[lang]["alt"] = value;
      }
    } else {
      newImages[idx].i18n[lang][field] = value;
    }
    // Enforce alt is always non-empty for SEO
    if (!newImages[idx].i18n[lang]["alt"]) {
      newImages[idx].i18n[lang]["alt"] = newImages[idx].i18n[lang]["caption"] || "Image";
    }
    setImages(newImages);
    onImagesChange(newImages);
    // Persist alt/caption change
    if (block) {
      await updateBlockConfig(block.id, tenant.id, { ...config, images: newImages });
    }
  }

  return (
    <div className="flex flex-col gap-6">
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
                  onMetaChange={handleImageMetaChange}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}

// GalleryImageCard: Sortable image card with alt/caption editing
function GalleryImageCard({
  img,
  idx,
  lang,
  onRemove,
  onMetaChange,
}: {
  img: GalleryImage;
  idx: number;
  lang: string;
  onRemove: () => void;
  onMetaChange: (idx: number, lang: string, field: "alt" | "caption", value: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: img.s3Key,
  });
  const cloudfrontDomain = "https://dxkr25c81be58.cloudfront.net";

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        transition,
      }}
      className="relative border rounded-lg p-2 bg-white flex flex-col gap-2 shadow-sm"
      {...attributes}
      {...listeners}
    >
      <img
        src={`${cloudfrontDomain}/${img.s3Key}`}
        alt={img.i18n[lang]?.alt ?? ""}
        className="rounded w-full aspect-video object-cover"
      />
      <Input
        placeholder="Alt text (required)"
        value={img.i18n[lang]?.alt ?? ""}
        onChange={(e) => onMetaChange(idx, lang, "alt", e.target.value)}
        className="text-xs"
        maxLength={120}
        required
      />
      <Input
        placeholder="Caption"
        value={img.i18n[lang]?.caption ?? ""}
        onChange={(e) => onMetaChange(idx, lang, "caption", e.target.value)}
        className="text-xs"
        maxLength={120}
      />
      <Button variant="destructive" size="sm" onClick={onRemove} className="absolute top-2 right-2">
        ✕
      </Button>
    </div>
  );
}
