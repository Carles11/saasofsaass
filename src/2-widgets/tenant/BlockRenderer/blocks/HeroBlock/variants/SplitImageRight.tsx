import { sanitizeCtaUrl } from "@/5-shared/lib/links/sanitize-url";
import { Button } from "@/components/tenant/ui/button";
import type { BlockProps } from "../../../config/types";

interface HeroConfig {
  ctaUrl?: string;
  layout?: "centered" | "left-aligned";
  heroImage?: { url: string; alt?: string } | null;
}

export function SplitImageRight(props: BlockProps) {
  const { config, t, blockId } = props;
  const { ctaUrl, heroImage } = config as HeroConfig;
  const safeCtaUrl = sanitizeCtaUrl(ctaUrl);
  const radiusClass = "rounded-[var(--radius)]";

  return (
    <section
      id={blockId}
      className={`flex flex-col md:flex-row items-center justify-between gap-8 px-6 py-24`}
      style={{ minHeight: "85vh" }}
    >
      <div className="flex-1 flex flex-col items-start justify-center text-left px-6 gap-5">
        {t.title && (
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.08] tracking-tight max-w-3xl text-primary"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {t.title}
          </h1>
        )}
        {t.subtitle && (
          <p
            className="text-lg text-muted-foreground max-w-2xl leading-relaxed"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {t.subtitle}
          </p>
        )}
        {t.ctaLabel && safeCtaUrl && (
          <Button
            asChild
            tenantVariant="primary"
            className={`mt-1 px-7 py-3.5 text-white text-base font-medium shadow-sm hover:shadow-lg transition-shadow ${radiusClass}`}
          >
            <a href={safeCtaUrl}>{t.ctaLabel}</a>
          </Button>
        )}
      </div>
      <div className="flex-1 flex items-center justify-center w-full h-48 md:h-[85vh]">
        {heroImage?.url ? (
          <div className="relative w-full h-full flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={heroImage.url}
              alt={heroImage.alt || "Hero image"}
              className="object-cover w-full h-full md:w-[40vw] md:h-[85vh] rounded-xl shadow-lg"
              style={{ filter: "brightness(0.95)", objectPosition: "center" }}
            />
            {/* Fade left overlay */}
            <div className="absolute inset-0 left-0 bg-linear-to-l from-transparent to-background/80 pointer-events-none" />
          </div>
        ) : (
          <div
            className="w-full h-48 md:h-[70vh] md:w-[40vw] rounded-xl bg-linear-to-tr from-primary/30 via-secondary to-muted"
            aria-hidden
          />
        )}
      </div>
    </section>
  );
}
