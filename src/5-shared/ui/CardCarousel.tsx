"use client";

import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";

/**
 * Horizontal carousel for server-rendered cards (blog/podcast/awards feeds).
 * Children are wrapped as slides; works with any card markup.
 */
export function CardCarousel({ children }: { children: React.ReactNode }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start", loop: false, containScroll: "trimSnaps" });
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanPrev(emblaApi.canScrollPrev());
    setCanNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  const slides = React.Children.toArray(children);

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-6">
          {slides.map((slide, i) => (
            <div key={i} className="min-w-0 shrink-0 basis-[85%] sm:basis-[48%] lg:basis-[31.5%]">
              {slide}
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        aria-label="Previous"
        onClick={() => emblaApi?.scrollPrev()}
        disabled={!canPrev}
        className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/90 backdrop-blur text-foreground shadow-md transition-opacity disabled:opacity-0"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        aria-label="Next"
        onClick={() => emblaApi?.scrollNext()}
        disabled={!canNext}
        className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/90 backdrop-blur text-foreground shadow-md transition-opacity disabled:opacity-0"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}
