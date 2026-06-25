---
description: Safe schema sync — generate migration, show SQL, confirm, then push
---

Apply the pending schema change safely, per @AGENTS.md (schema changes are
gated). Do NOT run `db:push` until I confirm.

1. Run `npm run db:generate` and show me the **exact generated SQL** (the new
   migration file under `drizzle/`).
2. Summarize in plain language what it changes (tables, columns, constraints)
   and call out anything destructive (drops, type changes, NOT NULL on existing
   columns) explicitly.
3. Stop and wait for my explicit "push" confirmation.
4. Only after I confirm: run `npm run db:push` (or `db:migrate` if I say so) and
   report the result.

Context for this change: $ARGUMENTS
