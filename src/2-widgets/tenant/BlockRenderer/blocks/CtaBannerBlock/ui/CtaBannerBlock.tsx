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
    <section id={blockId} className="py-16 px-6">
      <div className="max-w-4xl mx-auto text-center">
        {heading && (
          <h2 className="text-3xl font-bold mb-4">{heading}</h2>
        )}
        {subtitle && (
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">{subtitle}</p>
        )}
        {safeCtaUrl && (
          <Button asChild tenantVariant="primary" className="px-6 py-3 text-white text-base font-medium">
            {safeCtaUrl.startsWith("/") ? (
              <Link href={safeCtaUrl}>{ctaLabel}</Link>
            ) : (
              <a href={safeCtaUrl}>{ctaLabel}</a>
            )}
          </Button>
        )}
      </div>
    </section>
  );
}
