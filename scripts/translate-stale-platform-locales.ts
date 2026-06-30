import "dotenv/config";
import { db } from "../src/5-shared/lib/db";
import { platformTranslations } from "../src/5-shared/lib/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { translatePayload } from "../src/3-features/auto-translate-content/api/translateWithGemini";

const TARGET_LOCALES = ["es", "ca", "eu", "ga", "fr", "it", "de"] as const;

const SEO_RULE =
  "This is for SEO-critical copy on a multi-tenant website builder platform. Use the keywords that people in {locale} actually search for — NOT a literal translation of the English. Research-equivalent terms for: 'free website builder', 'multilingual website builder', 'resell websites', 'website builder for agencies'. Prioritize natural, click-worthy phrasing over literal accuracy.";

type NamespaceConfig = {
  namespace: string;
  keys: string[] | "ALL";
  context: string;
};

const NAMESPACES: NamespaceConfig[] = [
  {
    namespace: "marketing.meta",
    keys: ["title", "description"],
    context: `Homepage <title> and <meta name="description"> for a multi-tenant website builder. ${SEO_RULE} Aim for a title under 60 chars and description under 160 chars.`,
  },
  {
    namespace: "marketing.pricing",
    keys: ["meta.title", "meta.description"],
    context: `Pricing page <title> and <meta name="description"> for a multi-tenant website builder. ${SEO_RULE} Aim for title under 60 chars and description under 160 chars.`,
  },
  {
    namespace: "marketing.seo-geo",
    keys: ["meta.title", "meta.description"],
    context: `SEO & GEO feature page <title> and <meta name="description"> for a multi-tenant website builder. ${SEO_RULE} Aim for title under 60 chars and description under 160 chars.`,
  },
  {
    namespace: "marketing.structured-vs-ai",
    keys: ["meta.title", "meta.description"],
    context: `"Structured vs AI" feature page <title> and <meta name="description"> for a multi-tenant website builder. ${SEO_RULE} Aim for title under 60 chars and description under 160 chars.`,
  },
  {
    namespace: "marketing.hero",
    keys: ["title.line1", "title.line2", "title.accent", "subtitle"],
    context: `Homepage hero section (headline + subtitle) for a multi-tenant website builder. Short, punchy headline components and a compelling subtitle. ${SEO_RULE}`,
  },
  {
    namespace: "marketing.free-builder",
    keys: "ALL",
    context: `Full feature page content for the "free website builder" page. This is the key differentiator page — custom domain included on free plan. ${SEO_RULE} All text: meta, hero, feature pillars, comparison table, FAQ, and CTA.`,
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
  for (const { namespace, keys, context } of NAMESPACES) {
    console.log(`\n=== ${namespace} ===`);

    // 1. Fetch English entries
    let enRows;
    if (keys === "ALL") {
      enRows = await db
        .select({ key: platformTranslations.key, value: platformTranslations.value })
        .from(platformTranslations)
        .where(and(eq(platformTranslations.namespace, namespace), eq(platformTranslations.locale, "en")));
    } else {
      enRows = await db
        .select({ key: platformTranslations.key, value: platformTranslations.value })
        .from(platformTranslations)
        .where(and(eq(platformTranslations.namespace, namespace), eq(platformTranslations.locale, "en"), inArray(platformTranslations.key, keys)));
    }

    if (enRows.length === 0) {
      console.log("  No English keys found — skipping");
      continue;
    }

    const payload: Record<string, string> = {};
    for (const row of enRows) {
      payload[row.key] = row.value;
    }
    console.log(`  ${Object.keys(payload).length} key(s) to translate`);

    // 2. Translate to each target locale
    for (const locale of TARGET_LOCALES) {
      const localeContext = context.replace("{locale}", locale);
      console.log(`  → ${locale}...`);
      try {
        const translated = await translatePayload({
          payload,
          sourceLocale: "en",
          targetLocale: locale,
          context: localeContext,
        });

        for (const [key, value] of Object.entries(translated)) {
          await upsert(namespace, key, locale, value);
        }
        console.log(`    ✓ ${Object.keys(translated).length} entries saved`);
      } catch (err) {
        console.error(`    ✗ failed —`, err instanceof Error ? err.message : err);
      }
    }
  }

  console.log("\nDone.");
}

main().catch(console.error);
