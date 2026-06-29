import { sanitizeCtaUrl } from "@/5-shared/lib/links/sanitize-url";
import { Button } from "@/components/tenant/ui/button";
import type { BlockProps } from "../../../config/types";

interface HeroConfig {
  ctaUrl?: string;
  layout?: "centered" | "left-aligned";
  heroImage?: { url: string; alt?: string } | null;
}

/**
 * Hero variant: MinimalText.
 *
 * No image. The hero is just typography: large heading, secondary text,
 * optional CTA. Used by templates that want the writing to do the work
 * (editorial, magazine, text-first SaaS).
 */
export function MinimalText(props: BlockProps) {
  const { config, t, blockId } = props;
  const { ctaUrl, layout = "centered" } = config as HeroConfig;
  const safeCtaUrl = sanitizeCtaUrl(ctaUrl);
  const radiusClass = "rounded-[var(--radius)]";
  const isCentered = layout === "centered";

  return (
    <section
      id={blockId}
      className={`flex flex-col px-6 py-32 ${
        isCentered ? "items-center text-center" : "items-start text-left"
      }`}
      style={{ minHeight: "70vh", justifyContent: "center" }}
    >
      <div className={`flex flex-col gap-6 ${isCentered ? "items-center" : "items-start"}`}>
        {t.eyebrow && (
          <span
            className="text-xs uppercase tracking-widest text-muted-foreground"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {t.eyebrow}
          </span>
        )}
        {t.title && (
          <h1
            className={`text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] max-w-4xl text-foreground`}
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {t.title}
          </h1>
        )}
        {t.subtitle && (
          <p
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl leading-relaxed"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {t.subtitle}
          </p>
        )}
        {t.ctaLabel && safeCtaUrl && (
          <Button
            asChild
            tenantVariant="primary"
            className={`mt-4 px-7 py-3.5 text-white text-base font-medium ${radiusClass}`}
          >
            <a href={safeCtaUrl}>{t.ctaLabel}</a>
          </Button>
        )}
      </div>
    </section>
  );
}
