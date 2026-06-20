"use client";

import { getCloudFrontUrl } from "@/5-shared/lib/aws/cloudfront";
import type { GalleryImage } from "@/5-shared/types/tenants/blocks";

interface GridViewProps {
  images: GalleryImage[];
  lang: string;
  onImageClick: (index: number) => void;
}

export function GridView({ images, lang, onImageClick }: GridViewProps) {
  if (!images.length) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {images.map((img, idx) => {
        const caption = img.i18n?.[lang]?.caption;
        return (
          <button
            key={img.s3Key}
            type="button"
            onClick={() => onImageClick(idx)}
            className="group text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 rounded-lg overflow-hidden border border-border bg-card transition-shadow hover:shadow-md"
          >
            <div className="aspect-[4/3] overflow-hidden">
              <img
                src={getCloudFrontUrl(img.s3Key)}
                alt={img.i18n?.[lang]?.alt ?? ""}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            {caption && (
              <p className="px-2 py-1.5 text-xs text-muted-foreground line-clamp-2 leading-tight">
                {caption}
              </p>
            )}
          </button>
        );
      })}
    </div>
  );
}
