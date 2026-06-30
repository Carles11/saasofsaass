import Link from "next/link";
import { Button } from "@/components/tenant/ui/button";
import { sanitizeCtaUrl } from "@/5-shared/lib/links/sanitize-url";
import { getPlatformTranslations } from "@/5-shared/lib/db/platform-translations";
import { resolveTranslation } from "@/5-shared/lib/translations/resolve";
import type { BlockProps } from "../../../config/types";

interface CtaBannerConfig {
  ctaUrl?: string;
}

export async function CtaBannerBlock({ config, t, locale, blockId }: BlockProps) {
  const { ctaUrl } = config as CtaBannerConfig;
  const safeCtaUrl = sanitizeCtaUrl(ctaUrl);
  const heading = t.heading;
  const subtitle = t.subtitle;

  const platformT = await getPlatformTranslations("common", locale);
  const ctaLabel = t.ctaLabel || resolveTranslation(platformT, "learnMore", "Learn more");

  return (
    <section id={blockId} className="py-20 sm:py-28 px-6">
      <div
        className="relative max-w-6xl mx-auto overflow-hidden rounded-[var(--radius)] bg-primary px-6 py-16 sm:px-16 sm:py-20 text-center"
      >
        {/* soft decorative glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary-foreground/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-primary-foreground/10 blur-3xl"
        />
        <div className="relative">
          {heading && (
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-primary-foreground"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {heading}
            </h2>
          )}
          {subtitle && (
            <p
              className="mt-4 mx-auto max-w-2xl text-lg leading-relaxed text-primary-foreground/80"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {subtitle}
            </p>
          )}
          {safeCtaUrl && (
            <Button
              asChild
              className="mt-8 rounded-[var(--radius)] bg-background px-7 py-3.5 text-base font-medium text-foreground shadow-sm hover:shadow-lg transition-shadow hover:bg-background"
            >
              {safeCtaUrl.startsWith("/") ? (
                <Link href={safeCtaUrl}>{ctaLabel}</Link>
              ) : (
                <a href={safeCtaUrl}>{ctaLabel}</a>
              )}
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
