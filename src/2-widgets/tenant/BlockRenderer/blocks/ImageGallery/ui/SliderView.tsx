"use client";

import { getCloudFrontUrl } from "@/5-shared/lib/aws/cloudfront";
import type { GalleryImage } from "@/5-shared/types/tenants/blocks";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";

interface SliderViewProps {
  images: GalleryImage[];
  lang: string;
  onImageClick: (index: number) => void;
}

export function SliderView({ images, lang, onImageClick }: SliderViewProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start", loop: false });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    onSelect();
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  if (!images.length) return null;

  return (
    <div className="relative group">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex -ml-4">
          {images.map((img, idx) => {
            const caption = img.i18n?.[lang]?.caption;
            return (
              <div
                key={img.s3Key}
                className="min-w-0 flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] pl-4"
              >
                <button
                  type="button"
                  onClick={() => onImageClick(idx)}
                  className="group text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 rounded-lg overflow-hidden border border-border bg-card transition-shadow hover:shadow-md w-full"
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
              </div>
            );
          })}
        </div>
      </div>

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            className="absolute left-1 top-1/2 -translate-y-1/2 z-10 size-8 flex items-center justify-center rounded-full bg-background/80 text-foreground shadow-sm border border-border opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Previous image"
          >
            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            type="button"
            onClick={scrollNext}
            disabled={!canScrollNext}
            className="absolute right-1 top-1/2 -translate-y-1/2 z-10 size-8 flex items-center justify-center rounded-full bg-background/80 text-foreground shadow-sm border border-border opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Next image"
          >
            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div className="flex justify-center gap-1.5 mt-3">
            {scrollSnaps.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => emblaApi?.scrollTo(idx)}
                className={`size-1.5 rounded-full transition-all ${
                  idx === selectedIndex
                    ? "bg-foreground w-4"
                    : "bg-muted-foreground/40 hover:bg-muted-foreground/60"
                }`}
                aria-label={`Go to image ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
