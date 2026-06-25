---
name: seo-geo-audit
description: Audit a tenant-facing block or page for SEO and GEO (AI-crawler legibility) per AGENTS.md §5. Use when reviewing or finishing any tenant-rendered output — semantic HTML, JSON-LD, alt text, crawlable links.
---

# SEO / GEO audit

Audit the named tenant-facing block/page against AGENTS.md "🧱 Block Development
Standards §5 (SEO & GEO)". This applies to **tenant-rendered output only**, never
the dashboard/builder UI.

## Checklist

1. **Semantic HTML for the content type**
   - `<section>` wraps the block; one meaningful heading per block (respect
     heading hierarchy — accept a `headingLevel` prop, don't hardcode `<h2>`).
   - `<article>` for repeatable collection items; `<dl>/<dt>/<dd>` for FAQ Q&A;
     `<address>` for location/contact info.

2. **Structured data (JSON-LD)** where a real schema.org type fits AND the data
   actually exists: `FAQPage`, `Organization`/`LocalBusiness`, `Person` (team),
   `Product`/`Offer`, `Review`/`AggregateRating` (only if a real rating exists).
   Never fabricate or emit partial structured data with missing required fields.

3. **Images** — every image has a real, descriptive `alt` from translated
   content (never "image" or a filename); uses `next/image` with width/height or
   `fill` + sized container (AGENTS §4/§6).

4. **Links** — internal links use `next/link`; external use `<a>`.

5. **Copy** — placeholders/empty-states read as concrete, specific content an AI
   crawler can understand, and go through `resolveTranslation`.

## Output

Report a pass/fail list per item with `file:line`, then proposed fixes. Do not
apply fixes until approved (per AGENTS.md Working Protocol).
