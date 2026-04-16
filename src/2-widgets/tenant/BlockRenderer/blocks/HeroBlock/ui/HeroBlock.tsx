import { Button } from "@/components/tenant/ui/button";
import type { BlockProps } from "../../../config/types";

interface HeroConfig {
  ctaUrl?: string;
  layout?: "centered" | "left-aligned";
}

function sanitizeCtaUrl(url?: string): string | undefined {
  if (!url) return undefined;
  const isSafe = url.startsWith("/") || url.startsWith("https://");
  return isSafe ? url : undefined;
}

export function HeroBlock(props: BlockProps) {
  const { config, t, templateId } = props;
  const { ctaUrl, layout = "centered" } = config as HeroConfig;
  const safeCtaUrl = sanitizeCtaUrl(ctaUrl);
  const isCenter = layout === "centered";

  // Tailwind v4 class fixes
  const radiusClass = "rounded-[var(--radius)]";
  const gapClass = "gap-[var(--section-gap)]";

  if (templateId === "modern") {
    // Modern: split layout, image right, mono font
    return (
      <section
        className={`flex flex-col md:flex-row items-center justify-between gap-8 px-6 py-24 font-mono`}
      >
        <div className="flex-1 flex flex-col items-start justify-center text-left">
          {t.title && (
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight max-w-3xl text-primary">
              {t.title}
            </h1>
          )}
          {t.subtitle && <p className="text-base text-zinc-500 max-w-2xl mt-2">{t.subtitle}</p>}
          {t.ctaLabel && safeCtaUrl && (
            <Button
              asChild
              tenantVariant="primary"
              className={`mt-6 px-6 py-3 text-white text-base font-medium ${radiusClass}`}
              style={{ backgroundColor: "hsl(var(--primary))", borderRadius: "var(--radius)" }}
            >
              <a href={safeCtaUrl}>{t.ctaLabel}</a>
            </Button>
          )}
        </div>
        <div className="flex-1 flex items-center justify-center w-full h-48 md:h-64">
          <div
            className={`w-48 h-32 md:w-64 md:h-48 rounded-xl bg-gradient-to-tr from-primary/40 to-zinc-200 flex items-center justify-center`}
          >
            <span className="text-xs text-zinc-400">Image</span>
          </div>
        </div>
      </section>
    );
  }

  if (templateId === "classic") {
    // Classic: overlay on image, serif font
    return (
      <section
        className={`relative flex items-center justify-center min-h-[320px] px-6 py-24 font-serif bg-gradient-to-b from-zinc-100 to-zinc-50`}
      >
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80')] bg-cover bg-center opacity-30 rounded-xl" />
        <div className="relative z-10 flex flex-col items-center justify-center w-full h-full">
          {t.title && (
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight max-w-3xl text-zinc-700 drop-shadow">
              {t.title}
            </h1>
          )}
          {t.subtitle && (
            <p className="text-lg text-zinc-600 max-w-2xl drop-shadow mt-2">{t.subtitle}</p>
          )}
          {t.ctaLabel && safeCtaUrl && (
            <Button
              asChild
              tenantVariant="primary"
              className={`mt-6 px-6 py-3 text-white text-base font-medium ${radiusClass} border border-zinc-300`}
              style={{ backgroundColor: "hsl(var(--primary))", borderRadius: "var(--radius)" }}
            >
              <a href={safeCtaUrl}>{t.ctaLabel}</a>
            </Button>
          )}
        </div>
      </section>
    );
  }

  // Default: centered, simple
  return (
    <section
      className={`flex flex-col ${gapClass} px-6 py-24 items-center text-center font-sans`}
      style={{ fontFamily: "var(--font-heading)" }}
    >
      {t.title && (
        <h1
          className="text-4xl sm:text-5xl font-bold leading-tight max-w-3xl"
          style={{ color: "hsl(var(--primary))", fontFamily: "var(--font-heading)" }}
        >
          {t.title}
        </h1>
      )}
      {t.subtitle && (
        <p className="text-lg text-zinc-600 max-w-2xl" style={{ fontFamily: "var(--font-body)" }}>
          {t.subtitle}
        </p>
      )}
      {t.ctaLabel && safeCtaUrl && (
        <Button
          asChild
          tenantVariant="primary"
          className={`px-6 py-3 text-white text-base font-medium ${radiusClass}`}
          style={{ backgroundColor: "hsl(var(--primary))", borderRadius: "var(--radius)" }}
        >
          <a href={safeCtaUrl}>{t.ctaLabel}</a>
        </Button>
      )}
    </section>
  );
}
