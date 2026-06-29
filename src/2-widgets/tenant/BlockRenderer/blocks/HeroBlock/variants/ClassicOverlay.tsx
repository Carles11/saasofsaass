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
          <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80')] bg-cover bg-center opacity-30 rounded-xl" />
        )}
        {/* Faded overlay */}
        <div className="absolute inset-0 bg-linear-to-b from-muted/60 to-muted/80" />
      </div>
      <div className="relative z-10 flex flex-col items-center justify-center w-full h-full">
        {t.title && (
          <h1
            className="text-4xl sm:text-5xl font-bold leading-tight max-w-3xl text-foreground drop-shadow"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {t.title}
          </h1>
        )}
        {t.subtitle && (
          <p
            className="text-lg text-muted-foreground max-w-2xl drop-shadow mt-2"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {t.subtitle}
          </p>
        )}
        {t.ctaLabel && safeCtaUrl && (
          <Button
            asChild
            tenantVariant="primary"
            className={`mt-6 px-6 py-3 text-white text-base font-medium ${radiusClass} border border-border`}
          >
            <a href={safeCtaUrl}>{t.ctaLabel}</a>
          </Button>
        )}
      </div>
    </section>
  );
}
