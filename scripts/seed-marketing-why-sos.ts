import "dotenv/config";
import { translatePayload } from "../src/3-features/auto-translate-content/api/translateWithGemini";
import { db } from "../src/5-shared/lib/db";
import { platformTranslations } from "../src/5-shared/lib/db/schema";

const TARGET_LOCALES = ["es", "ca", "eu", "ga", "fr", "it", "de"] as const;

const PLACEHOLDER_RULE =
  "Keep any placeholder tokens wrapped in curly braces (e.g. {charge}, {plan}) EXACTLY as they appear — do not translate or remove them.";

async function upsert(
  namespace: string,
  key: string,
  locale: string,
  value: string,
) {
  await db
    .insert(platformTranslations)
    .values({ namespace, key, locale, value })
    .onConflictDoUpdate({
      target: [
        platformTranslations.namespace,
        platformTranslations.key,
        platformTranslations.locale,
      ],
      set: { value, updatedAt: new Date() },
    });
}

async function main() {
  // 1. Seed the new nav key in marketing.header.
  const navEn = "Why SofS";
  await upsert("marketing.header", "nav.why-sos", "en", navEn);
  for (const locale of TARGET_LOCALES) {
    try {
      const translated = await translatePayload({
        payload: { value: navEn },
        sourceLocale: "en",
        targetLocale: locale,
        context: `Navigation link label for a website builder platform. Keep it very short (2-3 words). ${PLACEHOLDER_RULE}`,
      });
      await upsert("marketing.header", "nav.why-sos", locale, translated.value);
    } catch (err) {
      console.error(`  ✗ ${locale}:`, err instanceof Error ? err.message : err);
    }
  }

  // 2. Seed the new marketing.why-sos namespace.
  const SOURCE = {
    namespace: "marketing.why-sos",
    context: `Marketing homepage section titled "Why SofS?" — three feature cards that link to dedicated feature pages. The platform is a multi-site website builder for freelancers and agencies. ${PLACEHOLDER_RULE}`,
    en: {
      badge: "Why SofS?",
      title: "Built for agencies who build for clients",
      subtitle:
        "Three reasons freelancers and agencies choose SaaS of SaaS over every other website builder.",
      "card.multilingual.title": "Multilingual by Default",
      "card.multilingual.desc":
        "Build client websites in 8 languages with AI translation, automatic hreflang, and locale-specific URLs — no per-language fees, no manual translation. One dashboard to manage them all.",
      "card.multilingual.cta": "Explore multilingual",
      "card.reseller.title": "Earn Recurring Revenue",
      "card.reseller.desc":
        "Build a client site once, charge a monthly fee to manage it, and keep the difference. One plan covers several client sites, so your margin grows with every site you add.",
      "card.reseller.cta": "See the earning potential",
      "card.structured.title": "Structured, Not Just Generated",
      "card.structured.desc":
        "Most AI builders generate pages from scratch every time. SoS starts with proven website structures and uses AI where it truly shines: content, translation, and localization.",
      "card.structured.cta": "See the comparison",
    },
  };

  for (const [key, value] of Object.entries(SOURCE.en)) {
    await upsert(SOURCE.namespace, key, "en", value);
  }

  for (const locale of TARGET_LOCALES) {
    try {
      const translated = await translatePayload({
        payload: SOURCE.en,
        sourceLocale: "en",
        targetLocale: locale,
        context: SOURCE.context,
      });
      for (const [key, value] of Object.entries(translated)) {
        await upsert(SOURCE.namespace, key, locale, value);
      }
    } catch (err) {
      console.error(
        `  ✗ ${locale}: failed —`,
        err instanceof Error ? err.message : err,
      );
    }
  }
}

main().catch(console.error);
