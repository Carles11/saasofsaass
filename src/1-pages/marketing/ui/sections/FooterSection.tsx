import {
  LOCALE_LABELS,
  SUPPORTED_LOCALES,
} from "@/5-shared/config/languages/supportedLanguages";
import {
  resolveTranslation,
  type TranslationDict,
} from "@/5-shared/lib/translations/resolve";
import Link from "next/link";

interface FooterSectionProps {
  translations?: TranslationDict;
  locale?: string;
}

export function FooterSection({ translations, locale }: FooterSectionProps) {
  const currentYear = new Date().getFullYear();
  const l = locale ?? "en";
  const langPrefix = `/${l}`;
  const env = process.env.NODE_ENV?.toUpperCase() || "PRODUCTION";
  const tagline = resolveTranslation(
    translations,
    "tagline",
    "Websites for your clients. Managed by you.",
  );

  const resourceLinks = [
    {
      label: resolveTranslation(translations, "link.features", "Features"),
      href: `${langPrefix}/#features`,
    },
    {
      label: resolveTranslation(translations, "link.pricing", "Pricing"),
      href: `${langPrefix}/#pricing`,
    },
    {
      label: resolveTranslation(translations, "link.faq", "FAQ"),
      href: `${langPrefix}/#faq`,
    },
    {
      label: resolveTranslation(
        translations,
        "feature-structured",
        "Structured vs AI Websites",
      ),
      href: `${langPrefix}/features/structured-websites-vs-ai-generated-websites`,
    },
  ];

  const legalLinks = [
    {
      label: resolveTranslation(
        translations,
        "link.terms-of-service",
        "Terms of Service",
      ),
      href: `${langPrefix}/terms-of-service`,
    },
    {
      label: resolveTranslation(
        translations,
        "link.privacy-policy",
        "Privacy Policy",
      ),
      href: `${langPrefix}/privacy-policy`,
    },
    {
      label: resolveTranslation(
        translations,
        "link.cookie-policy",
        "Cookie Policy",
      ),
      href: `${langPrefix}/cookie-policy`,
    },
  ];

  return (
    <footer className="relative w-full overflow-hidden px-6 pb-9 pt-16 border-t border-border bg-background">
      {/* Ambient glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-20 h-80 w-80 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 70%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-10 -left-10 h-52 w-52 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(244,162,97,0.05) 0%, transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-6xl">
        <div className="mb-12 grid grid-cols-1 gap-10 pb-12 md:grid-cols-12 border-b border-border">
          {/* Brand Column */}
          <div className="flex flex-col gap-5 md:col-span-5">
            <Link href={langPrefix} className="inline-flex items-center gap-2">
              <h3 className="font-serif text-2xl font-normal leading-none tracking-wide">
                Saas<em className="italic text-primary">of</em>saaSs
                <em className="italic text-primary">.com</em>
              </h3>
            </Link>
            <p className="max-w-xs text-sm font-light leading-relaxed text-muted-foreground">
              {tagline}
            </p>

            {/* Environment Status Badge */}
            <span
              className="inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-medium uppercase tracking-widest"
              style={{
                background: "rgba(59,130,246,0.08)",
                border: "1px solid rgba(59,130,246,0.25)",
                color: "hsl(var(--primary))",
              }}
            >
              <span
                className="relative flex h-1.5 w-1.5 shrink-0"
                aria-hidden="true"
              >
                <span
                  className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
                  style={{ background: "hsl(var(--primary))" }}
                />
                <span
                  className="relative inline-flex h-1.5 w-1.5 rounded-full"
                  style={{ background: "hsl(var(--primary))" }}
                />
              </span>
              {resolveTranslation(
                translations,
                "production",
                "Live Production",
              )}
            </span>
          </div>

          <div className="hidden md:block md:col-span-1" />

          {/* Resources Column */}
          <div className="flex flex-col gap-4 text-sm md:col-span-2">
            <h4 className="text-[9px] font-medium uppercase tracking-[0.2em] text-muted-foreground/60">
              {resolveTranslation(translations, "resources", "Resources")}
            </h4>
            <nav className="flex flex-col gap-2.5">
              {resourceLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Legal Column */}
          <div className="flex flex-col gap-4 text-sm md:col-span-2">
            <h4 className="text-[9px] font-medium uppercase tracking-[0.2em] text-muted-foreground/60">
              {resolveTranslation(translations, "legal", "Legal")}
            </h4>
            <nav className="flex flex-col gap-2.5">
              {legalLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Languages Column */}
          <div className="flex flex-col gap-4 text-sm md:col-span-2">
            <h4 className="text-[9px] font-medium uppercase tracking-[0.2em] text-muted-foreground/60">
              {resolveTranslation(translations, "languages", "Global Reach")}
            </h4>
            <div className="flex flex-wrap gap-1.5 font-mono text-[10px] text-muted-foreground">
              {SUPPORTED_LOCALES.map((l) => (
                <span
                  key={l}
                  className="text-[9px] px-1.5 py-0.5 rounded border border-primary/20 opacity-70"
                >
                  {l.toUpperCase()}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Platform Entity Strip */}
        <section className="mb-10 flex items-start gap-4 rounded-[10px] p-6 border border-primary/10 bg-primary/[0.02]">
          <div
            aria-hidden="true"
            className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/20"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-primary"
            >
              <circle cx="8" cy="8" r="5.5" />
              <path d="M8 5v3l2 1.5" />
            </svg>
          </div>

          <div>
            <p className="mb-1.5 font-serif text-[10px] italic tracking-wide text-primary/70">
              {resolveTranslation(
                translations,
                "at_a_glance.title",
                "Platform Entity Data",
              )}
            </p>
            <p className="text-[11.5px] font-light leading-[1.8] text-muted-foreground">
              {resolveTranslation(
                translations,
                "at_a_glance.body",
                "SoSS Engine is a 2026-native, multilingual SaaS for creating multi-tenant websites. Supporting {count} languages ({list}), it enables professionals to build and manage client sites with AI-powered translations, custom domains, and role-based access.",
                {
                  count: String(SUPPORTED_LOCALES.length),
                  list: Object.values(LOCALE_LABELS).join(", "),
                },
              )}
            </p>
          </div>
        </section>

        {/* Bottom Bar */}
        <div className="flex flex-col items-center justify-between gap-6 border-t border-border pt-8 text-[10px] uppercase tracking-[0.2em] opacity-40 md:flex-row">
          <p>© {currentYear} SaaSofSaaSs.com</p>

          <div className="flex items-center gap-4">
            <span>
              {resolveTranslation(translations, "made_with_love", "Built by")}{" "}
              <a
                href="https://github.com/Carles11/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary hover:text-primary/80 transition-colors"
              >
                {resolveTranslation(translations, "author", "Carles del Río")}
              </a>
            </span>
            <span className="opacity-30">|</span>
            <span
              className="rounded font-mono text-[9px] tracking-widest px-2 py-0.5"
              style={{
                background: "rgba(59,130,246,0.07)",
                border: "1px solid rgba(59,130,246,0.18)",
                color: "hsl(var(--primary))",
              }}
            >
              {resolveTranslation(translations, "env_label", "ENV")}: {env}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
