import { sanitizeCtaUrl } from "@/5-shared/lib/links/sanitize-url";
import { Button } from "@/components/tenant/ui/button";
import type { BlockProps } from "../../../config/types";

interface HeroConfig {
  ctaUrl?: string;
  layout?: "centered" | "left-aligned";
  heroImage?: { url: string; alt?: string } | null;
}
export function HeroBlock(props: BlockProps) {
  const { config, t, templateId } = props;
  const { ctaUrl, layout = "centered", heroImage } = config as HeroConfig;
  const safeCtaUrl = sanitizeCtaUrl(ctaUrl);
  const isCenter = layout === "centered";

  // Tailwind v4 class fixes
  const radiusClass = "rounded-[var(--radius)]";
  const gapClass = "gap-[var(--section-gap)]";

  if (templateId === "modern") {
    // Modern: split layout, image right, mono font
    return (
      <section
        className={`flex flex-col md:flex-row items-center justify-between gap-8 px-6 py-24`}
        style={{ minHeight: "85vh" }}
      >
        <div className="flex-1 flex flex-col items-start justify-center text-left px-6 py-24">
          {t.title && (
            <h1
              className="text-4xl sm:text-5xl font-bold leading-tight max-w-3xl text-primary"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {t.title}
            </h1>
          )}
          {t.subtitle && (
            <p
              className="text-base text-muted-foreground max-w-2xl mt-2"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {t.subtitle}
            </p>
          )}
          {t.ctaLabel && safeCtaUrl && (
            <Button
              asChild
              tenantVariant="primary"
              className={`mt-6 px-6 py-3 text-white text-base font-medium ${radiusClass}`}
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
              className={`w-48 h-32 md:w-64 md:h-48 rounded-xl bg-linear-to-tr from-primary/40 to-muted flex items-center justify-center`}
            >
              <span className="text-xs text-muted-foreground">Image</span>
            </div>
          )}
        </div>
      </section>
    );
  }

  if (templateId === "classic") {
    // Classic: overlay on image, serif font
    return (
      <section
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
  // Default: centered, simple, bg image if present
  return (
    <section
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
