import { MarketingHeader } from "./sections/MarketingHeader";
import { FooterSection } from "./sections/FooterSection";
import { ResellerFaq } from "./sections/ResellerFaq";
import { ResellerCalculator } from "./sections/ResellerCalculator";
import { MarketingJsonLd } from "./sections/MarketingJsonLd";
import { resolveTranslation } from "@/5-shared/lib/translations/resolve";
import { getPlatformTranslationsByNamespaces } from "@/5-shared/lib/db/platform-translations";
import { getStripePrices } from "@/5-shared/lib/billing/prices";
import { getLocale } from "next-intl/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { appAuthUrl } from "@/5-shared/lib/auth/auth-urls";
import { ArrowRight, TrendingUp, Users, Globe } from "lucide-react";

/** Add-on price per extra published site (Pro). Mirrors the Extra Site Stripe price. */
const EXTRA_SITE_PRICE = 19;

function fmt(amount: number, currency: string): string {
  const symbol = currency === "EUR" ? "€" : currency === "USD" ? "$" : `${currency} `;
  return `${symbol}${Math.round(amount).toLocaleString()}`;
}

export async function ResellerValuePage() {
  const locale = await getLocale();
  const [translations, prices] = await Promise.all([
    getPlatformTranslationsByNamespaces(
      ["marketing.header", "marketing.footer", "marketing.reseller-value"],
      locale,
    ),
    getStripePrices(),
  ]);

  const t = translations["marketing.reseller-value"] ?? {};
  const currency = prices.pro.currency;
  const pro = prices.pro.monthly;
  const enterprise = prices.enterprise.monthly;

  const baseUrl = process.env.NEXT_PUBLIC_ROOT_DOMAIN
    ? `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
    : "http://localhost:3000";
  const path = "/features/earn-by-reselling-websites";

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${baseUrl}/${locale}` },
      {
        "@type": "ListItem",
        position: 2,
        name: "Earn by Reselling Websites",
        item: `${baseUrl}/${locale}${path}`,
      },
    ],
  };

  // Concrete, citable earning scenarios (client charge fixed at €200/site/month).
  const charge = 200;
  const scenarios = [
    { sites: 1, icon: Users },
    { sites: 3, icon: TrendingUp },
    { sites: 10, icon: Globe },
  ].map(({ sites, icon }) => {
    const revenue = sites * charge;
    const cost = Math.min(pro + Math.max(0, sites - 3) * EXTRA_SITE_PRICE, enterprise);
    return { sites, icon, revenue, cost, profit: revenue - cost };
  });

  return (
    <div className="min-h-screen bg-background">
      <MarketingJsonLd locale={locale} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <MarketingHeader translations={translations["marketing.header"]} />

      <main>
        {/* -- HERO --------------------------------------------------------- */}
        <section className="relative overflow-hidden px-6 pt-28 pb-20 md:pt-40 md:pb-28">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,hsl(var(--primary)/0.06),transparent)]" />
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary mb-8">
              {resolveTranslation(t, "hero.badge", "For freelancers & agencies")}
            </div>

            <h1 className="text-[2.75rem] font-extrabold tracking-tight text-foreground leading-[1.1] sm:text-6xl md:text-7xl">
              {resolveTranslation(t, "hero.title.line1", "Resell websites.")}
              <br />
              <span className="text-primary">{resolveTranslation(t, "hero.title.line2", "Charge every month.")}</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
              {resolveTranslation(
                t,
                "hero.subtitle",
                "Build a professional, multilingual website for a client, charge them a monthly fee to manage it, and keep the difference. Start every client free — custom domain included — and upgrade only the sites that need to be found on Google. One plan covers several client sites, so your margin grows with every site you add.",
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

        {/* -- THE MATH (concrete scenarios) ------------------------------- */}
        <section aria-labelledby="math-title" className="px-6 py-24 md:py-32 bg-muted/30">
          <div className="mx-auto max-w-5xl">
            <div className="text-center mb-14">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
                {resolveTranslation(t, "math.badge", "The math")}
              </p>
              <h2 id="math-title" className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
                {resolveTranslation(t, "math.title", "What you keep at {charge}/site per month", { charge: fmt(charge, currency) })}
              </h2>
              <p className="mt-4 text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                {resolveTranslation(
                  t,
                  "math.subtitle",
                  "Assuming you charge each client {charge} per month for a managed multilingual site. Your only cost is the plan that hosts them.",
                  { charge: fmt(charge, currency) },
                )}
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {scenarios.map((s) => (
                <article key={s.sites} className="rounded-2xl border border-border/40 bg-background p-6 text-center">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 mb-4">
                    <s.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">
                    {resolveTranslation(t, `math.scenario.${s.sites}.label`, `${s.sites} client site${s.sites === 1 ? "" : "s"}`)}
                  </h3>
                  <p className="mt-4 text-3xl font-extrabold text-primary">{fmt(s.profit, currency)}</p>
                  <p className="text-xs text-muted-foreground">{resolveTranslation(t, "math.kept", "kept per month")}</p>
                  <div className="mt-4 space-y-1 text-xs text-muted-foreground border-t border-border/30 pt-4">
                    <p>{resolveTranslation(t, "math.row.revenue", "Revenue")}: {fmt(s.revenue, currency)}</p>
                    <p>{resolveTranslation(t, "math.row.plan", "Your plan")}: −{fmt(s.cost, currency)}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* -- INTERACTIVE CALCULATOR -------------------------------------- */}
        <section className="px-6 py-24 md:py-32">
          <div className="mx-auto max-w-3xl">
            <div className="text-center mb-12">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
                {resolveTranslation(t, "calc.badge", "Run your numbers")}
              </p>
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
                {resolveTranslation(t, "calc.title", "How much could you keep?")}
              </h2>
            </div>
            <ResellerCalculator
              proMonthly={pro}
              enterpriseMonthly={enterprise}
              extraSitePrice={EXTRA_SITE_PRICE}
              currency={currency}
              labels={{
                sites: resolveTranslation(t, "calc.sites", "Client sites"),
                pricePerSite: resolveTranslation(t, "calc.pricePerSite", "You charge / site / month"),
                revenue: resolveTranslation(t, "calc.revenue", "Revenue"),
                planCost: resolveTranslation(t, "calc.planCost", "Your plan"),
                profit: resolveTranslation(t, "calc.profit", "You keep"),
                margin: resolveTranslation(t, "calc.margin", "Margin"),
                perMonth: resolveTranslation(t, "calc.perMonth", "per month"),
                planNote: resolveTranslation(t, "calc.planNote", "Based on the cheapest plan for this many sites: {plan}."),
              }}
            />
          </div>
        </section>

        {/* -- FAQ --------------------------------------------------------- */}
        <ResellerFaq translations={t} />

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
                {resolveTranslation(t, "cta.title", "Turn one build into recurring revenue.")}
              </h2>
              <p className="relative mt-4 text-base text-muted-foreground max-w-lg mx-auto leading-relaxed">
                {resolveTranslation(
                  t,
                  "cta.subtitle",
                  "Start free, build your first client site, and add more as your client list grows. Your plan is the only cost between you and recurring monthly income.",
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
                  <Link href={`/${locale}/features/multilingual-website-builder`}>
                    {resolveTranslation(t, "cta.secondary", "Explore multilingual")}
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
