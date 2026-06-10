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
      CreateTenantDialog/  → "Create Site" dialog (name, slug, category)
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
      category-blocks.ts   → Maps categories to BlockKind[]
      category-labels.ts   → Human labels for categories
    lib/
      auth/
        authorization.ts   → getCurrentProfile, assertTenantRole, assertCanEditContent
        sync-profile.ts    → Syncs Neon Auth user to local profiles table
        server.ts          → AuthSession type
      db/
        schema.ts          → Drizzle schema (tenants, blocks, content_items, transactions, platform_translations)
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
        categories.ts      → TenantCategory union type
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
- Categories: `src/5-shared/config/category-blocks.ts`, `src/5-shared/types/tenants/categories.ts`

---

## 🗄️ Database Schema (Drizzle + Neon)

Core tables in `src/5-shared/lib/db/schema.ts` and `src/5-shared/lib/db/schema/auth.ts`:

### `tenants`
- `id`, `name`, `slug`, `domain`, `category` (social-work | wedding)
- `locales` (text array — enabled languages per tenant)
- `defaultLocale`, `branding` (JSONB — HSL vars, logo, fonts)
- `templateId` (text, default `"default"` — slug referencing template in TypeScript config)
- `isActive`, `createdAt`, `updatedAt`

### `blocks`
- `id`, `tenantId` (FK → tenants), `type` (navbar/hero/blog-feed/awards/podcast-feed/contact)
- `order`, `isVisible`, `config` (JSONB — block settings)
- `translations` (JSONB — `{ en: { title, subtitle }, es: { ... } }`)
- `createdAt`, `updatedAt`

### `content_items` (legacy — being migrated to `tenant_entities`)
- `id`, `tenantId` (FK → tenants), `blockId` (FK → blocks)
- `type` (blog-post/award/episode/team-member)
- `order`, `isPublished`, `slug`, `coverImage`
- `data` (JSONB), `translations` (JSONB), `publishedAt`, `createdAt`, `updatedAt`

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
- `createdAt`, `updatedAt`
- Synced from Neon Auth via `sync-profile.ts`

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
- **Tenant translations:** AI-generated via Gemini 2.5. Tenant clicks "Add Language" → Gemini translates → saved to `translations` JSONB column on `blocks` and `content_items`.
- **Platform UI strings:** Stored in `platform_translations` table (namespace/key/locale/value pattern). Fetched via `getPlatformTranslations(namespace, locale)` from `src/5-shared/lib/db/platform-translations.ts`. Unique constraint on `(namespace, key, locale)`.
- **Rich content** (blog posts, awards): JSONB `translations` column on `content_items`.

---

## 🔀 Proxy Middleware (`src/proxy.ts`)

Handles 3 routing cases via hostname detection:

```
saasofsaass.com / localhost:3000        → /(marketing)
app.saasofsaass.com / app.localhost:3000 → /(dashboard)
*.saasofsaass.com / *.lvh.me / custom domains → /(tenants)/[domain]
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
NEXT_PUBLIC_DEV_ROOT_DOMAIN     # e.g. lvh.me:3000
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

### 3. Category System
- Every tenant has a `category` field (`social-work` | `wedding`)
- Categories determine which block types are available via `CATEGORY_BLOCKS` config at `src/5-shared/config/category-blocks.ts`
- BlockList uses `CATEGORY_BLOCKS[category]` to filter available block kinds
- CATEGORY_LABELS at `src/5-shared/config/category-labels.ts` provides human-readable names
- New categories are added to the `TenantCategory` union type in `src/5-shared/types/tenants/categories.ts`

### 4. Auth Pattern
- **Neon Auth** handles user sessions. API proxy at `/api/auth/[...path]/route.ts` forwards to `NEON_AUTH_BASE_URL`.
- **Origin override:** In local dev, the proxy overrides the `Origin` header to `http://localhost:3000` for subdomain requests (lvh.me, app.localhost). This is required because Neon Auth's `allow_localhost` matches only the exact string `localhost`.
- **Profile sync:** `sync-profile.ts` creates/updates a local `profiles` record when a Neon Auth user signs in (matched by email).
- **Authorization helpers** in `src/5-shared/lib/auth/authorization.ts`:
  - `getCurrentProfile()` — returns local profile by matching session email
  - `assertTenantRole(tenantId, profileId, ...roles)` — checks membership + role
  - `assertCanEditContent(tenantId, profileId)` — owner or editor
  - `assertCanManageStructure(tenantId, profileId)` — owner only
- **Roles:** `owner` (full control), `editor` (content-only — cannot add/remove blocks, reorder, manage languages, invite members)

### 5. Theme System
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

### 6. Params Pattern
- **Server components:** `getServerParams(params, searchParams)` from `@/5-shared/lib/next/params.server`
- **Client components:** `useClientParams()` from `@/5-shared/lib/next/params.client`
- Never read `params.locale` manually — next-intl owns locale

### 7. Next.js 16.2 Async Params
- `params` and `searchParams` are Promises — always `await` them
- Use `getServerParams()` helper which handles this automatically

### 8. Preview Link
- SiteBuilder shows a Preview button that links to `{slug}.lvh.me:3000/{locale}` in dev or `{slug}.saasofsaass.com/{locale}` in prod
- The "Preview" label comes from `platform_translations` table (namespace `common`, key `preview`), fetched server-side and passed as prop

---

## 🧪 The Wedding Test

Before finalizing any component, ask:

> *"If I change the tenant category from `'Social Work'` to `'Wedding'`, does this component break?"*

If yes → abstract the logic.

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
- [x] Marketing → `localhost:3000` | Dashboard → `app.localhost:3000` | Tenant → `*.lvh.me:3000`
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
- [x] "Create Site" dialog (`CreateTenantDialog`) — name/slug/category fields, creates tenant + pre-seeds blocks + owner membership
- [x] Tenant category system (`TenantCategory` union, `CATEGORY_BLOCKS` config, `CATEGORY_LABELS`)
- [x] Team management page (`/dashboard/team`) with `TeamManager` widget
- [x] Site builder UI — block list (category-filtered), block edit sheet, collection manager, entity CRUD
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

### Phase 3 — Block System Dark Mode
- [ ] Tenant template dark mode pass — all block components (NavbarBlock, HeroBlock, BlogFeedBlock, AwardsBlock, PodcastFeedBlock, ContactBlock) need semantic vars
- [ ] Add theme toggle to marketing page header
- [ ] Responsive pass on blocks
- [ ] Seed Àgora with `social-work` category
- [ ] Contact block implementation

### Phase 4 — Monetization
- [ ] Stripe integration
- [ ] `transactions` table logic (1% platform fee)
- [ ] Full marketing landing page
- [ ] SEO — canonical links, dynamic metadata, sitemap per tenant

### Testing & Infrastructure
- [ ] Zero tests (no test framework installed)
- [ ] No CI/CD configuration
- [ ] Schema deduplication (`content_items` vs `tenant_entities`)

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

| URL | Resolves to |
|---|---|
| `localhost:3000` | Marketing site |
| `app.localhost:3000` | Dashboard |
| `agora.lvh.me:3000` | Àgora tenant (or any subdomain) |
| `*.lvh.me:3000` | Any tenant |