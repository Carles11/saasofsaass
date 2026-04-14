# 🤖 SoSS Agent Protocol v2

This file defines the strict coding standards, architectural rules, and current project state for AI Agents working on the SoSS Engine.

---

## 🏛️ Architectural Context

- **Framework:** Next.js 16.2 (App Router, Turbopack)
- **Architecture:** Feature-Sliced Design (FSD)
- **Database:** Neon (Serverless PostgreSQL) via Drizzle ORM
- **Auth:** Neon Auth (Better Auth foundation)
- **Styling:** Tailwind v4 + shadcn/ui (Radix, Default preset, Custom theme)
- **i18n:** next-intl v4 with `[locale]` in URL
- **State:** Zustand (started, not finished)
- **Multi-tenancy:** Single-codebase, data-driven rendering via proxy middleware

---

## 📁 FSD Structure

```
src/
  1-pages/
    dashboard/        → DashboardPage component
    marketing/
    tenants/          → TenantPage component
  2-widgets/
  3-features/
  4-entities/
  5-shared/
    config/           → SUPPORTED_LOCALES (sourced from routing.ts)
    lib/
      db/
        schema.ts     → Drizzle schema (4 core tables)
        index.ts      → Neon DB client
      i18n/
        routing.ts    → next-intl routing + SUPPORTED_LOCALES + SupportedLocaleType
        request.ts    → next-intl server config
      next/
        params.server.ts  → getServerParams() — server components
        params.client.ts  → useClientParams() — client components
    messages/         → en.json, es.json, ca.json, eu.json, ga.json, fr.it, de.json
    types/            → PageContextTypes, TenantPageProps, SupportedLocaleType
app/
  [locale]/
    (dashboard)/
      dashboard/
        page.tsx
    (marketing)/
      page.tsx
    (tenants)/
      [domain]/
        page.tsx
  layout.tsx
  globals.css
  page.tsx
src/
  proxy.ts            → DNS + i18n middleware (renamed from middleware.ts in Next.js 16.2)
drizzle.config.ts
```

---

## 🗄️ Database Schema (Drizzle + Neon)

Four core tables in `src/5-shared/lib/db/schema.ts`:

### `tenants`
- `id`, `name`, `slug`, `domain`, `category`
- `locales` (text array — enabled languages per tenant)
- `defaultLocale`, `branding` (JSONB — HSL vars, logo, fonts)
- `isActive`, `createdAt`, `updatedAt`

### `blocks`
- `id`, `tenantId` (FK → tenants), `type` (hero/blog/awards/podcast/contact)
- `order`, `isVisible`, `config` (JSONB — block settings)
- `translations` (JSONB — `{ en: { title, subtitle }, es: { ... } }`)
- `createdAt`, `updatedAt`

### `content_items`
- `id`, `tenantId` (FK → tenants), `blockId` (FK → blocks)
- `type` (blog-post/award/episode/team-member)
- `order`, `isPublished`, `slug`, `coverImage`
- `data` (JSONB — type-specific fields)
- `translations` (JSONB — `{ en: { title, body }, es: { ... } }`)
- `publishedAt`, `createdAt`, `updatedAt`

### `transactions`
- `id`, `tenantId` (FK → tenants)
- `amount`, `currency`, `platformFee` (1% in cents)
- `status`, `stripeId`, `metadata` (JSONB)
- `createdAt`, `updatedAt`

### `platform_translations`
- `id`, `namespace` (common/dashboard/errors/auth), `key`, `locale`, `value`
- `createdAt`, `updatedAt`

---

## 🌍 i18n Setup

- **Locales:** `en`, `es`, `ca`, `eu`, `ga`, `fr`, `it`, `de`
- **Default:** `en`
- **URL pattern:** `/{locale}/{path}` (e.g. `/en/dashboard`, `/es/`)
- **Source of truth:** `src/5-shared/lib/i18n/routing.ts`
- **Locale resolution:** Always via `getLocale()` (server) or `useLocale()` (client) from next-intl. Never manually from params.
- **Tenant translations:** AI-generated via Gemini 2.5. Tenant clicks "Add Language" → Gemini translates → saved to `translations` JSONB column on `blocks` and `content_items`.
- **Platform UI strings:** Stored in `platform_translations` table (namespace/key/locale/value pattern).
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
- **CSS variables only:** Never hardcode hex/colors. Use Tailwind + HSL vars (e.g. `text-primary`)

### 3. The "Block" Contract
- All content follows `ContentBlock` interface from `@/4-entities/block`
- UI rendered via `BlockResolver` widget
- **Not yet implemented — this is Phase 3**

### 4. Params Pattern
- **Server components:** `getServerParams(params, searchParams)` from `@/5-shared/lib/next/params.server`
- **Client components:** `useClientParams()` from `@/5-shared/lib/next/params.client`
- Never read `params.locale` manually — next-intl owns locale

### 5. Next.js 16.2 Async Params
- `params` and `searchParams` are Promises — always `await` them
- Use `getServerParams()` helper which handles this automatically

---

## 🧪 The Wedding Test

Before finalizing any component, ask:

> *"If I change the tenant category from `'Social Work'` to `'Wedding'`, does this component break?"*

If yes → abstract the logic.

---

## ✅ What's Done (Phase 1 Complete)

- [x] FSD folder structure
- [x] Next.js 16.2 App Router with Turbopack
- [x] Neon DB connected + Drizzle ORM configured
- [x] 4 core tables schema created and pushed to Neon
- [x] Drizzle Studio working (`npm run db:studio`)
- [x] next-intl installed and configured with 8 locales
- [x] `[locale]` in URL working
- [x] `proxy.ts` middleware with 3-case DNS routing
- [x] Marketing → `localhost:3000`
- [x] Dashboard → `app.localhost:3000`
- [x] Tenant → `*.lvh.me:3000` (any subdomain)
- [x] `getServerParams` / `useClientParams` helpers
- [x] shadcn/ui initialized (Radix, Custom theme)
- [x] Zustand installed (store started, not complete)
- [x] Supabase removed
- [x] `AGENTS.md` protocol established

---

## 🔜 What's Next (Phase 2)

- [ ] Neon Auth setup (sessions, JWT, RLS)
- [ ] Tenant resolver — `useTenant` context + `getTenant(domain)` server helper
- [ ] Zustand tenant store (complete the started implementation)
- [ ] `platform_translations` seeding (en.json → DB)
- [ ] Dashboard scaffold — `/admin` layout, sidebar, nav
- [ ] Gemini AI translation flow (tenant clicks "Add Language")

---

## 🔮 Phase 3 — Block System

- [ ] `ContentBlock` interface in `@/4-entities/block`
- [ ] `BlockResolver` widget
- [ ] Hero block
- [ ] Blog block (with `content_items`)
- [ ] MONN Awards block (with `content_items`)
- [ ] Podcast block (with `content_items`)
- [ ] Contact block
- [ ] Àgora pilot tenant

---

## 🔮 Phase 4 — Monetization

- [ ] Stripe integration
- [ ] `transactions` table logic (1% platform fee)
- [ ] Marketing site (SoSS landing page)
- [ ] SEO — canonical links, dynamic metadata, sitemap per tenant

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