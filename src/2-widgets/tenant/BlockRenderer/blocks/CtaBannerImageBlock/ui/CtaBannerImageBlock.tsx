import { getPlatformTranslations } from "@/5-shared/lib/db/platform-translations";
import { sanitizeCtaUrl } from "@/5-shared/lib/links/sanitize-url";
import { resolveTranslation } from "@/5-shared/lib/translations/resolve";
import { Button } from "@/components/tenant/ui/button";
import Link from "next/link";
import type { BlockProps } from "../../../config/types";

interface CtaBannerImageConfig {
  ctaUrl?: string;
  image?: { url: string; alt?: string } | null;
  layout?: "image-left" | "image-right" | "background";
}

/** Pick a layout from the active template when the block hasn't pinned one. */
type Layout = "image-left" | "image-right" | "background";
function layoutForTemplate(templateId: string): Layout {
  if (templateId === "modern" || templateId === "loft" || templateId === "harbor") return "background";
  if (templateId === "classic" || templateId === "atelier" || templateId === "journal") return "image-right";
  return "image-left";
}

export async function CtaBannerImageBlock({ config, t, locale, blockId, templateId }: BlockProps) {
  const { ctaUrl, image, layout } = config as CtaBannerImageConfig;
  const safeCtaUrl = sanitizeCtaUrl(ctaUrl);
  const heading = t.heading;
  const subtitle = t.subtitle;
  const hasImage = !!image?.url;

  const platformT = await getPlatformTranslations("common", locale);
  const ctaLabel = t.ctaLabel || resolveTranslation(platformT, "learnMore", "Learn more");

  const effectiveLayout: Layout = layout ?? layoutForTemplate(templateId);

  const cta = safeCtaUrl ? (
    <Button
      asChild
      tenantVariant="primary"
      className="mt-6 px-7 py-3.5 text-white text-base font-medium rounded-[var(--radius)] shadow-sm hover:shadow-lg transition-shadow"
    >
      {safeCtaUrl.startsWith("/") ? (
        <Link href={safeCtaUrl}>{ctaLabel}</Link>
      ) : (
        <a href={safeCtaUrl}>{ctaLabel}</a>
      )}
    </Button>
  ) : null;

  // ── Background layout: image fills the banner, text overlaid ──────────
  if (effectiveLayout === "background" && hasImage) {
    return (
      <section id={blockId} className="py-20 sm:py-28 px-6">
        <div className="relative max-w-6xl mx-auto overflow-hidden rounded-[var(--radius)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image!.url} alt={image!.alt || ""} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/45 to-black/20" />
          <div className="relative px-6 py-20 sm:px-16 sm:py-28 max-w-2xl">
            {heading && (
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white" style={{ fontFamily: "var(--font-heading)" }}>
                {heading}
              </h2>
            )}
            {subtitle && (
              <p className="mt-4 text-lg leading-relaxed text-white/85" style={{ fontFamily: "var(--font-body)" }}>
                {subtitle}
              </p>
            )}
            {cta}
          </div>
        </div>
      </section>
    );
  }

  // ── Split layout: image on one side, text on the other ────────────────
  const imageRight = effectiveLayout === "image-right";
  return (
    <section id={blockId} className="py-20 sm:py-28 px-6">
      <div className="max-w-6xl mx-auto overflow-hidden rounded-[var(--radius)] border border-border bg-secondary/30">
        <div className="grid items-center gap-0 md:grid-cols-2">
          {/* Text */}
          <div className={`px-6 py-12 sm:px-12 sm:py-16 ${imageRight ? "md:order-1" : "md:order-2"}`}>
            {heading && (
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
                {heading}
              </h2>
            )}
            {subtitle && (
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground" style={{ fontFamily: "var(--font-body)" }}>
                {subtitle}
              </p>
            )}
            {cta}
          </div>
          {/* Image (or palette gradient fallback) */}
          <div className={`relative min-h-60 md:h-full ${imageRight ? "md:order-2" : "md:order-1"}`}>
            {hasImage ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image!.url} alt={image!.alt || ""} className="absolute inset-0 h-full w-full object-cover" />
              </>
            ) : (
              <div aria-hidden className="absolute inset-0 bg-linear-to-br from-primary/30 via-secondary to-muted" />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
