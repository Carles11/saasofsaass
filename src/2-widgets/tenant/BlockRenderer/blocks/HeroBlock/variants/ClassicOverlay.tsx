import { sanitizeCtaUrl } from "@/5-shared/lib/links/sanitize-url";
import { Button } from "@/components/tenant/ui/button";
import type { BlockProps } from "../../../config/types";

interface HeroConfig {
  ctaUrl?: string;
  layout?: "centered" | "left-aligned";
  heroImage?: { url: string; alt?: string } | null;
}

export function ClassicOverlay(props: BlockProps) {
  const { config, t, blockId } = props;
  const { ctaUrl, heroImage } = config as HeroConfig;
  const safeCtaUrl = sanitizeCtaUrl(ctaUrl);
  const radiusClass = "rounded-[var(--radius)]";

  return (
    <section
      id={blockId}
      className={`relative flex items-center justify-center min-h-80 px-6 py-24 bg-linear-to-b from-muted to-muted/50`}
      style={{ minHeight: "85vh" }}
    >
      <div className="absolute inset-0 w-full h-full rounded-xl overflow-hidden">
        {heroImage?.url ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={heroImage.url}
              alt={heroImage.alt || "Hero image"}
              className="w-full h-full object-cover opacity-75"
              style={{ filter: "brightness(0.95)" }}
            />
          </>
        ) : (
          <div className="w-full h-full rounded-xl bg-linear-to-br from-secondary via-muted to-primary/20" aria-hidden />
        )}
        {/* Faded overlay */}
        <div className="absolute inset-0 bg-linear-to-b from-muted/60 to-muted/80" />
      </div>
      <div className="relative z-10 flex flex-col items-center justify-center text-center w-full h-full gap-5">
        {t.title && (
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] max-w-3xl text-foreground drop-shadow"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {t.title}
          </h1>
        )}
        {t.subtitle && (
          <p
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl leading-relaxed drop-shadow"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {t.subtitle}
          </p>
        )}
        {t.ctaLabel && safeCtaUrl && (
          <Button
            asChild
            tenantVariant="primary"
            className={`mt-2 px-7 py-3.5 text-white text-base font-medium shadow-sm hover:shadow-lg transition-shadow ${radiusClass} border border-border`}
          >
            <a href={safeCtaUrl}>{t.ctaLabel}</a>
          </Button>
        )}
      </div>
    </section>
  );
}
