import "dotenv/config";
import { db } from "../src/5-shared/lib/db";
import { platformTranslations } from "../src/5-shared/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { translatePayload } from "../src/3-features/auto-translate-content/api/translateWithGemini";

const TARGET_LOCALES = ["es", "ca", "eu", "ga", "fr", "it", "de"] as const;
const NAMESPACE = "marketing.structured-vs-ai";

async function main() {
  // 1. Fetch all English entries for the namespace
  const enRows = await db
    .select({ key: platformTranslations.key, value: platformTranslations.value })
    .from(platformTranslations)
    .where(and(eq(platformTranslations.namespace, NAMESPACE), eq(platformTranslations.locale, "en")));

  if (enRows.length === 0) {
    console.error("No English entries found for", NAMESPACE);
    process.exit(1);
  }

  const payload: Record<string, string> = {};
  for (const row of enRows) {
    payload[row.key] = row.value;
  }
  console.log(`Found ${enRows.length} English keys to translate.`);

  // 2. Translate to each target locale
  for (const locale of TARGET_LOCALES) {
    console.log(`Translating to ${locale}...`);
    try {
      const translated = await translatePayload({
        payload,
        sourceLocale: "en",
        targetLocale: locale,
        context: `Platform UI strings for the "Structured vs AI" marketing page on a SaaS website builder platform`,
      });

      // 3. Upsert each translated key
      const values = Object.entries(translated).map(([key, value]) => ({
        namespace: NAMESPACE,
        key,
        locale,
        value,
      }));

      for (const v of values) {
        await db
          .insert(platformTranslations)
          .values(v)
          .onConflictDoUpdate({
            target: [platformTranslations.namespace, platformTranslations.key, platformTranslations.locale],
            set: { value: v.value, updatedAt: new Date() },
          });
      }

      console.log(`  ✓ ${locale}: ${Object.keys(translated).length} entries saved`);
    } catch (err) {
      console.error(`  ✗ ${locale}: translation failed —`, err instanceof Error ? err.message : err);
    }
  }

  console.log("Done.");
}

main().catch(console.error);
