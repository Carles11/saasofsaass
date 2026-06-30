import { sanitizeCtaUrl } from "@/5-shared/lib/links/sanitize-url";
import { Button } from "@/components/tenant/ui/button";
import type { BlockProps } from "../../../config/types";

interface HeroConfig {
  ctaUrl?: string;
  layout?: "centered" | "left-aligned";
  heroImage?: { url: string; alt?: string } | null;
}

export function CenteredOverlay(props: BlockProps) {
  const { config, t, blockId } = props;
  const { ctaUrl, heroImage } = config as HeroConfig;
  const safeCtaUrl = sanitizeCtaUrl(ctaUrl);
  const radiusClass = "rounded-[var(--radius)]";
  const hasImage = !!heroImage?.url;

  return (
    <section
      id={blockId}
      className="relative flex flex-col px-6 py-24 items-center justify-center text-center overflow-hidden"
      style={{ fontFamily: "var(--font-heading)", minHeight: "88vh", width: "inherit" }}
    >
      {hasImage && (
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroImage!.url}
            alt={heroImage!.alt || "Hero image"}
            className="h-full w-full object-cover"
            style={{ objectPosition: "center" }}
          />
          {/* Dark scrim for legible, punchy text over any photo */}
          <div className="absolute inset-0 bg-linear-to-b from-black/40 via-black/30 to-black/70" />
        </div>
      )}

      <div className="relative z-10 flex w-full max-w-4xl flex-col items-center gap-6">
        {t.title && (
          <h1
            className={`text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight ${
              hasImage ? "text-white drop-shadow-sm" : "text-primary"
            }`}
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {t.title}
          </h1>
        )}
        {t.subtitle && (
          <p
            className={`text-lg sm:text-xl max-w-2xl leading-relaxed ${
              hasImage ? "text-white/85" : "text-muted-foreground"
            }`}
            style={{ fontFamily: "var(--font-body)" }}
          >
            {t.subtitle}
          </p>
        )}
        {t.ctaLabel && safeCtaUrl && (
          <Button
            asChild
            tenantVariant="primary"
            className={`mt-2 px-8 py-4 text-white text-base font-medium shadow-lg hover:shadow-xl transition-shadow ${radiusClass}`}
          >
            <a href={safeCtaUrl}>{t.ctaLabel}</a>
          </Button>
        )}
      </div>
    </section>
  );
}
