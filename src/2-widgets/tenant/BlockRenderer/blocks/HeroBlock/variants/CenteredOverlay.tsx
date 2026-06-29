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
  const gapClass = "gap-[var(--section-gap)]";

  return (
    <section
      id={blockId}
      className={`relative flex flex-col ${gapClass} px-6 py-24 items-center text-center`}
      style={{
        fontFamily: "var(--font-heading)",
        minHeight: "85vh",
        width: "inherit",
      }}
    >
      {heroImage?.url && (
        <div className="absolute inset-0 w-full h-full z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroImage.url}
            alt={heroImage.alt || "Hero image"}
            className="w-full h-full object-cover opacity-80"
            style={{ objectPosition: "center" }}
          />
          {/* Faded overlay */}
          <div className="absolute inset-0 bg-linear-to-b from-background/60 to-muted/80" />
        </div>
      )}
      <div className="relative z-10 w-full flex flex-col items-center">
        {t.title && (
          <h1
            className="text-4xl sm:text-5xl font-bold leading-tight max-w-3xl"
            style={{
              color: "hsl(var(--primary))",
              fontFamily: "var(--font-heading)",
            }}
          >
            {t.title}
          </h1>
        )}
        {t.subtitle && (
          <p
            className="text-lg text-muted-foreground max-w-2xl"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {t.subtitle}
          </p>
        )}
        {t.ctaLabel && safeCtaUrl && (
          <Button
            asChild
            tenantVariant="primary"
            className={`px-6 py-3 text-white text-base font-medium ${radiusClass}`}
          >
            <a href={safeCtaUrl}>{t.ctaLabel}</a>
          </Button>
        )}
      </div>
    </section>
  );
}
