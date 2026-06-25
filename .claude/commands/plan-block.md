---
description: Start a plan-mode session for a new tenant block, grounded in AGENTS.md
argument-hint: <block name>
---

Plan only — do NOT write or edit any files until I explicitly approve. Ground
everything in @AGENTS.md, especially "🧱 Block Development Standards".

Block to plan: $ARGUMENTS

Investigate and state explicitly:

1. **Storage pattern** — config-blob (`blocks.config`), collection
   (`tenant_entities` + `CollectionManager`), or new table. If new table,
   justify why the collection pattern doesn't fit.
2. **Structural template** — which existing block (Awards, BlogFeed, Podcast,
   Contact, Hero, ImageGallery) this mirrors; confirm matching FSD placement,
   server-component default, and `resolveTranslation` usage.
3. **Reuse check** — whether CollectionManager, shadcn primitives, the
   S3/CloudFront pipeline, or anything else covers part of this before proposing
   new code.
4. **SEO/GEO** — which semantic HTML and which schema.org JSON-LD type (if any)
   apply. Say plainly if none fits.
5. **Schema diff** — exact Drizzle diff for any new column/table/`BlockKind`
   value, or state none is needed.
6. **Translation keys** — every new key, under the correct namespace.
7. **Plan gating** — which plan tier (if any) gates this block; ask if undecided.

Deliverable: file tree of new/modified files, schema diff (or none), FSD
placement per file, the translation-key list, and open questions. Wait for my
approval before any code.
