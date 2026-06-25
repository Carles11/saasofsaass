---
name: release-check
description: Pre-deploy readiness check for the SoSS engine. Use before pushing/deploying or when asked "is this ready to ship". Verifies the build gate, uncommitted work, schema/migration drift, and standards.
---

# Release check

Run a pre-deploy readiness sweep and report a single GO / NO-GO verdict with the
blocking items. Read-only checks first; do not fix anything without approval.

## Checks

1. **Build gate** — `npx tsc --noEmit` (zero errors) and `npm run lint` (zero
   errors; warnings OK). Both must be green. Note: `next build` can fail on
   Windows with an EPERM `.next` lock if the dev server is running — if so, say
   the build needs the dev server stopped, and rely on tsc+lint as the gate.

2. **Uncommitted work** — `git status --short`. Flag any uncommitted changes;
   significant work should be committed before deploy.

3. **Migration drift** — compare `src/5-shared/lib/db/schema.ts` against
   `drizzle/meta` snapshots. If schema columns exist that no migration captures
   (e.g. applied via raw SQL), flag it: future `db:generate` will misbehave.
   Recommend `/safe-db-push` to reconcile.

4. **Standards spot-check** — no raw `<img>` in tenant output (use `next/image`),
   no hardcoded user-facing strings (run `/audit-translations` on recently
   changed blocks if unsure).

5. **Env readiness** — note any feature whose env vars aren't set (e.g. Stripe
   price IDs `STRIPE_PRICE_ID_*` for live billing; Resend keys for email).

## Output

A short table: each check → PASS / WARN / FAIL, then the GO/NO-GO verdict and the
ordered list of blockers. Stop and wait before fixing anything.
