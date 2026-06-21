---
description: Start a new tenant block plan-mode session, grounded in AGENTS.md standards
agent: plan
---

Plan mode first, per @AGENTS.md — specifically the "🧱 Block Development Standards"
section. Do not write or edit any files until I explicitly approve the plan.

Block to plan: $ARGUMENTS

Before producing the plan, investigate and state explicitly:

1. **Storage pattern** — which of the three patterns from the Block Development
   Standards decision tree applies (config-blob on `blocks.config`, collection via
   `tenant_entities` + `CollectionManager`, or a genuinely new table). If new-table,
   justify why the collection pattern doesn't fit before proposing it.
2. **Structural template** — which existing block (`AwardsBlock`, `BlogFeedBlock`,
   `PodcastFeedBlock`, `ContactBlock`, `HeroBlock`, `ImageGallery`) most closely
   matches this one's shape, and confirm you're mirroring its FSD placement,
   server-component-by-default approach, and `resolveTranslation` usage exactly.
3. **Reuse check** — confirm whether `CollectionManager`, existing shadcn
   primitives, the S3/CloudFront image pipeline, or any other existing piece
   covers part of this block's needs, before proposing anything new.
4. **SEO/GEO** — which semantic HTML elements and which schema.org JSON-LD type
   (if any) apply to this block's content, per the Block Development Standards
   section 5. State plainly if no structured data applies rather than forcing one.
5. **Schema diff** — if any new column, table, or `BlockKind` value is needed,
   show the exact Drizzle diff. If none is needed, say so explicitly.
6. **Translation keys** — list every new key this block will need, under the
   correct namespace.
7. **Plan gating** — state whether this block is available on all plans or
   gated, and to which tier, based on prior direction in this conversation or by
   asking me if it hasn't been decided yet. Do not assume a gate exists or
   doesn't — confirm.

Deliverable: file tree of new/modified files, the schema diff (or confirmation
none is needed), the FSD placement for each new file, the translation key list,
and any open questions that need my answer before you proceed. Wait for my
approval before writing any code.
