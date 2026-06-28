/**
 * Seed script — Super admin
 *
 * Assigns the super_admin role to a specific profile by email.
 * A super_admin bypasses all tenant-level permission checks.
 *
 * Run from soos-engine/:
 *   npx dotenv -e .env.local -- npx tsx src/5-shared/lib/db/seed-super-admin.ts
 *
 * Idempotent: re-running with the same email is safe.
 */

import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });

import { neon } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import { profiles } from "./schema/auth";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema: { profiles } });

// ── CONFIG ──────────────────────────────────────────────
const SUPER_ADMIN_EMAIL = "carles@rio-frances.com";

async function main() {
  console.log("👑  Seeding super admin…\n");

  const [existing] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.email, SUPER_ADMIN_EMAIL))
    .limit(1);

  if (!existing) {
    console.error(`  ✗ No profile found for "${SUPER_ADMIN_EMAIL}".`);
    console.error("    Ensure the user has signed in at least once.");
    process.exit(1);
  }

  if (existing.role === "super_admin") {
    console.log(`  ✓ ${SUPER_ADMIN_EMAIL} is already a super_admin.`);
    process.exit(0);
  }

  await db
    .update(profiles)
    .set({ role: "super_admin" })
    .where(eq(profiles.email, SUPER_ADMIN_EMAIL));

  console.log(`  ✓ ${SUPER_ADMIN_EMAIL} promoted to super_admin.`);
  console.log(
    "\n🎉  Done. Sign out and sign back in for the role to take effect.",
  );
}

main().catch((err) => {
  console.error("\n❌  Seed failed:", err);
  process.exit(1);
});
