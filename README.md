# SoSS Engine (SaaS of SaaSs)

A **multi-tenant website factory** — a single Next.js codebase that dynamically renders unique, multilingual websites for different organizations (tenants). Built around a modular "Content Block" engine rather than static templates.

---

## Tech Stack

| Category | Technology |
|---|---|
| **Framework** | Next.js 16.2 (App Router, Turbopack) |
| **Language** | TypeScript 5.x, React 19.2 |
| **Database** | Neon (Serverless PostgreSQL) via Drizzle ORM 0.45 |
| **Auth** | Neon Auth (Better Auth foundation) |
| **Styling** | Tailwind CSS v4 + shadcn/ui |
| **Animations** | Framer Motion 12.x |
| **Icons** | Lucide React |
| **UI State** | Zustand 5.x |
| **i18n** | next-intl 4.x (8 locales: en, es, ca, eu, ga, fr, it, de) |
| **AI** | Google Gemini 2.5 Flash (translations + image descriptions) |
| **File Storage** | AWS S3 + CloudFront CDN |
| **Image Processing** | Sharp 0.34 |
| **Drag & Drop** | @dnd-kit |

---

## Getting Started

### Prerequisites

- Node.js >= 20
- npm

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Two env files are used:
- `.env` — production-like defaults
- `.env.local` — local dev overrides (loaded by `next dev` and Drizzle Kit)

Required variables:

```
DATABASE_URL                            # Neon PostgreSQL connection string
NEON_AUTH_BASE_URL                      # Neon Auth endpoint
NEON_AUTH_COOKIE_SECRET                 # Auth cookie secret
NEON_AUTH_JWKS_URL                      # Auth JWKS endpoint
NEXT_PUBLIC_ROOT_DOMAIN                 # e.g. localhost:3000 (dev)
NEXT_PUBLIC_APP_DOMAIN                  # e.g. app.localhost:3000 (dev)
NEXT_PUBLIC_DEV_ROOT_DOMAIN             # e.g. lvh.me:3000
GEMINI_API_KEY                          # Google AI API key
AWS_ACCESS_KEY_ID                       # S3 access key
AWS_SECRET_ACCESS_KEY                   # S3 secret key
AWS_REGION                              # e.g. us-east-1
AWS_S3_BUCKET                           # S3 bucket name
NEXT_PUBLIC_AWS_CLOUDFRONT_URL          # CloudFront distribution URL
```

The project ships with working `.env` and `.env.local` pointing to the dev Neon DB and dev AWS bucket.

### 3. Push database schema

```bash
npm run db:push
```

This pushes the Drizzle schema directly to Neon (no migration file generated).

### 4. (Optional) Run existing migrations

```bash
npm run db:migrate
```

### 5. Seed the pilot tenant (Àgora)

```bash
npx tsx src/5-shared/lib/db/seed-pilot.ts
```

This idempotent script creates:
- The **Àgora** tenant (social-work category, en/es/ca locales)
- A navbar, hero, and blog-feed block
- One sample blog post with English content (es/ca left as pending for Gemini)

### 6. Start the dev server

```bash
npm run dev
```

---

## Local URLs & DNS Routing

The proxy middleware (`src/proxy.ts`) routes hostnames to different parts of the app:

| URL | Route | Description |
|---|---|---|
| `http://localhost:3000` | `(marketing)` | Marketing landing page |
| `http://app.localhost:3000` | `(dashboard)` | Admin dashboard |
| `http://agora.lvh.me:3000` | `(tenants)/[domain]` | Àgora tenant site |
| `http://*.lvh.me:3000` | `(tenants)/[domain]` | Any tenant by subdomain |

`lvh.me` is a public DNS that resolves to `127.0.0.1` — it works out of the box for local multi-tenant testing.

---

## Available Scripts

```bash
npm run dev          # Start dev server (Turbopack)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:push      # Push schema to Neon (no migration)
npm run db:generate  # Generate Drizzle migration files
npm run db:migrate   # Run pending migrations
npm run db:studio    # Open Drizzle Studio (GUI DB browser at localhost:4983)
```

---

## Codebase Architecture (Feature-Sliced Design)

```
src/
  1-pages/           — Page-level components (marketing, dashboard, tenants)
  2-widgets/         — Composite widgets (site builder, block renderer, sidebar)
  3-features/        — Interactive features (AI translate, entity CRUD, block CRUD)
  4-entities/        — Business logic & models (tenant, block, gallery, hero)
  5-shared/          — Infrastructure, config, types, lib, store, translations
    lib/db/          — Drizzle schema, Neon client, seed script
    lib/i18n/        — next-intl routing & request config
    lib/next/        — Server/client params helpers, domain parser, tenant cache
    lib/aws/         — S3 client, CloudFront URL builder
    lib/ai/          — Gemini image description generation
    store/           — Zustand store (UI slice, tenant slice)
    translations/    — JSON locale files (en, es, ca, eu, ga, fr, it, de)
    config/          — Template & language configs
    types/           — Shared TypeScript type definitions
  app/               — Next.js App Router (layouts, pages, API routes)
    api/             — API routes (blocks, hero upload/delete, gallery CRUD)
    [locale]/        — Locale-based route groups
  proxy.ts           — DNS + i18n middleware (Next.js 16.2)
components/
  ui/                — shadcn/ui primitives
  soss/ui/           — SoSS-branded components
  tenant/ui/         — Tenant-branded components
```

**FSD Rules:**
- Imports flow downward only: `app` → `1-pages` → `2-widgets` → `3-features` → `4-entities` → `5-shared`
- No cross-slice imports on the same layer
- No hardcoded colors/fonts — CSS variables only

---

## Database Schema (10 tables)

| Table | Purpose |
|---|---|
| `tenants` | Tenant organizations with branding, locale config |
| `blocks` | Content blocks (hero, blog, navbar, etc.) with JSONB config + translations |
| `tenant_entities` | Entity items (blog posts, podcast episodes, awards) |
| `tenant_translations` | Per-locale entity translations with AI status tracking |
| `tenant_domains` | Custom domain mappings |
| `gallery_images` | Gallery image references with S3 keys |
| `gallery_image_i18n` | Gallery image alt-text/captions per locale |
| `hero_images` | Hero background images with S3 keys |
| `hero_image_i18n` | Hero image alt-text per locale |
| `transactions` | Stripe transaction records (1% platform fee) |
| `content_items` | Legacy entity table (being migrated to tenant_entities) |
| `platform_translations` | Platform UI string translations |

View/manage via Drizzle Studio: `npm run db:studio`

---

## Block Types (6 implemented, 1 planned)

| Block | Status |
|---|---|
| Navbar | ✅ Implemented |
| Hero (3 layout variants) | ✅ Implemented |
| Blog Feed | ✅ Implemented |
| Awards | ✅ Implemented |
| Podcast Feed | ✅ Implemented |
| Image Gallery | ✅ Implemented |
| Contact | ❌ Type defined, component not yet built |

---

## AI Translation Flow

1. Tenant admin adds a language via the dashboard
2. `triggerTenantTranslation` action finds all pending translation rows
3. `translateWithGemini` sends source + target to Gemini 2.5 Flash
4. Result is saved to `tenant_translations.payload` with status `translated`
5. Gallery captions follow the same flow via `triggerCaptionTranslation`
6. A progress bar (Sonner toast) shows translation status in real time

---

## Project Status

### ✅ Phase 1 — Foundation (Complete)
- FSD structure, Next.js 16.2, Neon + Drizzle, next-intl, proxy middleware
- shadcn/ui, Zustand (partial), helper utilities
- Pilot tenant seed script

### 🔄 Phase 2 — Auth & Dashboard (In Progress)
- Dashboard scaffold with sidebar ✅
- Gemini AI translation engine ✅
- Neon Auth setup ❌ (placeholder `assertTenantOwner` stubs)
- Zustand tenant store ❌ (partial)
- Platform translations seeding ❌

### 🔄 Phase 3 — Block System (In Progress)
- 6 of 7 block types implemented ✅
- Block renderer + site builder UI ✅
- Contact block ❌

### 🔮 Phase 4 — Monetization (Not Started)
- Stripe integration ❌
- Full marketing landing page ❌
- SEO (canonical links, sitemap, metadata) ❌

### Notable Gaps
- Zero tests (no test framework installed)
- RLS / row-level security not implemented
- No CI/CD configuration
- Some schema duplication (`content_items` vs `tenant_entities`)
