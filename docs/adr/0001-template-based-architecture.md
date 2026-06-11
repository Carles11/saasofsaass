# ADR 0001: Template Architecture — TypeScript Source of Truth

**Status:** Approved
**Date:** 2026-06-10

## Context

The SoSS platform needs a template system for tenant appearance presets.
Templates define CSS classes and layout containers that control visual styling.

Two approaches were evaluated:
- **Database-centric:** Templates stored in a DB table with UUID foreign key,
  full configuration in JSONB, seeded from a TypeScript script.
- **TypeScript-centric:** Templates defined in code, DB stores only a text
  slug reference.

## Decision

Templates are **presentation presets, not content.** They are developer-defined
product code, version-controlled in Git, and expected to remain a small finite
set (3–10). Therefore:

- Template definitions live exclusively in `src/5-shared/config/templates.ts`.
- `tenants.template_id` is a simple text column with default `"default"`.
- Valid values: `"default"`, `"modern"`, `"classic"`.
- Runtime resolves templates via `TEMPLATES[tenant.templateId] || TEMPLATES.default`.
- No templates table, no UUID FK, no seed script, no JSONB configuration
  stored in the database.

## Rationale

- Templates are structural presets, not user-generated content. They define
  which CSS classes wrap the tenant's public site.
- A database-centric approach pays complexity cost (migration risk, extra
  queries, seed script maintenance, drift between seed and database) for
  benefits this system does not need (admin-editable templates, 100+ template
  scale, multi-user template management).
- TypeScript provides compile-time safety via the union type, zero runtime
  overhead, perfect git auditability, and trivial deployment.
- The `TEMPLATES.default` fallback ensures no broken UI even if a tenant has
  an unrecognized or null template_id.

## Consequences

- Template switching is a single text field update (`tenant.templateId`).
  Content (blocks, entities, translations, images) is never touched.
- Adding a template = edit one TypeScript file. No migration, no seed.
- The `updateTenantTemplate` action writes only `{ templateId }` to the
  tenants table. No content table is ever modified.

## Rejected Alternatives

- **Database source of truth:** Rejected because templates are product code,
  not user content. A JSONB configuration column in the database would be dead
  data — runtime reads from TypeScript exclusively. UUID FK conversion added
  migration risk without solving any real integrity gap, since the TypeScript
  union type plus runtime fallback already provide safety.
- **Thin registry table (UUID FK + slug only):** Rejected because the same
  integrity protection is provided by the TypeScript union type at compile time
  and the `|| TEMPLATES.default` fallback at runtime. The extra join or query
  per page load was not justified.
