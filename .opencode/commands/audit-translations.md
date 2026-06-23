---
description: Audit a block or feature for hardcoded strings and missing translation seeds
agent: build
---

Audit $ARGUMENTS for translation completeness, per @AGENTS.md.

Specifically check:

1. **No hardcoded English strings** anywhere in the rendered output — headings,
   empty-states, button labels, validation/error messages, placeholder text.
   Every string the end user (tenant visitor or dashboard owner) can see must
   go through `resolveTranslation`. Flag any string literal in JSX that isn't
   wrapped this way, including ones that look like reasonable defaults — a
   hardcoded fallback inside `resolveTranslation`'s third argument is fine, a
   hardcoded string used directly in JSX is not. english version must remain as fallback.
2. **Seed completeness** — confirm every translation key referenced in the
   code actually has a corresponding entry in the seed file
   (`seed-platform-translations.ts`), and that the entry covers all locales
   this project supports, not just English.
3. **Namespace correctness** — confirm new keys are filed under the correct
   existing namespace (matching sibling keys for the same feature) rather than
   introducing a stray new namespace for convenience.
4. **Key naming consistency** — confirm new keys follow the existing dotted
   naming convention already used by sibling features (e.g.
   `settings.domain.*`, `settings.typography.*`) rather than a different style.

Report back as a list: any hardcoded strings found (with file + line), any
missing seed entries (with which locales are missing, if partial), and any
namespace/naming inconsistencies. Do not fix anything yet — just report, then
wait for my go-ahead before making changes.
