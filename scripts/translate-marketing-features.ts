import "dotenv/config";
import { db } from "../src/5-shared/lib/db";
import { platformTranslations } from "../src/5-shared/lib/db/schema";
import { translatePayload } from "../src/3-features/auto-translate-content/api/translateWithGemini";

/**
 * Seeds + translates the two marketing feature pages:
 *   - marketing.multilingual          (/features/multilingual-website-builder)
 *   - marketing.reseller-value        (/features/earn-by-reselling-websites)
 *
 * The English source lives here (mirroring the component fallbacks). English is
 * upserted as-is; the 7 other locales are produced with Gemini and upserted.
 *
 * Safe to re-run — every write is an idempotent upsert on
 * (namespace, key, locale). Run with:
 *   npx dotenv -e .env.local -- npx tsx scripts/translate-marketing-features.ts
 */

const TARGET_LOCALES = ["es", "ca", "eu", "ga", "fr", "it", "de"] as const;

// Strong hint so placeholder tokens survive translation intact.
const PLACEHOLDER_RULE =
  "Keep any placeholder tokens wrapped in curly braces (e.g. {charge}, {plan}) EXACTLY as they appear — do not translate or remove them.";

const SOURCES: { namespace: string; context: string; en: Record<string, string> }[] = [
  {
    namespace: "marketing.multilingual",
    context: `Marketing landing page about the multilingual / AI-translation feature of a multi-site website builder aimed at freelancers and agencies. ${PLACEHOLDER_RULE}`,
    en: {
      "meta.title": "Multilingual Website Builder — 8 Languages, AI-Translated",
      "meta.description":
        "Build and manage client websites in 8 languages. AI translates entire sites, hreflang is automatic, and there are no per-language fees. One dashboard for every site.",
      "hero.badge": "Multilingual by default",
      "hero.title.line1": "One site.",
      "hero.title.line2": "Every language.",
      "hero.subtitle":
        "Most builders make multilingual a paid add-on you configure by hand, one language at a time. SaaS of SaaS translates entire sites with AI, wires up hreflang automatically, and lets you manage every client site — in every language — from one place.",
      "hero.cta.primary": "Start Building Free",
      "hero.cta.secondary": "See Pricing",
      "pillars.title": "Multilingual that runs itself",
      "pillars.subtitle":
        "Reaching an international audience usually means translators, duplicate pages, and fragile SEO. SaaS of SaaS turns it into three things that happen automatically.",
      "pillar.ai.title": "Add a language in one click",
      "pillar.ai.body":
        "Pick a language and AI translates every block and page on the site automatically. No blank pages, no copy-pasting into translation tools, no waiting on a freelancer. Review and refine afterwards if you want — but you can launch a fully translated site in minutes.",
      "pillar.seo.title": "Found in every language",
      "pillar.seo.body":
        "Each language version gets its own clean URL and correct hreflang tags, so search engines and AI answer engines show the right version to the right audience. Your clients' sites become discoverable in every market they serve — not buried as duplicate content.",
      "pillar.reseller.title": "Your clients, their language",
      "pillar.reseller.body":
        "Every visitor is served the language that matches their browser, automatically. Offer your clients a genuinely international website — a premium capability that normally means a translator and custom development — and manage all of them from a single dashboard.",
      "grid.title": "8 languages. One site to manage.",
      "comparison.badge": "Comparison",
      "comparison.title": "Built-in multilingual vs the usual add-on",
      "comparison.header.feature": "What matters",
      "comparison.header.soss": "SaaS of SaaS",
      "comparison.header.others": "Typical builders",
      "comparison.row.languages.feature": "Multilingual publishing",
      "comparison.row.languages.soss": "Built in, AI-translated",
      "comparison.row.languages.others": "Paid add-on, per language",
      "comparison.row.translation.feature": "Translation work",
      "comparison.row.translation.soss": "AI does it for you",
      "comparison.row.translation.others": "You write every language by hand",
      "comparison.row.seo.feature": "Per-language SEO",
      "comparison.row.seo.soss": "Automatic hreflang & URLs",
      "comparison.row.seo.others": "Manual configuration",
      "comparison.row.cost.feature": "Cost to add a language",
      "comparison.row.cost.soss": "€0 — included on paid plans",
      "comparison.row.cost.others": "Monthly fee per locale",
      "comparison.row.sites.feature": "Managing client sites",
      "comparison.row.sites.soss": "All sites, one dashboard",
      "comparison.row.sites.others": "One subscription per site",
      "cta.badge": "Get started",
      "cta.title": "Offer your clients a site in every language.",
      "cta.subtitle":
        "Build it once, publish it in eight languages, and manage every client from one dashboard — no translators, no per-language fees.",
      "cta.primary": "Start Building Free",
      "cta.secondary": "See Pricing",
      "faq.badge": "FAQ",
      "faq.title": "Questions about multilingual sites",
      "faq.q1.q": "How does a visitor get the site in their own language?",
      "faq.q1.a":
        "Each visitor is served the language version that matches their browser, with proper hreflang tags telling search engines which version to show in which country. There is no clunky language-selector to hunt for — the right language simply arrives.",
      "faq.q2.q": "Do I have to translate every page by hand?",
      "faq.q2.a":
        "No. Add a language and the platform translates every block and page automatically using AI. You can review and refine any text afterwards, but you never start from a blank page — and you never hire a translator just to launch.",
      "faq.q3.q": "Which languages are supported?",
      "faq.q3.a":
        "English, Spanish, Catalan, Basque, Galician, French, Italian, and German — each with locale-specific URLs and native rendering. More languages are added over time, and every site you build can use any of them.",
      "faq.q4.q": "Does adding a language cost extra?",
      "faq.q4.a":
        "Not on paid plans. Unlike builders that charge a monthly fee per language, multilingual publishing is included — add as many languages as a site needs without a per-locale surcharge.",
      "faq.q5.q": "Is a multilingual site better for SEO?",
      "faq.q5.a":
        "Yes. Each language version gets its own crawlable URL and correct hreflang annotations, so search engines and AI answer engines index the right version for each audience instead of treating translations as duplicate content.",
      "faq.q6.q": "Can I offer multilingual sites to my own clients?",
      "faq.q6.a":
        "That is exactly who this is built for. Manage every client site from one dashboard, deliver each one in the languages its audience speaks, and charge for a premium capability that would otherwise require a translator and custom development.",
    },
  },
  {
    namespace: "marketing.reseller-value",
    context: `Marketing landing page about earning recurring revenue by reselling websites built on a multi-site website builder, aimed at freelancers and agencies. ${PLACEHOLDER_RULE}`,
    en: {
      "meta.title": "Earn by Reselling Websites — Recurring Revenue for Agencies",
      "meta.description":
        "Build a client website once, charge a monthly fee to manage it, and keep the difference. One plan covers several sites — see how much you could earn reselling multilingual websites.",
      "hero.badge": "For freelancers & agencies",
      "hero.title.line1": "Build once.",
      "hero.title.line2": "Charge every month.",
      "hero.subtitle":
        "Build a professional, multilingual website for a client, charge them a monthly fee to manage it, and keep the difference. One plan covers several client sites — so your margin grows with every site you add.",
      "hero.cta.primary": "Start Building Free",
      "hero.cta.secondary": "See Pricing",
      "math.badge": "The math",
      "math.title": "What you keep at {charge}/site per month",
      "math.subtitle":
        "Assuming you charge each client {charge} per month for a managed multilingual site. Your only cost is the plan that hosts them.",
      "math.kept": "kept per month",
      "math.row.revenue": "Revenue",
      "math.row.plan": "Your plan",
      "math.scenario.1.label": "1 client site",
      "math.scenario.3.label": "3 client sites",
      "math.scenario.10.label": "10 client sites",
      "calc.badge": "Run your numbers",
      "calc.title": "How much could you keep?",
      "calc.sites": "Client sites",
      "calc.pricePerSite": "You charge / site / month",
      "calc.revenue": "Revenue",
      "calc.planCost": "Your plan",
      "calc.profit": "You keep",
      "calc.margin": "Margin",
      "calc.perMonth": "per month",
      "calc.planNote": "Based on the cheapest plan for this many sites: {plan}.",
      "cta.badge": "Get started",
      "cta.title": "Turn one build into recurring revenue.",
      "cta.subtitle":
        "Start free, build your first client site, and add more as your client list grows. Your plan is the only cost between you and recurring monthly income.",
      "cta.primary": "Start Building Free",
      "cta.secondary": "Explore multilingual",
      "faq.badge": "FAQ",
      "faq.title": "Questions about reselling",
      "faq.q1.q": "Can I resell the websites I build to my own clients?",
      "faq.q1.a":
        "Yes — that is exactly what the platform is for. You build sites under your account, set your own price, and bill your clients directly. Your subscription is a business cost; what you charge on top is yours to keep.",
      "faq.q2.q": "How much can I charge my clients?",
      "faq.q2.a":
        "You decide. Agencies and freelancers commonly charge €150–500 per month for a managed, multilingual website plus updates. Whatever you charge, you keep the difference after your plan — and a single Pro plan covers several client sites.",
      "faq.q3.q": "Which plan should I use to resell?",
      "faq.q3.a":
        "Most resellers start on Pro, which includes three published sites and lets you add more for a small fee per site. Once you are managing around ten or more client sites, Enterprise — with unlimited sites — becomes the cheaper option.",
      "faq.q4.q": "Do my clients need their own account?",
      "faq.q4.a":
        "No. You manage every client site from one dashboard. You can invite teammates with full access, or invite editors who can only update the content of a specific site — your clients never have to touch the builder unless you want them to.",
      "faq.q5.q": "Can each client site use its own custom domain?",
      "faq.q5.a":
        "Yes. On paid plans every site can run on its own custom domain, so each client gets a professional, branded web address rather than a shared subdomain.",
      "faq.q6.q": "Is multilingual included, or is it an extra cost?",
      "faq.q6.a":
        "Multilingual publishing is included on paid plans — add as many languages as a site needs with no per-language fee. It is one of the easiest things to upsell to clients who serve an international audience.",
    },
  },
];

async function upsert(namespace: string, key: string, locale: string, value: string) {
  await db
    .insert(platformTranslations)
    .values({ namespace, key, locale, value })
    .onConflictDoUpdate({
      target: [platformTranslations.namespace, platformTranslations.key, platformTranslations.locale],
      set: { value, updatedAt: new Date() },
    });
}

async function main() {
  for (const { namespace, context, en } of SOURCES) {
    console.log(`\n=== ${namespace} (${Object.keys(en).length} keys) ===`);

    // 1. Upsert English as-is.
    for (const [key, value] of Object.entries(en)) {
      await upsert(namespace, key, "en", value);
    }
    console.log("  ✓ en saved");

    // 2. Translate + upsert each target locale.
    for (const locale of TARGET_LOCALES) {
      try {
        const translated = await translatePayload({
          payload: en,
          sourceLocale: "en",
          targetLocale: locale,
          context,
        });
        for (const [key, value] of Object.entries(translated)) {
          await upsert(namespace, key, locale, value);
        }
        console.log(`  ✓ ${locale}: ${Object.keys(translated).length} entries saved`);
      } catch (err) {
        console.error(`  ✗ ${locale}: failed —`, err instanceof Error ? err.message : err);
      }
    }
  }

  console.log("\nDone.");
}

main().catch(console.error);
