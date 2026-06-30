import { MarketingHeader } from "./sections/MarketingHeader";
import { FooterSection } from "./sections/FooterSection";
import { MarketingJsonLd } from "./sections/MarketingJsonLd";
import { resolveTranslation } from "@/5-shared/lib/translations/resolve";
import { getPlatformTranslationsByNamespaces } from "@/5-shared/lib/db/platform-translations";
import { getLocale } from "next-intl/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { appAuthUrl } from "@/5-shared/lib/auth/auth-urls";
import { ArrowRight, Check, X, Globe, CreditCard, Sparkles, Ban } from "lucide-react";

/**
 * "Truly Free" marketing page. The core differentiator: a full-featured website
 * with its own custom domain at $0 — a capability competitors paywall. Fully
 * server-rendered (the FAQ uses native <details> so the Q&A is always in the DOM
 * for search and AI crawlers, with FAQPage JSON-LD as the machine signal).
 */
export async function FreeWebsiteBuilderPage() {
  const locale = await getLocale();
  const translations = await getPlatformTranslationsByNamespaces(
    ["marketing.header", "marketing.footer", "marketing.free-builder"],
    locale,
  );

  const t = translations["marketing.free-builder"] ?? {};
  const baseUrl = process.env.NEXT_PUBLIC_ROOT_DOMAIN
    ? `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
    : "http://localhost:3000";
  const path = "/features/free-website-builder";

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${baseUrl}/${locale}` },
      {
        "@type": "ListItem",
        position: 2,
        name: "Free Website Builder",
        item: `${baseUrl}/${locale}${path}`,
      },
    ],
  };

  // Honest comparison of free tiers. Custom domain on a free plan is the wedge —
  // mainstream builders require a paid upgrade for it.
  const comparison: [string, string, boolean, boolean][] = [
    ["custom-domain", resolveTranslation(t, "compare.custom-domain", "Custom domain on the free plan"), true, false],
    ["multilingual", resolveTranslation(t, "compare.multilingual", "Multiple languages included free"), true, false],
    ["no-ads", resolveTranslation(t, "compare.no-ads", "No forced platform ads on your site"), true, false],
    ["unlimited", resolveTranslation(t, "compare.unlimited", "Unlimited draft sites to build"), true, false],
    ["full-features", resolveTranslation(t, "compare.full-features", "Full block library, no feature lock"), true, false],
  ];

  const pillars = [
    {
      key: "domain",
      icon: Globe,
      title: resolveTranslation(t, "pillar.domain.title", "Your own custom domain, free"),
      body: resolveTranslation(
        t,
        "pillar.domain.body",
        "Connect a domain you own to a free site — no upgrade required. Most website builders lock custom domains behind a paid plan; SoSS does not. Your free site lives at your brand, not a builder's subdomain.",
      ),
    },
    {
      key: "nocard",
      icon: CreditCard,
      title: resolveTranslation(t, "pillar.nocard.title", "No credit card, no time limit"),
      body: resolveTranslation(
        t,
        "pillar.nocard.body",
        "Free means free — not a trial. Build and publish a complete, professional website without entering a card. Stay on the free plan for as long as you like; upgrade only when you want search indexing or more published sites.",
      ),
    },
    {
      key: "fair",
      icon: Sparkles,
      title: resolveTranslation(t, "pillar.fair.title", "The only honest limit: search indexing"),
      body: resolveTranslation(
        t,
        "pillar.fair.body",
        "Free sites get the full builder, custom domain and multilingual content — the one thing reserved for paid plans is being indexed by search engines, which protects platform domain reputation. Everything a single-site owner needs is genuinely free.",
      ),
    },
  ];

  const faqs = [
    {
      q: resolveTranslation(t, "faq.q1.q", "Is SoSS really free, or is it a trial?"),
      a: resolveTranslation(
        t,
        "faq.q1.a",
        "It is genuinely free, with no time limit and no credit card required. You can build a complete, professional website — connect your own custom domain, add multiple languages, and use the full block library — without ever paying. Paid plans add search-engine indexing and more published sites, but the free plan is a real product, not a countdown to a paywall.",
      ),
    },
    {
      q: resolveTranslation(t, "faq.q2.q", "Can I use my own domain on the free plan?"),
      a: resolveTranslation(
        t,
        "faq.q2.a",
        "Yes. Custom domains are included on every plan, including Free — connect a domain you already own from your dashboard. This is unusual: most website builders (Wix, Squarespace, Carrd) require a paid plan to remove their subdomain and use your own domain.",
      ),
    },
    {
      q: resolveTranslation(t, "faq.q3.q", "What's the catch with the free plan?"),
      a: resolveTranslation(
        t,
        "faq.q3.a",
        "There is one real limitation: free sites are not indexed by search engines (they carry a noindex tag). This protects the reputation of the platform's shared infrastructure. Everything else — custom domain, multilingual content, the full block library, unlimited drafts — is included. Upgrade to a paid plan when you want Google and AI search engines to find your site.",
      ),
    },
    {
      q: resolveTranslation(t, "faq.q4.q", "Who is the free website builder best for?"),
      a: resolveTranslation(
        t,
        "faq.q4.a",
        "Anyone who needs one polished website at their own domain — freelancers, small businesses, portfolios, local services and side projects. Website resellers also use the free plan to set up client sites at no cost, then upgrade only the sites that need to be found in search.",
      ),
    },
    {
      q: resolveTranslation(t, "faq.q5.q", "Can I upgrade later without rebuilding?"),
      a: resolveTranslation(
        t,
        "faq.q5.a",
        "Yes. Upgrading is instant and keeps everything you built. The moment you upgrade, the site becomes indexable, joins the sitemap, and starts emitting structured data — no content needs to be recreated. Downgrading simply marks the site noindex again.",
      ),
    },
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };

  return (
    <div className="min-h-screen bg-background">
      <MarketingJsonLd locale={locale} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <MarketingHeader translations={translations["marketing.header"]} />

      <main>
        {/* -- HERO --------------------------------------------------------- */}
        <section className="relative overflow-hidden px-6 pt-28 pb-20 md:pt-40 md:pb-28">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,hsl(var(--primary)/0.06),transparent)]" />
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary mb-8">
              {resolveTranslation(t, "hero.badge", "Truly free — custom domain included")}
            </div>

            <h1 className="text-[2.75rem] font-extrabold tracking-tight text-foreground leading-[1.1] sm:text-6xl md:text-7xl">
              {resolveTranslation(t, "hero.title.line1", "The only truly free")}
              <br />
              <span className="text-primary">{resolveTranslation(t, "hero.title.line2", "website builder.")}</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
              {resolveTranslation(
                t,
                "hero.subtitle",
                "Build a complete, professional website — with your own custom domain and multiple languages — for free. No credit card, no time limit, no forced ads. The custom domain that other builders charge for is included on our free plan.",
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
                <Link href={`/${locale}/pricing`}>
                  {resolveTranslation(t, "hero.cta.secondary", "Compare Plans")}
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* -- WHY TRULY FREE ---------------------------------------------- */}
        <section className="px-6 py-24 md:py-32 bg-muted/30">
          <div className="mx-auto max-w-5xl">
            <div className="text-center mb-14">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
                {resolveTranslation(t, "why.badge", "What free really means")}
              </p>
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
                {resolveTranslation(t, "why.title", "A full website, not a teaser")}
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {pillars.map((pillar) => (
                <div key={pillar.key} className="rounded-2xl border border-border/40 bg-card p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 mb-4">
                    <pillar.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{pillar.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{pillar.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* -- COMPARISON -------------------------------------------------- */}
        <section className="px-6 py-24 md:py-32">
          <div className="mx-auto max-w-3xl">
            <div className="text-center mb-14">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
                {resolveTranslation(t, "compare.badge", "Free plan vs typical free tiers")}
              </p>
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
                {resolveTranslation(t, "compare.title", "What you usually have to pay for")}
              </h2>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border/40">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/40 bg-muted/50">
                    <th className="text-left py-4 px-6 font-semibold text-foreground w-1/2">
                      {resolveTranslation(t, "compare.header.capability", "Capability")}
                    </th>
                    <th className="text-center py-4 px-4 font-semibold text-primary">
                      {resolveTranslation(t, "compare.header.soss", "SoSS Free")}
                    </th>
                    <th className="text-center py-4 px-4 font-semibold text-muted-foreground">
                      {resolveTranslation(t, "compare.header.others", "Typical free tier")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {comparison.map(([key, label, soss, others]) => (
                    <tr key={key} className="hover:bg-muted/30 transition-colors">
                      <td className="py-4 px-6 font-medium text-foreground">{label}</td>
                      <td className="py-4 px-4 text-center">
                        {soss ? (
                          <Check className="inline h-4 w-4 text-primary" />
                        ) : (
                          <X className="inline h-4 w-4 text-muted-foreground/50" />
                        )}
                      </td>
                      <td className="py-4 px-4 text-center">
                        {others ? (
                          <Check className="inline h-4 w-4 text-primary" />
                        ) : (
                          <Ban className="inline h-4 w-4 text-muted-foreground/40" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* -- FAQ (native <details> — always in DOM, no client JS) -------- */}
        <section id="free-builder-faq" className="px-6 py-24 md:py-32 bg-muted/30">
          <div className="mx-auto max-w-3xl">
            <div className="text-center mb-14">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
                {resolveTranslation(t, "faq.badge", "FAQ")}
              </p>
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
                {resolveTranslation(t, "faq.title", "Questions about the free website builder")}
              </h2>
            </div>

            <dl className="rounded-2xl border border-border/50 bg-card px-6 divide-y divide-border/40">
              {faqs.map((faq) => (
                <details key={faq.q} className="group py-5">
                  <summary className="flex cursor-pointer items-center justify-between gap-4 text-sm font-medium text-foreground marker:content-none">
                    <dt>{faq.q}</dt>
                    <span className="text-muted-foreground transition-transform group-open:rotate-180" aria-hidden="true">
                      ▾
                    </span>
                  </summary>
                  <dd className="mt-3 text-sm text-muted-foreground leading-relaxed">{faq.a}</dd>
                </details>
              ))}
            </dl>
          </div>
        </section>

        {/* -- FINAL CTA --------------------------------------------------- */}
        <section className="px-6 py-24 md:py-32">
          <div className="mx-auto max-w-3xl">
            <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-linear-to-br from-primary/8 via-background to-accent/8 p-12 md:p-16 text-center">
              <h2 className="relative text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
                {resolveTranslation(t, "cta.title", "Build your free website today.")}
              </h2>
              <p className="relative mt-4 text-base text-muted-foreground max-w-lg mx-auto leading-relaxed">
                {resolveTranslation(
                  t,
                  "cta.subtitle",
                  "Your own domain, multiple languages, the full builder — at no cost. Upgrade only when you want to be found on Google and AI search engines.",
                )}
              </p>
              <div className="relative mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <Button size="lg" asChild className="px-8 h-12 text-base">
                  <Link href={appAuthUrl("sign-up", locale)}>
                    {resolveTranslation(t, "cta.primary", "Start Building Free")}
                    <ArrowRight className="ml-2 h-4 w-4" />
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
