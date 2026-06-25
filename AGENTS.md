# 🤖 SoSS Agent Protocol v2

This file defines the strict coding standards, architectural rules, and current project state for AI Agents working on the SoSS Engine.

---

## 🏛️ Architectural Context

- **Framework:** Next.js 16.2 (App Router, Turbopack)
- **Architecture:** Feature-Sliced Design (FSD)
- **Database:** Neon (Serverless PostgreSQL) via Drizzle ORM
- **Auth:** Neon Auth (Better Auth foundation) — API proxy at `/api/auth/[...path]`
- **Styling:** Tailwind v4 + shadcn/ui (Radix, Default preset, Custom theme) + `next-themes` for dark/light
- **i18n:** next-intl v4 with `[locale]` in URL
- **State:** Zustand (UI slice: sidebar toggle; tenant slice: partial)
- **Multi-tenancy:** Single-codebase, data-driven rendering via proxy middleware
- **Template Architecture:** TypeScript source of truth (`config/templates.ts`). Text slug on tenant. Appearance-only presets. No DB storage, no UUID FK, no seed script.
- **Theme:** Platform-wide dark/light via `ThemeProvider` (`next-themes`), semantic shadcn CSS vars
- **Tenant Palettes:** Per-tenant site palette (`ocean` | `sunset` | `forest`), stored in `tenants.branding.palette`, applied as a CSS class on the tenant layout wrapper — independent from the platform-wide dark/light toggle
- **Custom Domains:** Tenants can attach an external domain via the Vercel Domains API; tracked in `tenant_domains` (status: pending/pending_certificate/verified/error) with an audit trail in `tenant_domain_logs`. Routing resolves `TENANT_CUSTOM` hostnames through `tenant_domains` (status = verified), not through the unused `tenants.domain` column.
- **Blocks (current):** `navbar`, `hero`, `blog-feed`, `podcast-feed`, `awards`, `contact`, `image-gallery` — see `src/5-shared/types/tenants/blocks.ts` for the live `BlockKind` union

---

## 📁 FSD Structure

```
src/
  1-pages/
    dashboard/         → DashboardPage component
      site-builder/    → SiteBuilderPage (server, fetches translations)
      team/            → TeamPage component
    marketing/         → Marketing page (builder-focused copy)
    tenants/           → TenantPage component
  2-widgets/
    dashboard/
      CreateTenantDialog/  → "Create Site" dialog (name, slug)
      SiteBuilder/         → Block management UI + CollectionManager + BlockEditSheet + BlockList
      TeamManager/         → Team member management
      ui/sidebar/          → DashboardSidebar (collapsible, user info, nav)
    tenant/
      BlockRenderer/       → Renders blocks by type (Hero, Navbar, BlogFeed, etc.)
      header/              → TenantHeader (multi-layout: centered, sticky, minimal)
  3-features/
    manage-tenants/        → createTenant server action
    manage-entities/       → Entity CRUD (create, publish, update translations)
    manage-site-blocks/    → Block CRUD + TemplatePicker
    translations/          → AI translation + progress bar
  4-entities/
    block/                 → getBlocksByTenantId, etc.
    tenant/                → getTenantById, etc.
    tenant-content/        → getEntitiesByTenant, etc.
  5-shared/
     config/
    lib/
      auth/
        authorization.ts   → getCurrentProfile, assertTenantRole, assertCanEditContent
        sync-profile.ts    → Syncs Neon Auth user to local profiles table
        server.ts          → AuthSession type
      db/
        schema.ts          → Drizzle schema (tenants, blocks, transactions, platform_translations)
        schema/auth.ts     → Auth schema (profiles, tenant_memberships)
        index.ts           → Neon DB client
        platform-translations.ts → getPlatformTranslations() helper
        seed-platform-translations.ts → Seeds platform UI strings
      i18n/
        routing.ts         → next-intl routing + SUPPORTED_LOCALES + SupportedLocaleType
        request.ts         → next-intl server config
      next/
        params.server.ts   → getServerParams() — server components
        params.client.ts   → useClientParams() — client components
    messages/              → en.json, es.json, ca.json, eu.json, ga.json, fr.it, de.json
    store/                 → Zustand store (UI slice + StoreHydrator)
    theme/
      ThemeProvider.tsx    → next-themes wrapper (attribute="class")
      ThemeToggle.tsx      → Sun/moon toggle button
      PaletteSwitcher.tsx  → Ocean/Sunset palette toggle (localStorage)
    types/
      tenants/
        blocks.ts          → BlockKind union type
app/
  [locale]/
    (dashboard)/
      dashboard/
        page.tsx
        team/page.tsx
    (marketing)/
      page.tsx
      auth/
        sign-in/page.tsx
        sign-up/page.tsx
        login/page.tsx
        register/page.tsx
        forgot-password/page.tsx
    (tenants)/
      [domain]/
        page.tsx
        layout.tsx
  api/
    auth/[...path]/route.ts  → Auth API proxy (Origin override for dev subdomains)
  layout.tsx                  → Includes ThemeProvider
  globals.css                 → :root / .dark shadcn semantic vars
  page.tsx                    → Root redirect
  sitemap.ts                  → Dynamic sitemap (all locales + active tenants)
src/
  proxy.ts                    → DNS + i18n middleware (Next.js 16.2)
drizzle.config.ts
```

**Key paths:**

- Auth pages: `src/app/[locale]/(marketing)/auth/{sign-in,sign-up,login,register,forgot-password}/page.tsx`
- Auth API proxy: `src/app/api/auth/[...path]/route.ts`
- Schema (core): `src/5-shared/lib/db/schema.ts`
- Schema (auth): `src/5-shared/lib/db/schema/auth.ts`
- Authorization: `src/5-shared/lib/auth/authorization.ts`
- Theme: `src/5-shared/theme/ThemeProvider.tsx`, `src/5-shared/theme/ThemeToggle.tsx`
- Blocks: `src/5-shared/types/tenants/blocks.ts`

---

## 🗄️ Database Schema (Drizzle + Neon)

Core tables in `src/5-shared/lib/db/schema.ts` and `src/5-shared/lib/db/schema/auth.ts`:

### `tenants`

- `id`, `name`, `slug`, `domain`
- `locales` (text array — enabled languages per tenant)
- `defaultLocale`, `branding` (JSONB — HSL vars, logo, fonts)
- `templateId` (text, default `"default"` — slug referencing template in TypeScript config)
- `isActive`, `createdAt`, `updatedAt`

### `blocks`

- `id`, `tenantId` (FK → tenants), `type` (navbar/hero/blog-feed/awards/podcast-feed/contact)
- `order`, `isVisible`, `config` (JSONB — block settings)
- `translations` (JSONB — `{ en: { title, subtitle }, es: { ... } }`)
- `createdAt`, `updatedAt`

### `tenant_entities`

- `id`, `tenantId` (FK → tenants), `blockId` (FK → blocks, nullable)
- `kind` (blog_post/podcast_episode/award_item), `status` (draft/published/archived)
- `order`, `slug`, `coverImageUrl`, `metadata` (JSONB)
- `publishedAt`, `createdAt`, `updatedAt`

### `tenant_translations`

- `id`, `tenantId` (FK → tenants), `entityId` (FK → tenant_entities)
- `locale`, `payload` (JSONB — { title, body, excerpt }), `translationStatus`, `isLocked`
- Unique on `(entityId, locale)`

### `transactions`

- `id`, `tenantId` (FK → tenants)
- `amount`, `currency`, `platformFee` (1% in cents)
- `status`, `stripeId`, `metadata` (JSONB)
- `createdAt`, `updatedAt`

### `platform_translations`

- `id`, `namespace` (common/dashboard/errors/auth), `key`, `locale`, `value`
- **Unique constraint** on `(namespace, key, locale)`
- `createdAt`, `updatedAt`
- Seeded via `src/5-shared/lib/db/seed-platform-translations.ts`

### Auth tables (`schema/auth.ts`)

#### `profiles`

- `id` (UUID, PK), `email` (unique), `name`, `avatarUrl`
- `role` (`user` | `super_admin`, default `user`)
- `createdAt`, `updatedAt`
- Synced from Neon Auth via `sync-profile.ts`
- `super_admin` bypasses all tenant permission checks (see `authorization.ts`)
- Assigned via `seed-super-admin.ts` — run `npx dotenv -e .env.local -- npx tsx src/5-shared/lib/db/seed-super-admin.ts`

#### `tenant_memberships`

- `id`, `tenantId` (FK → tenants), `profileId` (FK → profiles)
- `role` (owner | editor)
- `createdAt`, `updatedAt`
- Unique on `(tenantId, profileId)`

---

## 🌍 i18n Setup

- **Locales:** `en`, `es`, `ca`, `eu`, `ga` (Galician), `fr`, `it`, `de`
- **Default:** `en`
- **URL pattern:** `/{locale}/{path}` (e.g. `/en/dashboard`, `/es/`)
- **Source of truth:** `src/5-shared/lib/i18n/routing.ts`
- **Locale resolution:** Always via `getLocale()` (server) or `useLocale()` (client) from next-intl. Never manually from params.
- **Platform UI strings:** Stored in `platform_translations` table (namespace/key/locale/value pattern). Fetched via `getPlatformTranslations(namespace, locale)` from `src/5-shared/lib/db/platform-translations.ts`. Unique constraint on `(namespace, key, locale)`.
- **Tenant translations:** AI-generated via Gemini 2.5. Tenant clicks "Add Language" → Gemini translates all blocks and entities → saved to `blocks.translations` JSONB column and `tenant_translations` table.

---

## 🔀 Proxy Middleware (`src/proxy.ts`)

Handles 3 routing cases via hostname detection:

```
saasofsaass.com / localhost:3000        → /(marketing)
app.saasofsaass.com / app.localhost:3000 → /(dashboard)
*.saasofsaass.com / *.localhost / custom domains → /(tenants)/[domain]
```

**Key rules:**

- next-intl runs first to handle locale redirect (307/308)
- Locale prefix is stripped before rewriting (`/en/dashboard` → `/dashboard`)
- Then DNS rewrite is applied with intl headers forwarded
- File is named `proxy.ts` (not `middleware.ts`) — renamed in Next.js 16.2

**Env vars required:**

```
DATABASE_URL
NEON_AUTH_BASE_URL
NEON_AUTH_COOKIE_SECRET
NEON_AUTH_JWKS_URL
NEXT_PUBLIC_ROOT_DOMAIN
NEXT_PUBLIC_APP_DOMAIN
GEMINI_API_KEY
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_REGION
AWS_S3_BUCKET
NEXT_PUBLIC_AWS_CLOUDFRONT_URL
```

---

## 🛠️ Mandatory Coding Rules

### 1. FSD Gravity & Scoping

- **Downward imports only:** `app` → `1-pages` → `2-widgets` → `3-features` → `4-entities` → `5-shared`
- **No cross-slice imports** on the same layer
- **Namespacing:** `/soss` marketing, `/admin` dashboard, `/tenant` public engine

### 2. Multi-tenant Safety

- **No hardcoded domains:** Always use env vars or tenant context
- **RLS mandatory:** Every Neon query MUST scope to `tenant_id`
- **CSS variables only:** Never hardcode hex/colors on platform pages. Use semantic shadcn vars (`bg-background`, `text-foreground`, `bg-card`, `text-muted-foreground`, `border-border`, etc.). Tenant template blocks may use hardcoded zinc as they are Phase 3 for dark mode.

### 3. Auth Pattern

- **Neon Auth** handles user sessions. API proxy at `/api/auth/[...path]/route.ts` forwards to `NEON_AUTH_BASE_URL`.
- **Origin override:** In local dev, the proxy overrides the `Origin` header to `http://localhost:3000` for subdomain requests (app.localhost, \*.localhost). This is required because Neon Auth's `allow_localhost` matches only the exact string `localhost`.
- **Profile sync:** `sync-profile.ts` creates/updates a local `profiles` record when a Neon Auth user signs in (matched by email).
- **Authorization helpers** in `src/5-shared/lib/auth/authorization.ts`:
  - `getCurrentProfile()` — returns local profile by matching session email
  - `assertTenantRole(tenantId, profileId, ...roles)` — checks membership + role
  - `assertCanEditContent(tenantId, profileId)` — owner or editor
  - `assertCanManageStructure(tenantId, profileId)` — owner only
- **Roles:** `owner` (full control), `editor` (content-only — cannot add/remove blocks, reorder, manage languages, invite members)

### 4. Theme System

- Dark/light mode via `next-themes` wrapped in `<ThemeProvider>` at root layout
- Toggle via `ThemeToggle` (sun/moon icon, uses `lucide-react`)
- Platform pages (marketing, auth, dashboard) use semantic shadcn CSS vars from `globals.css`:
  - `bg-background`, `text-foreground` — page level
  - `bg-card`, `text-card-foreground` — card/surface level
  - `text-muted-foreground` — secondary text
  - `bg-primary`, `text-primary-foreground` — primary actions
  - `border-border` — borders
- **Palette system:** Two color palettes available — `ocean` (blue/coral, professional) and `sunset` (terracotta/gold, warm). Applied by adding `.theme-ocean` or `.theme-sunset` class to `<html>`. Default is `ocean`. Switcher via `PaletteSwitcher` component in `5-shared/theme/PaletteSwitcher.tsx` (persists to localStorage under `soos-palette` key). Both palettes have light and dark variants.
- Tenant template blocks (Bentley template) still use hardcoded zinc colors — scheduled for Phase 3 dark mode pass

### 5. Params Pattern

- **Server components:** `getServerParams(params, searchParams)` from `@/5-shared/lib/next/params.server`
- **Client components:** `useClientParams()` from `@/5-shared/lib/next/params.client`
- Never read `params.locale` manually — next-intl owns locale

### 6. Next.js 16.2 Async Params

- `params` and `searchParams` are Promises — always `await` them
- Use `getServerParams()` helper which handles this automatically

### 7. Preview Link

- SiteBuilder shows a Preview button that links to `{slug}.localhost:3000/{locale}` in dev or `{slug}.saasofsaass.com/{locale}` in prod
- The "Preview" label comes from `platform_translations` table (namespace `common`, key `preview`), fetched server-side and passed as prop

---

## 🧱 Block Development Standards

Standing rules for every new tenant-facing block (Tier 1–4 roadmap: simple content blocks → collection blocks → richer collection blocks → ported wedding-web entity systems). Read this section before starting any block-related session — it replaces re-explaining these constraints in each prompt.

### 1. Choose the correct storage pattern first

- **Config-blob pattern** (CTA banner, Footer, Map/location, Text/rich-content, any block with a small fixed set of fields and no independently add/edit/delete-able items): store all settings in the existing `blocks.config` JSONB column. No new table. Builder UI is a plain field-list form, same shape as the existing `hero`/`contact` `fields` array in the block registry.
- **Collection pattern** (Features grid, Testimonials, Team, Logo cloud, FAQ, Pricing, Product grid, and anything where the user adds an open-ended list of items): store each item as a row in the existing `tenant_entities` table (with `blockId` pointing at the parent block) plus its translated payload in `tenant_translations`. Reuse the existing `CollectionManager` widget (`src/2-widgets/dashboard/SiteBuilder/ui/CollectionManager.tsx`) for the builder UI — do not build a new list/add/edit/delete UI from scratch. Add a new `kind` value to whatever enum/union currently lists `blog_post | podcast_episode | award_item` for `tenant_entities.kind`.
- **New-table pattern** (reserved for blocks whose data genuinely doesn't fit "translatable named items belonging to a block" — e.g. RSVP's parties/submissions, time-ranged event schedules, payment-method-specific fields): only use this when the collection pattern is a genuine mismatch. State explicitly in the plan why the collection pattern doesn't fit before introducing a new table.

If unsure which pattern applies to a given block, say so in plan mode rather than guessing.

### 2. FSD placement for a new block (mirror the existing `AwardsBlock`/`BlogFeedBlock` structure exactly)

- Block component: `src/2-widgets/tenant/BlockRenderer/blocks/{BlockName}/ui/{BlockName}.tsx`
- Registry entry: `src/2-widgets/tenant/BlockRenderer/config/registry.ts` — add the component, `defaultConfig`, and `fields` (empty array if it's a collection block managed via `CollectionManager`)
- New `BlockKind` value: `src/5-shared/types/tenants/blocks.ts`
- Any new server actions: `src/3-features/manage-site-blocks/` (block-level concerns) or `src/3-features/manage-entities/` (collection-item CRUD) — match whichever existing feature slice already owns that kind of action, don't create a new slice per block
- Block components are server components by default (no `"use client"`) unless the block genuinely needs interactivity (e.g. an FAQ accordion's expand/collapse, a carousel) — in that case isolate the interactive part into the smallest possible client child component and keep the data-fetching parent a server component
- Never add a cross-slice import at the same layer; always import downward only (`app → 1-pages → 2-widgets → 3-features → 4-entities → 5-shared`)

### 3. Reuse before building

Before writing new UI, check for and reuse:

- `CollectionManager` for any add/edit/delete list UI
- `resolveTranslation` for every user-facing string — **never hardcode English copy directly in a block component**, including empty-states and section headings (the existing `AwardsBlock`'s hardcoded `"Awards"` heading and `"No awards to display yet."` empty-state are a known gap, not a pattern to copy — route both through `resolveTranslation` for new blocks)
- Existing shadcn/ui primitives (`@/components/ui/*`) before reaching for a new dependency
- The existing image pipeline (S3 + CloudFront) for any block needing images — check how `HeroBlock`/`ImageGallery` already handle upload and `next/image` usage before reinventing it
- Semantic shadcn CSS vars (`bg-background`, `text-card-foreground`, `border-border`, etc.) — never hardcode hex colors in a new block, and respect whichever tenant palette (`ocean` / `sunset` / `forest`) and template (`bentley-default` / `bentley-modern` / `bentley-classic`) is active, the same way `TenantLayoutResolver` already applies font/palette overrides

### 4. Responsive design baseline

- Mobile-first Tailwind: base styles target the smallest viewport, then layer up with `sm:` / `md:` / `lg:` breakpoints — follow the existing grid pattern already used in `AwardsBlock` (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`) as the default content-grid shape unless a block's content genuinely needs a different layout (e.g. a single-column FAQ accordion, a full-bleed CTA banner)
- Every block must render acceptably at common breakpoints (mobile ~375px, tablet ~768px, desktop ~1280px+) — no fixed pixel widths that overflow on mobile, no text that requires horizontal scroll
- Images must use `next/image` with explicit `width`/`height` or `fill` + a sized container — never an unstyled `<img>` that can cause layout shift

### 5. SEO & GEO (AI-crawler legibility) — non-negotiable for every content block

This project's content is consumed by both traditional search crawlers and AI answer engines (LLM-based search/crawlers). Every new block must:

- Use correct semantic HTML for its content type: `<section>` wrapping the block, a single meaningful heading per block (respect document heading hierarchy — a block should not assume it's always `<h2>`; accept a `headingLevel` prop or derive it from block position if the page can have more than one of the same block type), `<article>` for repeatable items in a collection block, `<dl>`/`<dt>`/`<dd>` for FAQ-style question/answer pairs (more machine-legible than generic divs for Q&A content), `<address>` for Map/location contact info
- Add structured data (JSON-LD via a `<script type="application/ld+json">`) where a clear schema.org type applies and the data is genuinely available — `FAQPage` for the FAQ block, `Organization`/`LocalBusiness` for Map/location if address data exists, `Person` for Team members where a name/role is present, `Product`/`Offer` for the Product grid, `AggregateRating`/`Review` for Testimonials only if a rating value actually exists (never fabricate a rating). Do not add structured data for a schema with required fields the block doesn't actually collect — partial or fabricated structured data is worse than none.
- Every image needs a real, descriptive `alt` attribute sourced from the entity's translated content (never a generic placeholder like `"image"` or the filename)
- Write any static/example copy (placeholders, empty-states) as if it will be read literally by an AI crawler trying to understand what the site offers — avoid vague filler text, prefer concrete, specific example content
- Internal links within blocks (e.g. a CTA banner's button, a Pricing card's CTA) should use Next.js `<Link>` for proper prefetching and crawlability, not a bare `<a>` unless linking externally
- None of this applies to the dashboard/builder-side UI — this section is about tenant-facing rendered output only

### 6. Performance baseline

- Keep collection-block queries scoped and paginated/limited where the registry already supports a `maxItems`-style config (follow the existing `blog-feed`/`podcast-feed` `{ maxItems: 9 }` pattern for any new collection block where unbounded lists are plausible — Testimonials, Product grid, FAQ)
- Avoid client components for anything that doesn't need interactivity — every unnecessary `"use client"` boundary increases the JS shipped to the tenant's visitors
- Below-the-fold blocks with images should rely on `next/image`'s built-in lazy loading (default behavior — don't override with `priority` except for the Hero/first visible block)
- No new client-side data fetching for tenant-facing pages — all block data must be fetched server-side as part of the existing tenant page render, consistent with how every current block already works

---

## ✅ Done

### Phase 1 — Foundation

- [x] FSD folder structure
- [x] Next.js 16.2 App Router with Turbopack
- [x] Neon DB connected + Drizzle ORM configured
- [x] 4 core tables + auth tables + platform_translations schema created and pushed to Neon
- [x] Drizzle Studio working (`npm run db:studio`)
- [x] next-intl installed and configured with 8 locales
- [x] `[locale]` in URL working
- [x] `proxy.ts` middleware with 3-case DNS routing
- [x] Marketing → `localhost:3000` | Dashboard → `app.localhost:3000` | Tenant → `*.localhost:3000`
- [x] `getServerParams` / `useClientParams` helpers
- [x] shadcn/ui initialized (Radix, Custom theme)
- [x] Zustand installed (store started, not complete)
- [x] Supabase removed
- [x] `AGENTS.md` protocol established

### Phase 2 — Auth, Dashboard & Team

- [x] Neon Auth setup with API proxy route (`/api/auth/[...path]`) and Origin override for dev subdomains
- [x] Local `profiles` + `tenant_memberships` schema with roles (owner/editor)
- [x] Auth pages: sign-in, sign-up, login, register, forgot-password (all render `<AuthView />`)
- [x] Authorization helpers: `getCurrentProfile`, `assertTenantRole`, `assertCanEditContent`, `assertCanManageStructure`
- [x] Profile sync on sign-in (`sync-profile.ts`, matches by email)
- [x] Dashboard scaffold with collapsible sidebar (user info, nav links)
- [x] "Create Site" dialog (`CreateTenantDialog`) — name/slug fields, creates tenant + owner membership
- [x] Team management page (`/dashboard/team`) with `TeamManager` widget
- [x] Site builder UI — block list, block edit sheet, collection manager, entity CRUD
- [x] Entity system: blog_post, podcast_episode, award_item with per-type translation forms
- [x] Platform translations table with unique constraint `(namespace, key, locale)`
- [x] `getPlatformTranslations(namespace, locale)` helper
- [x] Platform translation seeding script (`seed-platform-translations.ts`)
- [x] Preview link in SiteBuilder (uses platform_translations, links to tenant subdomain)
- [x] Gemini AI translation flow (tenant clicks "Add Language")

### Phase 2b — SEO & Theme

- [x] Marketing page `generateMetadata` — per-locale title/description (8 locales), OG, Twitter, hreflang, canonical
- [x] Tenant page `generateMetadata` — dynamic from tenant data
- [x] Dynamic sitemap — all locale marketing pages + all active tenant sites
- [x] Marketing page copy rewritten to be builder-focused
- [x] `ThemeProvider` (`next-themes`, `attribute="class"`) at root layout
- [x] `ThemeToggle` (sun/moon using lucide-react)
- [x] All platform pages use semantic shadcn CSS vars (marketing, auth, dashboard, site builder, team)
- [x] Two color palettes (Ocean, Sunset) with light/dark variants, switchable via PaletteSwitcher
- [x] Marketing page restructured with nav header (language selector, theme/palette toggles, sign in/up) + sections (Hero, Features, Pricing, Testimonials, FAQ, CTA, Footer)

### Phase 2c — Category & Schema Cleanup

- [x] Removed category system: `TenantCategory` type, `CATEGORY_BLOCKS`/`CATEGORY_LABELS` configs, category column from tenants table
- [x] Removed category selector from CreateTenantDialog, category filter from BlockList
- [x] Removed TONE_PRESETS from translateWithGemini (category-based tone)
- [x] Dropped legacy `content_items` table (migrated to `tenant_entities` + `tenant_translations`)
- [x] Updated all docs to reflect schema/architecture changes

### Phase 2d — Image Gallery Block

- [x] `image-gallery` block kind added — S3-backed gallery with per-image alt/caption translations

### Phase 2e — Custom Domains & Subdomain Management

- [x] `tenant_domains` table (status: pending/pending_certificate/verified/error, dnsInstructions, lastError) + `tenant_domain_logs` audit table
- [x] Vercel Domains API integration (`src/5-shared/lib/vercel/vercel-domains.ts`) — add/remove/verify, two-phase status check (ownership + DNS config)
- [x] Apex + www redirect orchestration with rollback on failure
- [x] `manage-custom-domain` feature slice — `addCustomDomain`, `verifyCustomDomain`, `removeCustomDomain`, `getDomains` server actions
- [x] `CustomDomainSection` in Settings tab — pending/pending-certificate/verified/error states, DNS instructions modal, "forward to a tech-savvy friend" delegate-email flow
- [x] Proxy + `getTenantByDomain` rewired to resolve `TENANT_CUSTOM` hostnames via `tenant_domains` (not the unused `tenants.domain` column)
- [x] Subdomain rename — `updateTenantSlug` action (uniqueness + reserved-word validation, no plan gate), `SubdomainSection` UI, explicit tenant-cache eviction on rename
- [x] Plan gate: custom domains are Pro-only

### Phase 2f — Typography, Palette & SEO Indexing

- [x] Font registry (`fontRegistry.ts`/`fontLoader.ts`) — 5 heading fonts + 4 body fonts via `next/font/google`, stored as CSS var refs in `tenants.branding`
- [x] `TypographySection` — heading/body font selects with live preview, auto-save, available on all plans
- [x] Third tenant palette (`forest`) added alongside `ocean`/`sunset`; `PaletteSection` UI, applied via CSS class on tenant layout wrapper (not `<html>`)
- [x] `seoEnabled` column on `tenants` (default `true`) — drives `generateMetadata` robots index/follow on the tenant page
- [x] `SeoSection` — toggle to disable indexing, Pro-only to turn off, Free/Starter always indexed
- [x] `AGENTS.md` Block Development Standards section established (storage pattern decision tree, FSD placement, reuse-first, responsive/SEO-GEO/performance baselines for all future blocks)

### Bug Fixes

- [x] `ga` locale changed from Irish to Galician
- [x] `defaultLocale` validation accepts `undefined` (defaults to `"en"`)
- [x] Auth API Origin override for dev subdomains (fixes "Invalid origin" in Neon Auth)
- [x] `suppressHydrationWarning` on `<html>` (fixes browser extension hydration mismatch)
- [x] Tenant layout uses subdomain-based slug lookup, uncommented `<TenantHeader />`

---

## 🔜 What's Next

### High Priority

- [ ] Zustand tenant store (complete partial implementation)
- [ ] Tenant resolver — `useTenant` context + `getTenant(domain)` server helper
- [ ] RLS / row-level security on all DB queries

### Phase 3 — Block Roadmap

New tenant-facing blocks, grouped by storage pattern and build order (see 🧱 Block Development Standards above for the storage-pattern decision tree and per-block requirements):

**Tier 1 — config-blob blocks (no new tables, `blocks.config` JSONB only)**

- [x] Text/rich-content
- [x] CTA banner
- [x] Footer (confirm whether currently hardcoded per template before treating as net-new)
- [x] Map/location

**Tier 2 — collection blocks (reuse `tenant_entities` + `CollectionManager`)**

- [ ] Features/Services grid
- [ ] Testimonials
- [ ] Team/people grid
- [ ] Logo cloud / "trusted by" (editable section title)
- [ ] FAQ

**Tier 3 — collection blocks with nested fields**

- [ ] Pricing (tiers with nested feature checklists, configurable CTA URL — no commerce dependency)
- [ ] Product/shop grid (external checkout link per product — no commerce dependency)

**Tier 4 — ported from the reference wedding-platform app, new tables required**

- [ ] Program/Events (schedule/timeline collection, time-range fields)
- [ ] Donations (payment-method collection)
- [ ] Recommendations (merged accommodation + points-of-interest, category-tagged)
- [ ] RSVP (parties, submissions, settings, public-facing form route, bulk import, analytics — own dedicated session)

### Phase 3b — Block System Dark Mode & Responsive

- [ ] Tenant template dark mode pass — confirm remaining block components (NavbarBlock, HeroBlock, BlogFeedBlock, AwardsBlock, PodcastFeedBlock, ContactBlock, ImageGallery) all use semantic vars, not hardcoded zinc
- [ ] Responsive pass on existing blocks

### Phase 4 — Monetization

- [ ] Stripe integration
- [ ] `transactions` table logic (1% platform fee)
- [ ] Full marketing landing page
- [ ] Per-tenant sitemap entries beyond the existing dynamic sitemap

### Testing & Infrastructure

- [ ] Zero tests (no test framework installed)
- [ ] No CI/CD configuration

---

## 📝 Commit Standard

- Use conventional commits: `feat:`, `fix:`, `chore:`, `refactor:`
- Reference GitHub Issue ID if available (e.g. `feat: setup middleware #40`)

---

## 🧰 Key Scripts

```bash
npm run dev          # Start dev server
npm run db:push      # Push schema changes to Neon
npm run db:generate  # Generate migration files
npm run db:migrate   # Run migrations
npm run db:studio    # Open Drizzle Studio
```

---

## 🌐 Local Dev URLs

| URL                    | Resolves to                     |
| ---------------------- | ------------------------------- |
| `localhost:3000`       | Marketing site                  |
| `app.localhost:3000`   | Dashboard                       |
| `agora.localhost:3000` | Àgora tenant (or any subdomain) |
| `*.localhost:3000`     | Any tenant                      |

---

## 🤝 Working Protocol & AI Agent Routing

This section is the **shared contract for every AI tool** working in this repo
(Claude Code and OpenCode both read this file). The tool-specific wrappers in
`.claude/` and `.opencode/` are thin and defer to the rules here.

### Standing working rules (apply to every change)

- **Stage and pause.** Work in the staged order proposed. After each stage, show
  the result and wait for explicit approval before starting the next — do not
  chain straight through.
- **Plan before non-trivial code.** For a new block, feature, or schema change,
  produce a plan (storage pattern, FSD placement, reuse check, schema diff,
  translation keys, plan gating) and get approval before writing.
- **Schema changes are gated.** Run `npm run db:generate` and show the exact
  generated SQL before `npm run db:push`. Never push automatically.
- **Green gate = done.** A stage is only "ready" when `npx tsc --noEmit` and
  `npm run lint` report **zero errors**. TypeScript is the strict correctness
  gate; React-Compiler lint advisories (`purity`, `immutability`,
  `set-state-in-effect`) are warnings, not blockers.
- **No hardcoded user-facing strings.** Every visible string (headings,
  empty-states, buttons, errors, placeholders) goes through `resolveTranslation`
  with an English fallback, and its key is seeded for all locales — see the
  `/audit-translations` command.
- **Reuse-first & FSD.** Downward imports only
  (`app → 1-pages → 2-widgets → 3-features → 4-entities → 5-shared`); no
  cross-slice imports on the same layer. If about to duplicate something that
  exists, stop and point it out.
- **Surface contradictions.** If reality differs from the plan (missing file,
  different data shape, existing validation), stop and report rather than
  silently adapting.

### Model routing (token economy)

Use the cheapest model that fits the task. Subagents declare their model in
their own definition; the main/orchestrating session's model is the operator's
choice per session.

| Work | Model tier |
| --- | --- |
| Locate code, "where is X", read-only mapping | **haiku** (`explorer`) |
| Docs, README, AGENTS edits, comments, commit bodies | **haiku** (`docs-writer`) |
| Implement a block / feature, refactor, tests | **sonnet** (`block-builder`) |
| Architecture, multi-system design, hard debugging | **opus** (main session) |

### Shared commands (mirrored in `.claude/commands/` and `.opencode/commands/`)

| Command | Purpose |
| --- | --- |
| `/plan-block` | Plan a new tenant block (plan-only, stops for approval) |
| `/approve-stage` | Approve current stage + restate standing rules |
| `/audit-translations` | Audit a block/feature for hardcoded strings & seed gaps |
| `/verify-gate` | Run tsc + lint; report green/red |
| `/safe-db-push` | `db:generate` → show SQL → confirm → `db:push` |

### Subagents (mirrored in `.claude/agents/` and `.opencode/agent/`)

| Agent | Model | Scope |
| --- | --- | --- |
| `explorer` | haiku | read-only code search & feature mapping |
| `block-builder` | sonnet | implement a tenant block per §🧱 |
| `docs-writer` | haiku | documentation & comments only |
