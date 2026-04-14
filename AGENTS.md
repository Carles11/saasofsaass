<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# 🤖 SoSS Agent Protocol

This file defines the strict coding standards and behavioral rules for AI Agents working on the SoSS Engine.

---

## 🏛️ Architectural Context

- **Framework:** Next.js 16.2 (App Router)
- **Architecture:** Feature-Sliced Design (FSD)
- **Multi-tenancy:** Single-codebase, data-driven rendering via internal rewrites

---

## 🛠️ Mandatory Coding Rules

### 1. FSD Gravity & Scoping

- **Downward Imports Only:** Higher layers (`app`, `1-pages`) can import from lower layers (`4-entities`, `5-shared`). Lower layers MUST NEVER import from higher layers.
- **Cross-Slice Restriction:** Slices on the same layer cannot import from each other.
- **Namespacing:**
  - `/soss` — Marketing/Factory logic
  - `/admin` — Dashboard/Workshop logic
  - `/tenant` — Public Product Engine logic

### 2. Multi-tenant Safety

- **No Hardcoded Domains:** Always use the `tenant` object or `useTenant` context.
- **Supabase Hygiene:** Every query MUST include `.eq('tenant_id', tenantId)`.
- **CSS Variables Only:** Never use hex codes for branding. Use Tailwind classes with HSL variables (e.g., `text-primary`).

### 3. The "Block" Contract

- All content must follow the `ContentBlock` interface defined in `@/4-entities/block`.
- UI must be generated via the `BlockResolver` widget.

---

## 🧪 The Wedding Test

Before finalizing any component, ask:

> *"If I change the tenant category from `'Social Work'` to `'Wedding'`, does this component break?"*

If the answer is **yes**, the logic must be abstracted.

---

