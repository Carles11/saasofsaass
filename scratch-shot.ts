/**
 * Render the showcase tenant under a given template and screenshot it.
 *   ./node_modules/.bin/tsx scratch-shot.ts <templateId> [--full]
 *
 * Writes:
 *   .scratch-shots/<templateId>.png        (4:3 above-the-fold thumbnail, 1440x1080)
 *   .scratch-shots/<templateId>-full.png    (full page, when --full passed)
 */
import * as dotenv from "dotenv";
import { resolve } from "path";
import { mkdirSync } from "fs";
dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const templateId = process.argv[2] || "default";
const full = process.argv.includes("--full");
const OUT = resolve(process.cwd(), ".scratch-shots");
mkdirSync(OUT, { recursive: true });

(async () => {
  const { db } = await import("./src/5-shared/lib/db");
  const { tenants } = await import("./src/5-shared/lib/db/schema");
  const { TEMPLATES } = await import("./src/5-shared/config/templates");
  const { eq } = await import("drizzle-orm");
  const { chromium } = await import("playwright");

  // Point the showcase tenant at the requested template AND apply that
  // template's intended default palette so the screenshot shows true personality.
  const def = (TEMPLATES as any)[templateId];
  const palette = def?.defaults?.palette ?? "ocean";
  await db
    .update(tenants)
    .set({ templateId, branding: { palette } })
    .where(eq(tenants.slug, "showcase"));

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 1080 }, deviceScaleFactor: 1 });
  const url = `http://showcase.localhost:3000/en?v=${Date.now()}`;
  await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
  // Give images (picsum) a beat to paint.
  await page.waitForTimeout(1200);

  // Thumbnail: top 1440x1080 (4:3) crop.
  await page.screenshot({
    path: resolve(OUT, `${templateId}.png`),
    clip: { x: 0, y: 0, width: 1440, height: 1080 },
  });

  if (full) {
    await page.screenshot({ path: resolve(OUT, `${templateId}-full.png`), fullPage: true });
  }

  await browser.close();
  console.log(`✓ shot ${templateId} -> .scratch-shots/${templateId}.png${full ? " (+full)" : ""}`);
  process.exit(0);
})();
