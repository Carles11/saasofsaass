"use client";

import { getCloudFrontUrl } from "@/5-shared/lib/aws/cloudfront";
import type { GalleryImage } from "@/5-shared/types/tenants/blocks";
import { LayoutGrid, GalleryHorizontalEnd } from "lucide-react";
import { useMemo, useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import Captions from "yet-another-react-lightbox/plugins/captions";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";
import { GridView } from "./GridView";
import { SliderView } from "./SliderView";

interface ImageGalleryProps {
  images: GalleryImage[];
  lang: string;
  galleryName?: string;
  blockId?: string;
}

type GalleryMode = "slider" | "grid";

export function ImageGallery({ images, lang, galleryName, blockId }: ImageGalleryProps) {
  const [mode, setMode] = useState<GalleryMode>("slider");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const slides = useMemo(
    () =>
      images.map((img) => ({
        src: getCloudFrontUrl(img.s3Key),
        alt: img.i18n?.[lang]?.alt ?? "",
        title: img.i18n?.[lang]?.caption ?? undefined,
        description: img.i18n?.[lang]?.alt ?? undefined,
      })),
    [images, lang],
  );

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  if (!images.length) return null;

  return (
    <section id={blockId} className="py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          {galleryName && (
            <h2 className="text-2xl font-bold text-foreground">{galleryName}</h2>
          )}
          {images.length > 1 && (
            <div className="flex items-center gap-1 ml-auto border border-border rounded-lg p-0.5 bg-muted/30">
              <button
                type="button"
                onClick={() => setMode("slider")}
                className={`p-1.5 rounded-md transition-colors ${
                  mode === "slider"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                aria-label="Slider view"
              >
                <GalleryHorizontalEnd className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => setMode("grid")}
                className={`p-1.5 rounded-md transition-colors ${
                  mode === "grid"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                aria-label="Grid view"
              >
                <LayoutGrid className="size-4" />
              </button>
            </div>
          )}
        </div>

        {mode === "slider" ? (
          <SliderView images={images} lang={lang} onImageClick={openLightbox} />
        ) : (
          <GridView images={images} lang={lang} onImageClick={openLightbox} />
        )}

        <Lightbox
          open={lightboxOpen}
          close={() => setLightboxOpen(false)}
          slides={slides}
          index={lightboxIndex}
          plugins={[Captions]}
          captions={{ showToggle: true, descriptionTextAlign: "start" }}
        />
      </div>
    </section>
  );
}
