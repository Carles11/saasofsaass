import { MarketingHeader } from "./sections/MarketingHeader";
import { FooterSection } from "./sections/FooterSection";
import { StructuredVsAIFaq } from "./sections/StructuredVsAIFaq";
import { resolveTranslation, type TranslationDict } from "@/5-shared/lib/translations/resolve";
import { getPlatformTranslationsByNamespaces } from "@/5-shared/lib/db/platform-translations";
import { getLocale } from "next-intl/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, FileStack, Search, Sparkles, GitBranch, Languages, LayoutTemplate, Brain, Globe } from "lucide-react";

export async function StructuredVsAIPage() {
  const locale = await getLocale();
  const translations = await getPlatformTranslationsByNamespaces(
    [
      "marketing.header",
      "marketing.footer",
      "marketing.structured-vs-ai",
    ],
    locale,
  );

  const t = translations["marketing.structured-vs-ai"] ?? {};
  const baseUrl = process.env.NEXT_PUBLIC_ROOT_DOMAIN
    ? `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
    : "http://localhost:3000";

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "SoSS Engine",
    url: process.env.NEXT_PUBLIC_ROOT_DOMAIN
      ? `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
      : "http://localhost:3000",
    description: "Structured website builder for professionals.",
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${baseUrl}/${locale}` },
      {
        "@type": "ListItem",
        position: 2,
        name: "Structured Websites vs AI Generated Websites",
        item: `${baseUrl}/${locale}/features/structured-websites-vs-ai-generated-websites`,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />
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
              {resolveTranslation(t, "hero.badge", "Website architecture")}
            </div>

            <h1 className="text-[2.75rem] font-extrabold tracking-tight text-foreground leading-[1.1] sm:text-6xl md:text-7xl">
              {resolveTranslation(t, "hero.title.line1", "Stop Prompting.")}
              <br />
              <span className="text-primary">{resolveTranslation(t, "hero.title.line2", "Start Publishing.")}</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
              {resolveTranslation(
                t,
                "hero.subtitle",
                "Most AI website builders can generate pages. You still need to figure out what those pages should be. SaaS of SaaS starts with proven website structures and uses AI where it truly shines: content creation, multilingual publishing, and localization.",
              )}
            </p>

            <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Button size="lg" asChild className="px-8 h-12 text-base">
                <Link href={`/${locale}/auth/sign-up`}>
                  {resolveTranslation(t, "hero.cta.primary", "Build Your Website")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="px-8 h-12 text-base border-border/60">
                <Link href={`/${locale}/#how-it-works`}>
                  {resolveTranslation(t, "hero.cta.secondary", "See How It Works")}
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* -- STRUCTURE BEFORE CONTENT ----------------------------------- */}
        <section className="px-6 py-24 md:py-32 bg-muted/30">
          <div className="mx-auto max-w-4xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3 text-center">
              {resolveTranslation(t, "structure.badge", "Foundation")}
            </p>
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl text-center mb-16">
              {resolveTranslation(t, "structure.title", "Every Website Needs Structure Before Content")}
            </h2>

            <p className="text-base text-muted-foreground leading-relaxed mb-10 max-w-3xl mx-auto text-center">
              {resolveTranslation(
                t,
                "structure.intro",
                "Before any AI writes a headline, every successful website already requires navigation, page hierarchy, conversion flow, SEO architecture, internal linking, and content organization. AI can generate text. Structure is what makes a website work.",
              )}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { icon: GitBranch, key: "nav", fallback: "Navigation & Page Hierarchy" },
                { icon: LayoutTemplate, key: "flow", fallback: "Conversion Flow" },
                { icon: Search, key: "seo", fallback: "SEO Architecture" },
                { icon: FileStack, key: "linking", fallback: "Internal Linking" },
                { icon: Languages, key: "i18n", fallback: "Multilingual Structure" },
                { icon: Sparkles, key: "content", fallback: "Content Organization" },
              ].map((item) => (
                <div key={item.key} className="flex items-center gap-3 rounded-xl border border-border/40 bg-background p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <item.icon className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {resolveTranslation(t, `structure.item.${item.key}`, item.fallback)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* -- HIDDEN WORK -------------------------------------------------- */}
        <section className="px-6 py-24 md:py-32">
          <div className="mx-auto max-w-5xl">
            <div className="grid gap-12 md:grid-cols-2 md:gap-16 items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
                  {resolveTranslation(t, "hidden.badge", "The Reality")}
                </p>
                <h2 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl mb-6">
                  {resolveTranslation(t, "hidden.title", "The Hidden Work Behind \u201CGenerate My Website\u201D")}
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  {resolveTranslation(
                    t,
                    "hidden.intro",
                    "Most AI website builders follow the same workflow: describe your business, review generated pages, rewrite sections, regenerate content, reorganize navigation, adjust SEO structure, and repeat until satisfied.",
                  )}
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  {resolveTranslation(
                    t,
                    "hidden.empathy",
                    "That process is normal and often useful. But with SaaS of SaaS, the structure already exists. You select the website type and immediately receive a complete architecture ready for publishing.",
                  )}
                </p>
                <Button variant="outline" size="sm" asChild className="border-border/60">
                  <Link href={`/${locale}/auth/sign-up`}>
                    {resolveTranslation(t, "hidden.cta", "Start with a proven structure")}
                    <ArrowRight className="ml-2 h-3 w-3" />
                  </Link>
                </Button>
              </div>

              <div className="relative">
                <div className="rounded-2xl border border-border/40 bg-card p-6 space-y-5">
                  {[
                    { step: "1", label: resolveTranslation(t, "hidden.step.1", "Describe your business") },
                    { step: "2", label: resolveTranslation(t, "hidden.step.2", "Review generated pages") },
                    { step: "3", label: resolveTranslation(t, "hidden.step.3", "Rewrite and regenerate") },
                    { step: "4", label: resolveTranslation(t, "hidden.step.4", "Reorganize navigation") },
                    { step: "5", label: resolveTranslation(t, "hidden.step.5", "Adjust SEO structure") },
                    { step: "6", label: resolveTranslation(t, "hidden.step.6", "Repeat until satisfied") },
                  ].map((item) => (
                    <div key={item.step} className="flex items-center gap-4">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                        {item.step}
                      </span>
                      <span className="text-sm text-foreground">{item.label}</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-border/30">
                    <p className="text-xs font-semibold text-primary">
                      {resolveTranslation(t, "hidden.soss", "SaaS of SaaS: structure already exists \u2192")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* -- COMPARISON TABLE -------------------------------------------- */}
        <section className="px-6 py-24 md:py-32 bg-muted/30">
          <div className="mx-auto max-w-5xl">
            <div className="text-center mb-14">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
                {resolveTranslation(t, "comparison.badge", "Comparison")}
              </p>
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
                {resolveTranslation(t, "comparison.title", "Generated Websites vs Structured Systems")}
              </h2>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border/40">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/40 bg-muted/50">
                    <th className="text-left py-4 px-6 font-semibold text-foreground w-1/3">
                      {resolveTranslation(t, "comparison.header.feature", "Feature")}
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-primary w-1/3">
                      {resolveTranslation(t, "comparison.header.soss", "SaaS of SaaS")}
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-muted-foreground w-1/3">
                      {resolveTranslation(t, "comparison.header.ai", "AI Builders")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {([
                    ["architecture", "Website Architecture", "Proven system", "Generated each time"],
                    ["structure", "Page Structure", "Consistent", "Varies by prompt"],
                    ["seo", "SEO Foundation", "Built in", "Requires review"],
                    ["multilingual", "Multilingual Publishing", "Native system", "Additional configuration"],
                    ["content", "Content Creation", "AI assisted", "AI generated"],
                    ["predictability", "Predictability", "High", "Depends on prompt quality"],
                  ] as const).map(([key, fallbackFeature, fallbackSoss, fallbackAi]) => (
                    <tr key={key} className="hover:bg-muted/30 transition-colors">
                      <td className="py-4 px-6 font-medium text-foreground">
                        {resolveTranslation(t, `comparison.row.${key}.feature`, fallbackFeature)}
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1.5 text-foreground">
                          <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                          {resolveTranslation(t, `comparison.row.${key}.soss`, fallbackSoss)}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-muted-foreground">
                        {resolveTranslation(t, `comparison.row.${key}.ai`, fallbackAi)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* -- BUILT FOR SEARCH -------------------------------------------- */}
        <section className="px-6 py-24 md:py-32">
          <div className="mx-auto max-w-4xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3 text-center">
              {resolveTranslation(t, "geo.badge", "GEO Ready")}
            </p>
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl text-center mb-6">
              {resolveTranslation(t, "geo.title", "Built for Search Engines. Built for AI Search.")}
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed max-w-3xl mx-auto text-center mb-12">
              {resolveTranslation(
                t,
                "geo.subtitle",
                "Modern discovery happens through Google, ChatGPT, Perplexity, Claude, and Gemini. These systems understand structure. A predictable architecture helps machines understand what your business does, how pages relate, which content matters, and which language version should appear.",
              )}
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { key: "urls", icon: FileStack, fallback: "Clean URL structures" },
                { key: "multilingual", icon: Languages, fallback: "Multilingual architecture with hreflang" },
                { key: "metadata", icon: Search, fallback: "Consistent metadata across pages" },
                { key: "headings", icon: LayoutTemplate, fallback: "Semantic heading hierarchy" },
                { key: "structured", icon: GitBranch, fallback: "Structured content for AI parsing" },
                { key: "speed", icon: Sparkles, fallback: "Fast, predictable rendering" },
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

        {/* -- AI WHERE IT MATTERS ----------------------------------------- */}
        <section className="px-6 py-24 md:py-32 bg-muted/30">
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary mb-6">
              {resolveTranslation(t, "ai.badge", "AI powered")}
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl mb-6">
              {resolveTranslation(t, "ai.title", "AI Where It Matters Most")}
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-10">
              {resolveTranslation(
                t,
                "ai.subtitle",
                "SaaS of SaaS fully embraces AI. Generate descriptions, rewrite copy, improve messaging, translate entire websites, and localize content for different markets. AI improves the content. It does not need to reinvent the website architecture.",
              )}
            </p>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 max-w-3xl mx-auto">
              {[
                { key: "write", icon: Brain, fallback: "Write descriptions" },
                { key: "improve", icon: Sparkles, fallback: "Improve copy" },
                { key: "translate", icon: Languages, fallback: "Translate sites" },
                { key: "localize", icon: Globe, fallback: "Localize content" },
              ].map((item) => (
                <div key={item.key} className="flex flex-col items-center gap-2 rounded-xl border border-border/40 bg-background p-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {resolveTranslation(t, `ai.item.${item.key}`, item.fallback)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* -- FAQ --------------------------------------------------------- */}
        <StructuredVsAIFaq translations={t} />

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
                {resolveTranslation(t, "cta.title", "Your Website Shouldn\u2019t Start With a Prompt.")}
                <br />
                <span className="text-primary">{resolveTranslation(t, "cta.title.accent", "It Should Start With a Plan.")}</span>
              </h2>
              <p className="relative mt-4 text-base text-muted-foreground max-w-lg mx-auto leading-relaxed">
                {resolveTranslation(
                  t,
                  "cta.subtitle",
                  "Use proven structures, publish faster, and let AI focus on the content instead of rebuilding your website from scratch.",
                )}
              </p>
              <div className="relative mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <Button size="lg" asChild className="px-8 h-12 text-base">
                  <Link href={`/${locale}/auth/sign-up`}>
                    {resolveTranslation(t, "cta.primary", "Start Building Free")}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild className="px-8 h-12 text-base border-border/60">
                  <Link href={`/${locale}`}>
                    {resolveTranslation(t, "cta.secondary", "Back to Home")}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <FooterSection translations={translations["marketing.footer"]} />
    </div>
  );
}
