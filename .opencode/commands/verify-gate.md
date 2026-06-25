---
description: Run the type + lint gate and report whether the branch is green
agent: build
---

Run the quality gate and report results, per @AGENTS.md (green gate = done).

1. `npx tsc --noEmit` — there must be **zero** errors.
2. `npm run lint` — there must be **zero errors** (warnings are acceptable;
   React-Compiler advisories purity/immutability/set-state-in-effect are warn).

Report a short verdict: GREEN (both clean) or RED with the exact failing
file:line list. If RED, do not start fixing until I say so — just show me.

If I passed an argument, scope the mental check to it: $ARGUMENTS
