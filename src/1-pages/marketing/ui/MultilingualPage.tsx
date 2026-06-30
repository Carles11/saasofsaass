import { MarketingHeader } from "./sections/MarketingHeader";
import { FooterSection } from "./sections/FooterSection";
import { MultilingualFaq } from "./sections/MultilingualFaq";
import { resolveTranslation } from "@/5-shared/lib/translations/resolve";
import { getPlatformTranslationsByNamespaces } from "@/5-shared/lib/db/platform-translations";
import { getLocale } from "next-intl/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { appAuthUrl } from "@/5-shared/lib/auth/auth-urls";
import { ArrowRight, Check, X, Sparkles, Globe, Handshake } from "lucide-react";

/** The 8 platform locales, with native names — the primary signal for crawlers. */
const LANGUAGES = [
  { code: "en", name: "English", native: "English" },
  { code: "es", name: "Spanish", native: "Español" },
  { code: "ca", name: "Catalan", native: "Català" },
  { code: "eu", name: "Basque", native: "Euskara" },
  { code: "ga", name: "Galician", native: "Galego" },
  { code: "fr", name: "French", native: "Français" },
  { code: "it", name: "Italian", native: "Italiano" },
  { code: "de", name: "German", native: "Deutsch" },
] as const;

export async function MultilingualPage() {
  const locale = await getLocale();
  const translations = await getPlatformTranslationsByNamespaces(
    ["marketing.header", "marketing.footer", "marketing.multilingual"],
    locale,
  );

  const t = translations["marketing.multilingual"] ?? {};
  const baseUrl = process.env.NEXT_PUBLIC_ROOT_DOMAIN
    ? `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
    : "http://localhost:3000";
  const path = "/features/multilingual-website-builder";

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "SoSS Engine",
    url: baseUrl,
    description: "Multilingual, multi-site website builder for professionals and agencies.",
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${baseUrl}/${locale}` },
      {
        "@type": "ListItem",
        position: 2,
        name: "Multilingual Website Builder",
        item: `${baseUrl}/${locale}${path}`,
      },
    ],
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Multilingual Website Engine",
    serviceType: "AI translation & localization",
    provider: { "@type": "Organization", name: "SoSS Engine", url: baseUrl },
    description:
      "Build and manage client websites in 8 languages with AI translation, automatic hreflang, and locale-specific URLs — no per-language fees and no manual translation.",
    areaServed: "Global",
  };

  const pillars = [
    {
      key: "ai",
      icon: Sparkles,
      title: resolveTranslation(t, "pillar.ai.title", "Add a language in one click"),
      body: resolveTranslation(
        t,
        "pillar.ai.body",
        "Pick a language and AI translates every block and page on the site automatically. No blank pages, no copy-pasting into translation tools, no waiting on a freelancer. Review and refine afterwards if you want — but you can launch a fully translated site in minutes.",
      ),
    },
    {
      key: "seo",
      icon: Globe,
      title: resolveTranslation(t, "pillar.seo.title", "Found in every language"),
      body: resolveTranslation(
        t,
        "pillar.seo.body",
        "Each language version gets its own clean URL and correct hreflang tags, so search engines and AI answer engines show the right version to the right audience. Your clients' sites become discoverable in every market they serve — not buried as duplicate content.",
      ),
    },
    {
      key: "reseller",
      icon: Handshake,
      title: resolveTranslation(t, "pillar.reseller.title", "Your clients, their language"),
      body: resolveTranslation(
        t,
        "pillar.reseller.body",
        "Every visitor is served the language that matches their browser, automatically. Offer your clients a genuinely international website — a premium capability that normally means a translator and custom development — and manage all of them from a single dashboard.",
      ),
    },
  ];

  // [SoSS, typical builder] comparison rows
  const comparison: [string, string, string, string][] = [
    ["languages", "Multilingual publishing", "Built in, AI-translated", "Paid add-on, per language"],
    ["translation", "Translation work", "AI does it for you", "You write every language by hand"],
    ["seo", "Per-language SEO", "Automatic hreflang & URLs", "Manual configuration"],
    ["cost", "Cost to add a language", "€0 — Free gets 2, paid gets all 8", "Monthly fee per locale"],
    ["sites", "Managing client sites", "All sites, one dashboard", "One subscription per site"],
  ];

  return (
    <div className="min-h-screen bg-background">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <MarketingHeader translations={translations["marketing.header"]} />

      <main>
        {/* -- HERO --------------------------------------------------------- */}
        <section className="relative overflow-hidden px-6 pt-28 pb-20 md:pt-40 md:pb-28">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,hsl(var(--primary)/0.06),transparent)]" />
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary mb-8">
              {resolveTranslation(t, "hero.badge", "Multilingual by default")}
            </div>

            <h1 className="text-[2.75rem] font-extrabold tracking-tight text-foreground leading-[1.1] sm:text-6xl md:text-7xl">
              {resolveTranslation(t, "hero.title.line1", "One site.")}
              <br />
              <span className="text-primary">{resolveTranslation(t, "hero.title.line2", "Every language.")}</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
              {resolveTranslation(
                t,
                "hero.subtitle",
                "Most builders make multilingual a paid add-on you configure by hand, one language at a time. SaaS of SaaS translates entire sites with AI, wires up hreflang automatically, and lets you manage every client site — in every language — from one place.",
              )}
            </p>

            <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Button size="lg" asChild className="px-8 h-12 text-base">
                <Link href={appAuthUrl("sign-up", locale)}>
                  {resolveTranslation(t, "hero.cta.primary", "Start Building Free")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="px-8 h-12 text-base border-border/60">
                <Link href={`/${locale}/#pricing`}>
                  {resolveTranslation(t, "hero.cta.secondary", "See Pricing")}
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* -- THE LOGIC: 3 pillars + language grid ------------------------ */}
        <section aria-labelledby="ml-pillars-title" className="px-6 py-24 md:py-32 bg-muted/30">
          <div className="mx-auto max-w-5xl">
            <h2
              id="ml-pillars-title"
              className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl text-center mb-4"
            >
              {resolveTranslation(t, "pillars.title", "Multilingual that runs itself")}
            </h2>
            <p className="text-center text-muted-foreground mb-16 max-w-2xl mx-auto leading-relaxed">
              {resolveTranslation(
                t,
                "pillars.subtitle",
                "Reaching an international audience usually means translators, duplicate pages, and fragile SEO. SaaS of SaaS turns it into three things that happen automatically.",
              )}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
              {pillars.map((pillar) => (
                <article key={pillar.key} className="flex flex-col gap-3 rounded-xl border border-border/40 bg-background p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <pillar.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg text-foreground">{pillar.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{pillar.body}</p>
                </article>
              ))}
            </div>

            {/* Language grid — native scripts carry the crawl signal */}
            <h3 className="text-center text-xs font-bold tracking-widest uppercase text-primary pb-6">
              {resolveTranslation(t, "grid.title", "8 languages. One site to manage.")}
            </h3>
            <ul
              className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3"
              aria-label="Supported languages"
            >
              {LANGUAGES.map((l) => (
                <li
                  key={l.code}
                  lang={l.code}
                  className="flex flex-col items-center justify-center gap-1 rounded-lg border border-border/40 bg-background p-3 text-center"
                >
                  <span className="text-base font-semibold leading-tight text-foreground">{l.native}</span>
                  <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{l.name}</span>
                  <span className="text-[9px] font-mono text-muted-foreground/60">{l.code}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* -- COMPARISON MATRIX ------------------------------------------- */}
        <section className="px-6 py-24 md:py-32">
          <div className="mx-auto max-w-5xl">
            <div className="text-center mb-14">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
                {resolveTranslation(t, "comparison.badge", "Comparison")}
              </p>
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
                {resolveTranslation(t, "comparison.title", "Built-in multilingual vs the usual add-on")}
              </h2>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border/40">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/40 bg-muted/50">
                    <th className="text-left py-4 px-6 font-semibold text-foreground w-1/3">
                      {resolveTranslation(t, "comparison.header.feature", "What matters")}
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-primary w-1/3">
                      {resolveTranslation(t, "comparison.header.soss", "SaaS of SaaS")}
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-muted-foreground w-1/3">
                      {resolveTranslation(t, "comparison.header.others", "Typical builders")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {comparison.map(([key, fFeature, fSoss, fOthers]) => (
                    <tr key={key} className="hover:bg-muted/30 transition-colors">
                      <td className="py-4 px-6 font-medium text-foreground">
                        {resolveTranslation(t, `comparison.row.${key}.feature`, fFeature)}
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1.5 text-foreground">
                          <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                          {resolveTranslation(t, `comparison.row.${key}.soss`, fSoss)}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                          <X className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
                          {resolveTranslation(t, `comparison.row.${key}.others`, fOthers)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* -- FAQ --------------------------------------------------------- */}
        <MultilingualFaq translations={t} />

        {/* -- FINAL CTA --------------------------------------------------- */}
        <section className="px-6 py-24 md:py-32">
          <div className="mx-auto max-w-3xl">
            <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-linear-to-br from-primary/8 via-background to-accent/8 p-12 md:p-16 text-center">
              <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-primary/8 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-accent/8 blur-3xl" />

              <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-4">
                {resolveTranslation(t, "cta.badge", "Get started")}
              </p>
              <h2 className="relative text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
                {resolveTranslation(t, "cta.title", "Offer your clients a site in every language.")}
              </h2>
              <p className="relative mt-4 text-base text-muted-foreground max-w-lg mx-auto leading-relaxed">
                {resolveTranslation(
                  t,
                  "cta.subtitle",
                  "Build it once, publish it in eight languages, and manage every client from one dashboard — no translators, no per-language fees.",
                )}
              </p>
              <div className="relative mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <Button size="lg" asChild className="px-8 h-12 text-base">
                  <Link href={appAuthUrl("sign-up", locale)}>
                    {resolveTranslation(t, "cta.primary", "Start Building Free")}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild className="px-8 h-12 text-base border-border/60">
                  <Link href={`/${locale}/#pricing`}>
                    {resolveTranslation(t, "cta.secondary", "See Pricing")}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <FooterSection translations={translations["marketing.footer"]} locale={locale} />
    </div>
  );
}
