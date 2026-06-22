---
description: Approve the current plan/stage and set the rules for proceeding
agent: build
---

Approved. $ARGUMENTS

Proceed under these standing rules, consistent with how we've been working in
this project:

- Continue in the staged order you proposed. Pause for my explicit confirmation
  between stages — do not chain straight through to the next stage without
  showing me the result of the current one first.
- If any schema change is involved, run `db:generate` and show me the exact
  generated SQL before running `db:push`. Do not push automatically.
- If anything you discover while implementing contradicts an assumption from
  the plan (a file that doesn't exist where expected, a different data shape
  than assumed, a validation rule that already exists elsewhere), stop and tell
  me rather than silently adapting around it.
- Keep every new piece of code inside the FSD boundaries and reuse-first rules
  in @AGENTS.md — if you find yourself about to duplicate something that
  already exists, stop and point it out instead.
- Route every user-facing string through `resolveTranslation` and seed it via
  the existing seed-translations pattern — no hardcoded English strings,
  including empty-states and placeholder copy.
- Confirm when each stage's automated checks (TypeScript, lint, build) pass
  before telling me it's ready for the next stage.

Tell me clearly when you're done with this stage and what you need from me
(approval, an answer to an open question, or nothing further) before continuing.
