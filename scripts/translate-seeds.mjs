import { GoogleGenerativeAI } from "@google/generative-ai";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

// ── Config ─────────────────────────────────────────────────────────────────┬
const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) throw new Error("GEMINI_API_KEY not set");

const TARGET_LOCALES = ["es", "ca", "fr", "de", "it", "eu", "ga"];
const ALL_LOCALES = ["en", ...TARGET_LOCALES];

const TARGET_NAMESPACES = [
  "dashboard.site-builder",
  "dashboard.billing",
  "dashboard.blocks",
  "dashboard.collection",
  "dashboard.settings",
  "dashboard.team-manager",
  "dashboard.create-tenant",
  "dashboard.block-edit",
  "dashboard.page",
  "marketing.testimonials",
  "marketing.meta",
];
const TARGET_FOOTER_KEYS = [];

const FILE = resolve(ROOT, "src/5-shared/lib/db/seed-platform-translations.ts");

// ── Parse file ──────────────────────────────────────────────────────────────
function parseEntries(filePath) {
  const text = readFileSync(filePath, "utf-8");
  const lines = text.split("\n");

  // Find SEEDS array bounds
  const seedsStart = lines.findIndex((l) => l.trim().startsWith("const SEEDS:"));
  const seedsEnd = lines.findIndex((l, i) => i > seedsStart && l.trim() === "];");
  if (seedsStart < 0 || seedsEnd < 0) throw new Error("Could not find SEEDS array");

  const seedLines = lines.slice(seedsStart, seedsEnd + 1);

  // Extract individual entries by finding top-level `{` / `},` pairs
  const entries = [];
  let depth = 0;
  let entryStart = -1;
  for (let i = 0; i < seedLines.length; i++) {
    const line = seedLines[i];
    const trimmed = line.trim();

    if (trimmed === "{") {
      if (depth === 0) entryStart = i;
      depth++;
    }
    if (trimmed === "}," || trimmed === "}") {
      depth--;
      if (depth === 0 && entryStart >= 0) {
        entries.push({
          start: seedsStart + entryStart,
          end: seedsStart + i,
          lines: seedLines.slice(entryStart, i + 1),
        });
        entryStart = -1;
      }
    }
  }

  return { text, lines, entries };
}

function getEntryInfo(entryLines) {
  let namespace = "", key = "", enText = "", hasNonEn = false;

  for (const line of entryLines) {
    const t = line.trim();
    const nsMatch = t.match(/namespace:\s*"([^"]+)"/);
    if (nsMatch) namespace = nsMatch[1];

    const keyMatch = t.match(/key:\s*"([^"]+)"/);
    if (keyMatch) key = keyMatch[1];

    if (t.includes('en:') && !t.includes('es:') && !t.includes('ca:') && !t.includes('fr:') && !t.includes('de:') && !t.includes('it:') && !t.includes('eu:') && !t.includes('ga:')) {
      // This entry might be English-only - check all lines
    }
  }

  // Check if the translations span multiple lines or are inline
  const joined = entryLines.join("\n");

  // Check for non-English locales anywhere
  for (const loc of TARGET_LOCALES) {
    if (joined.includes(`${loc}:`)) {
      hasNonEn = true;
      break;
    }
  }

  // Extract English text
  const enMatch = joined.match(/en:\s*"((?:[^"\\]|\\.)*)"/);
  if (enMatch) {
    enText = enMatch[1];
  }

  return { namespace, key, enText, hasNonEn };
}

function findEnglishOnlyEntries(entries) {
  const result = [];

  for (const entry of entries) {
    const info = getEntryInfo(entry.lines);

    // Check if this is a target namespace, or a target footer key
    const isTargetNs = TARGET_NAMESPACES.includes(info.namespace);
    const isTargetFooterKey = info.namespace === "marketing.footer" && TARGET_FOOTER_KEYS.includes(info.key);

    if (!isTargetNs && !isTargetFooterKey) continue;
    if (info.hasNonEn) continue;
    if (!info.enText) continue;

    result.push({
      ...info,
      originalLines: entry.lines,
      lineStart: entry.start,
      lineEnd: entry.end,
    });
  }

  return result;
}

// ── Gemini translation ──────────────────────────────────────────────────────
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

function buildPrompt(locale, texts, namespace) {
  const localeName = {
    es: "Spanish",
    ca: "Catalan",
    fr: "French",
    de: "German",
    it: "Italian",
    eu: "Basque",
    ga: "Galician",
  }[locale];

  const numbered = texts.map((t, i) => `${i + 1}. "${t}"`).join("\n");
  return `Translate these ${texts.length} English strings to ${localeName} (${locale}). These are UI strings for a SaaS platform's "${namespace}" section (legal/cookie/privacy/structured-vs-AI website content). Keep any template variables like {count}, {list}, {year}, {name}, {used}, {limit}, {plan}, {kind}, {seconds}, {namespace}, {key} unchanged. Keep HTML tags and special characters like \\u2019 unchanged. Return ONLY a valid JSON array of strings in the exact same order. No explanation, no markdown, no numbering.

${numbered}`;
}

async function translateBatch(locale, texts, namespace) {
  if (texts.length === 0) return [];

  const prompt = buildPrompt(locale, texts, namespace);
  console.log(`  → Translating ${texts.length} strings to ${locale} (${namespace})`);

  const result = await model.generateContent(prompt);
  const response = result.response.text().trim();

  // Parse JSON array from response
  let translations;
  try {
    // The response might be wrapped in ```json ... ``` or just raw JSON
    const jsonMatch = response.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/);
    const jsonStr = jsonMatch ? jsonMatch[1] : response;
    translations = JSON.parse(jsonStr);
  } catch (e) {
    console.error(`Failed to parse Gemini response for ${locale}:`);
    console.error(response);
    // Try again with simpler prompt
    const retryResult = await model.generateContent(
      `Translate these English strings to ${locale}. Return ONLY a JSON array: ${JSON.stringify(texts)}`
    );
    const retryResponse = retryResult.response.text().trim();
    const jsonMatch = retryResponse.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      translations = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error(`Cannot parse Gemini response for ${locale} even after retry`);
    }
  }

  if (!Array.isArray(translations) || translations.length !== texts.length) {
    console.error(`Expected ${texts.length} translations, got ${translations?.length}`);
    console.error(`Response: ${response}`);
    throw new Error(`Mismatched translation count for ${locale}`);
  }

  return translations;
}

// ── Build replacements ──────────────────────────────────────────────────────
function buildReplacementText(enText, translations) {
  const parts = [`en: "${enText}"`];
  for (let i = 0; i < TARGET_LOCALES.length; i++) {
    const locale = TARGET_LOCALES[i];
    const translated = translations[i];
    // Escape backslashes and double quotes for JS string
    const escaped = translated.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n").replace(/\r/g, "");
    parts.push(`${locale}: "${escaped}"`);
  }
  return parts.join(",\n      ");
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log("📖 Parsing seed file...");
  const { text, lines, entries } = parseEntries(FILE);
  const englishOnly = findEnglishOnlyEntries(entries);

  console.log(`\n📦 Found ${englishOnly.length} entries needing translation:\n`);
  const byNs = {};
  for (const e of englishOnly) {
    if (!byNs[e.namespace]) byNs[e.namespace] = [];
    byNs[e.namespace].push(e);
  }
  for (const [ns, entries] of Object.entries(byNs)) {
    console.log(`  ${ns}: ${entries.length} entries`);
  }

  // Group by namespace for batch translation
  const nsGroups = {};
  for (const e of englishOnly) {
    const ns = e.namespace;
    if (!nsGroups[ns]) nsGroups[ns] = [];
    nsGroups[ns].push(e);
  }

  let totalCalls = 0;
  for (const [ns, items] of Object.entries(nsGroups)) {
    const enTexts = items.map((i) => i.enText);
    console.log(`\n🌐 Translating namespace: ${ns} (${items.length} strings)`);

    for (const locale of TARGET_LOCALES) {
      totalCalls++;
      const translations = await translateBatch(locale, enTexts, ns);

      // Assign translations back to items
      for (let i = 0; i < items.length; i++) {
        if (!items[i].translations) items[i].translations = {};
        items[i].translations[locale] = translations[i];
      }

      // Delay between calls to avoid rate limiting
      if (totalCalls < Object.keys(nsGroups).length * TARGET_LOCALES.length) {
        await new Promise((r) => setTimeout(r, 500));
      }
    }
  }

  console.log(`\n✍️  Writing translations back to file...`);

  // Process entries in REVERSE order so splices don't shift earlier indices
  const sorted = [...englishOnly].sort((a, b) => b.lineStart - a.lineStart);
  const modifiedLines = [...lines];

  for (const item of sorted) {
    const startLine = item.lineStart;
    const endLine = item.lineEnd;

    // Build the translation lines block
    const translationLines = [];
    translationLines.push(`      en: "${item.enText}",`);
    for (const locale of TARGET_LOCALES) {
      const translated = item.translations[locale];
      const escaped = translated.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n").replace(/\r/g, "");
      translationLines.push(`      ${locale}: "${escaped}",`);
    }

    // Find the translations: t({ ... }) lines within the entry range
    let inTranslations = false;
    let translStart = -1;
    let translEnd = -1;

    for (let i = startLine; i <= endLine && i < modifiedLines.length; i++) {
      const t = modifiedLines[i].trim();
      if (t === "translations: t({") {
        inTranslations = true;
        translStart = i;
      } else if (inTranslations && (t === "})," || t === "})" || t.startsWith("}),") || t.startsWith("})"))) {
        translEnd = i;
        break;
      } else if (t.startsWith("translations: t({") && t.endsWith("}),")) {
        translStart = i;
        translEnd = i;
        break;
      } else if (t.startsWith("translations: t({") && t.endsWith("})")) {
        translStart = i;
        translEnd = i;
        break;
      }
    }

    if (translStart < 0) {
      console.error(`Could not find translations block for ${item.namespace}.${item.key}`);
      continue;
    }

    if (translStart === translEnd) {
      // Inline → expand to multi-line
      const indent = modifiedLines[translStart].match(/^\s*/)[0];
      modifiedLines[translStart] = `${indent}translations: t({\n${translationLines.map(l => indent + l).join("\n")}\n${indent}}),`;
    } else {
      // Multi-line → replace body lines
      const indent = modifiedLines[translStart].match(/^\s*/)[0];
      const bodyLines = translationLines.map(l => indent + l);
      modifiedLines.splice(translStart + 1, translEnd - translStart - 1, ...bodyLines);
    }
  }

  writeFileSync(FILE, modifiedLines.join("\n"), "utf-8");

  // Summary
  console.log(`\n✅ Done! Summary:\n`);
  let totalTranslated = 0;
  for (const [ns, items] of Object.entries(byNs)) {
    console.log(`  ${ns}: ${items.length} entries × 7 languages = ${items.length * 7} translations`);
    totalTranslated += items.length * 7;
  }
  console.log(`\n  Total: ${totalTranslated} individual translations across ${TARGET_LOCALES.length} languages`);
  console.log(`  API calls: ${totalCalls}`);
  console.log(`  File: ${FILE}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
