---
description: Approve the current plan/stage and set the rules for proceeding
---

Approved. $ARGUMENTS

Proceed under these standing rules from @AGENTS.md (🤝 Working Protocol):

- Continue in the staged order you proposed. Pause for my explicit confirmation
  between stages — do not chain straight through to the next without showing me
  the result of the current one first.
- If any schema change is involved, run `npm run db:generate` and show me the
  exact generated SQL before `npm run db:push`. Do not push automatically.
- If anything you discover contradicts a plan assumption (a missing file, a
  different data shape, an existing validation rule), stop and tell me rather
  than silently adapting.
- Keep new code inside FSD boundaries and the reuse-first rules — if about to
  duplicate something that exists, stop and point it out.
- Route every user-facing string through `resolveTranslation` and seed it — no
  hardcoded English in JSX (fallback arg is fine).
- Confirm `npx tsc --noEmit` and `npm run lint` are error-free before telling me
  a stage is ready.

Tell me clearly when the stage is done and what you need from me (approval, an
answer, or nothing) before continuing.
