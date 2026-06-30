import { MarketingHeader } from "./sections/MarketingHeader";
import { FooterSection } from "./sections/FooterSection";
import { SeoGeoFaq } from "./sections/SeoGeoFaq";
import { MarketingJsonLd } from "./sections/MarketingJsonLd";
import { resolveTranslation } from "@/5-shared/lib/translations/resolve";
import { getPlatformTranslationsByNamespaces } from "@/5-shared/lib/db/platform-translations";
import { getLocale } from "next-intl/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { appAuthUrl } from "@/5-shared/lib/auth/auth-urls";
import { ArrowRight, Check, Search, Globe, FileStack, Sparkles, LayoutTemplate, GitBranch, Ban } from "lucide-react";

export async function SeoGeoForTenantsPage() {
  const locale = await getLocale();
  const translations = await getPlatformTranslationsByNamespaces(
    ["marketing.header", "marketing.footer", "marketing.seo-geo"],
    locale,
  );

  const t = translations["marketing.seo-geo"] ?? {};
  const baseUrl = process.env.NEXT_PUBLIC_ROOT_DOMAIN
    ? `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
    : "http://localhost:3000";
  const path = "/features/seo-geo-for-tenants";

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${baseUrl}/${locale}` },
      {
        "@type": "ListItem",
        position: 2,
        name: "SEO & GEO for Tenant Sites",
        item: `${baseUrl}/${locale}${path}`,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      <MarketingJsonLd locale={locale} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <MarketingHeader translations={translations["marketing.header"]} />

      <main>
        {/* -- HERO --------------------------------------------------------- */}
        <section className="relative overflow-hidden px-6 pt-28 pb-20 md:pt-40 md:pb-28">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,hsl(var(--primary)/0.06),transparent)]" />
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary mb-8">
              {resolveTranslation(t, "hero.badge", "SEO & GEO built in")}
            </div>

            <h1 className="text-[2.75rem] font-extrabold tracking-tight text-foreground leading-[1.1] sm:text-6xl md:text-7xl">
              {resolveTranslation(t, "hero.title.line1", "Search engine ready.")}
              <br />
              <span className="text-primary">{resolveTranslation(t, "hero.title.line2", "AI answer engine ready.")}</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
              {resolveTranslation(
                t,
                "hero.subtitle",
                "Every tenant site ships with per-locale metadata, hreflang tags, canonical URLs, auto-generated sitemaps, and JSON-LD structured data. Free sites stay noindex to protect domain reputation — paid sites get discovered.",
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

        {/* -- SEO FEATURES ------------------------------------------------- */}
        <section className="px-6 py-24 md:py-32 bg-muted/30">
          <div className="mx-auto max-w-4xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3 text-center">
              {resolveTranslation(t, "seo.badge", "Search engine SEO")}
            </p>
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl text-center mb-16">
              {resolveTranslation(t, "seo.title", "Found on Google, Bing, and beyond")}
            </h2>

            <p className="text-base text-muted-foreground leading-relaxed mb-10 max-w-3xl mx-auto text-center">
              {resolveTranslation(
                t,
                "seo.intro",
                "Every tenant site is optimized for traditional search engines out of the box. No plugins, no configuration, no per-site setup. The platform handles the technical foundation so you can focus on content.",
              )}
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { key: "metadata", icon: Search, fallback: "Per-locale meta titles and descriptions" },
                { key: "hreflang", icon: Globe, fallback: "Automatic hreflang tags for all enabled languages" },
                { key: "canonical", icon: FileStack, fallback: "Canonical URLs pointing to the primary domain" },
                { key: "sitemap", icon: GitBranch, fallback: "Auto-generated sitemap with all indexable sites" },
                { key: "robots", icon: Sparkles, fallback: "Plan-based robots directives (noindex on Free)" },
                { key: "structured", icon: LayoutTemplate, fallback: "JSON-LD structured data on every content type" },
              ].map((item) => (
                <div key={item.key} className="flex items-start gap-3 rounded-xl border border-border/40 bg-card p-5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <item.icon className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-sm text-foreground">
                    {resolveTranslation(t, `seo.item.${item.key}`, item.fallback)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* -- GEO FEATURES ------------------------------------------------- */}
        <section className="px-6 py-24 md:py-32">
          <div className="mx-auto max-w-4xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3 text-center">
              {resolveTranslation(t, "geo.badge", "GEO / AI answer engines")}
            </p>
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl text-center mb-6">
              {resolveTranslation(t, "geo.title", "Understood by ChatGPT, Perplexity, Gemini")}
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed max-w-3xl mx-auto text-center mb-12">
              {resolveTranslation(
                t,
                "geo.subtitle",
                "AI answer engines parse structured content more accurately than unstructured text. Every tenant page uses semantic HTML and valid JSON-LD so your clients' sites are cited correctly — not guessed at.",
              )}
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { key: "org", icon: Search, fallback: "Organization + WebSite schema on the homepage" },
                { key: "article", icon: FileStack, fallback: "Article schema on every blog post" },
                { key: "podcast", icon: Globe, fallback: "PodcastEpisode schema on episodes" },
                { key: "business", icon: Sparkles, fallback: "LocalBusiness schema on the Map block" },
                { key: "semantic", icon: LayoutTemplate, fallback: "Semantic HTML5 elements (section, article, nav)" },
                { key: "headings", icon: GitBranch, fallback: "Clear heading hierarchy for machine parsing" },
              ].map((item) => (
                <div key={item.key} className="flex items-start gap-3 rounded-xl border border-border/40 bg-card p-5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <item.icon className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-sm text-foreground">
                    {resolveTranslation(t, `geo.item.${item.key}`, item.fallback)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* -- FREE VS PAID ------------------------------------------------ */}
        <section className="px-6 py-24 md:py-32 bg-muted/30">
          <div className="mx-auto max-w-5xl">
            <div className="text-center mb-14">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
                {resolveTranslation(t, "plans.badge", "Free vs Paid")}
              </p>
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
                {resolveTranslation(t, "plans.title", "What each plan gets for SEO & GEO")}
              </h2>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border/40">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/40 bg-muted/50">
                    <th className="text-left py-4 px-6 font-semibold text-foreground w-1/3">
                      {resolveTranslation(t, "plans.header.feature", "Feature")}
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-primary w-1/3">
                      {resolveTranslation(t, "plans.header.free", "Free")}
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-primary w-1/3">
                      {resolveTranslation(t, "plans.header.paid", "Pro / Enterprise")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {([
                    ["indexing", "Search indexing", "Noindex (domain hygiene)", "Indexed on Google & Bing"],
                    ["structured", "Structured data (JSON-LD)", "Not emitted", "Organization, WebSite, Article, Podcast"],
                    ["sitemap", "Sitemap inclusion", "Excluded", "Included in auto sitemap"],
                    ["canonical", "Canonical URLs", "Subdomain or custom domain", "Custom domain or subdomain"],
                    ["hreflang", "Hreflang tags", "Per-locale hreflang active", "Per-locale hreflang active"],
                    ["metadata", "Per-locale metadata", "Rendered but noindex", "Indexed with OG/Twitter tags"],
                  ] as const).map(([key, fallbackFeature, fallbackFree, fallbackPaid]) => (
                    <tr key={key} className="hover:bg-muted/30 transition-colors">
                      <td className="py-4 px-6 font-medium text-foreground">
                        {resolveTranslation(t, `plans.row.${key}.feature`, fallbackFeature)}
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                          <Ban className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
                          {resolveTranslation(t, `plans.row.${key}.free`, fallbackFree)}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1.5 text-foreground">
                          <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                          {resolveTranslation(t, `plans.row.${key}.paid`, fallbackPaid)}
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
        <SeoGeoFaq translations={t} />

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
                {resolveTranslation(t, "cta.title", "Your clients deserve to be found.")}
              </h2>
              <p className="relative mt-4 text-base text-muted-foreground max-w-lg mx-auto leading-relaxed">
                {resolveTranslation(
                  t,
                  "cta.subtitle",
                  "Start free to build and preview tenant sites. Upgrade to Pro to make them discoverable on search engines and AI answer engines alike.",
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
