---
description: Audit a block or feature for hardcoded strings and missing translation seeds
argument-hint: <block or feature name>
---

Audit $ARGUMENTS for translation completeness, per @AGENTS.md.

Check:

1. **No hardcoded user-facing strings** in rendered output — headings,
   empty-states, button labels, validation/error messages, placeholders. Every
   string a tenant visitor or dashboard user sees must go through
   `resolveTranslation`. A hardcoded fallback in the third argument is fine; a
   string literal used directly in JSX is not. English stays the fallback.
2. **Seed completeness** — every key referenced in code has an entry in
   `seed-platform-translations.ts`, covering all supported locales, not just en.
3. **Namespace correctness** — new keys filed under the correct existing
   namespace (matching sibling keys), not a stray new one.
4. **Key-naming consistency** — dotted convention matching sibling features
   (e.g. `settings.domain.*`).

Report as a list: hardcoded strings (file+line), missing seed entries (which
locales), namespace/naming issues. Do not fix anything — report, then wait for
my go-ahead.
