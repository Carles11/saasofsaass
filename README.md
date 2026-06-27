# SoSS Engine (SaaS of SaaSs)

A **multi-tenant website factory** — a single Next.js codebase that dynamically renders unique, multilingual websites for different organizations (tenants). Built around a modular "Content Block" engine rather than static templates.

---

## Tech Stack

| Category | Technology |
|---|---|
| **Framework** | Next.js 16.2 (App Router, Turbopack) |
| **Language** | TypeScript 5.x, React 19.2 |
| **Database** | Neon (Serverless PostgreSQL) via Drizzle ORM 0.45 |
| **Auth** | Neon Auth (Better Auth foundation) via API proxy route |
| **Theme** | next-themes (dark/light), shadcn semantic CSS vars, 2 palette themes (Ocean/Sunset) |
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
- The **Àgora** tenant (en/es/ca locales)
- A navbar, hero, and blog-feed block
- One sample blog post with English content (es/ca left as pending for Gemini)

### 6. (Optional) Seed platform translations

```bash
npx tsx src/5-shared/lib/db/seed-platform-translations.ts
```

Seeds platform UI strings (e.g. "Preview") into the `platform_translations` table for all 8 locales.

### 7. Start the dev server

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
| `http://agora.localhost:3000` | `(tenants)/[domain]` | Àgora tenant site |
| `http://*.localhost:3000` | `(tenants)/[domain]` | Any tenant by subdomain |

Subdomains of `localhost` resolve to `127.0.0.1` automatically — no external DNS service required.

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
  1-pages/
    marketing/ui/sections/ — Marketing page sections (Hero, Features, Pricing, Testimonials, FAQ, CTA, Footer, Header)
  2-widgets/         — Composite widgets (site builder, block renderer, sidebar, create dialog, team manager)
  3-features/        — Interactive features (AI translate, entity CRUD, block CRUD, tenant actions)
  4-entities/        — Business logic & models (tenant, block, gallery, content)
  5-shared/          — Infrastructure, config, types, lib, store, translations
    lib/auth/        — Neon Auth integration (authorization, sync-profile, server)
    lib/db/          — Drizzle schema (core + auth), Neon client, seed scripts
    lib/i18n/        — next-intl routing & request config
    lib/next/        — Server/client params helpers, domain parser, RTL detection
    lib/aws/         — S3 client, CloudFront URL builder
    lib/ai/          — Gemini image description generation
    store/           — Zustand store (UI slice, tenant slice, StoreHydrator)
    theme/           — ThemeProvider (next-themes) + ThemeToggle
    translations/    — JSON locale files (en, es, ca, eu, ga, fr, it, de)
    config/          — Category configs (blocks per category, labels)
    types/           — Shared TypeScript types (categories, blocks, page props)
  app/               — Next.js App Router (layouts, pages, API routes, sitemap)
    api/auth/        — Auth API proxy route (Origin override for dev subdomains)
    [locale]/        — Locale-based route groups (marketing, dashboard, tenants)
  proxy.ts           — DNS + i18n middleware (Next.js 16.2)
components/
  ui/                — shadcn/ui primitives
  soss/ui/           — SoSS-branded components
  tenant/ui/         — Tenant-branded components
```

**FSD Rules:**
- Imports flow downward only: `app` → `1-pages` → `2-widgets` → `3-features` → `4-entities` → `5-shared`
- No cross-slice imports on the same layer
- Platform pages use semantic shadcn CSS vars (`bg-background`, `text-foreground`, etc.)

---

## Database Schema (14 tables)

| Table | Location | Purpose |
|---|---|---|
| `tenants` | `schema.ts` | Tenant organizations with branding, locale config |
| `blocks` | `schema.ts` | Content blocks (navbar, hero, blog-feed, awards, podcast-feed, contact) with JSONB config + translations |
| `tenants` | `schema.ts` | Tenant organizations with branding, locale config |
| `blocks` | `schema.ts` | Content blocks (navbar, hero, blog-feed, awards, podcast-feed, contact) with JSONB config + translations |
| `tenant_entities` | `schema.ts` | Entity items (blog posts, podcast episodes, awards) |
| `tenant_translations` | `schema.ts` | Per-locale entity translations |
| `transactions` | `schema.ts` | Stripe transaction records (1% platform fee) |
| `platform_translations` | `schema.ts` | Platform UI string translations (namespace/key/locale, unique constraint) |
| `profiles` | `schema/auth.ts` | Local user profiles synced from Neon Auth |
| `workspace_memberships` | `schema/auth.ts` | Role-based access (webmaster/editor) per workspace with site scope |
| `membership_sites` | `schema/auth.ts` | Links specific-scope members to assigned tenants |
| `workspace_invitations` | `schema/auth.ts` | Pending invitations with role, scope, site assignment |
| `workspaces` | `schema.ts` | Workspace (account) with plan, site limits, Stripe subscription |
| `tenant_domains` | `schema.ts` | Custom domain mappings |
| `gallery_images` | `4-entities/gallery/model/image.ts` | Gallery image references with S3 keys |
| `hero_images` | `4-entities/hero/model/image.ts` | Hero background images with S3 keys |

View/manage via Drizzle Studio using WSL Terminal: `npm run db:studio`

---

## Block Types (6 implemented, 1 planned)

| Block | Status |
|---|---|
| Navbar | ✅ Implemented (3 layout variants: centered, sticky, minimal) |
| Hero | ✅ Implemented (3 layout variants: image-left, centered-overlay, split-text) |
| Blog Feed | ✅ Implemented |
| Awards | ✅ Implemented |
| Podcast Feed | ✅ Implemented |
| Image Gallery | ✅ Implemented |
| Contact | ❌ Type defined, component not yet built |

Blocks are added by the user via the SiteBuilder interface — all 7 block kinds are always available.

---

## Palette System

Two color palettes are available and switchable at runtime:

| Palette | Vibe | Light Mode | Dark Mode |
|---|---|---|---|
| **Ocean** | Professional, fresh | Soft blue-white bg, vibrant blue primary, coral accent | Deep navy bg, bright blue primary |
| **Sunset** | Warm, friendly | Cream bg, rich terracotta primary, golden accent | Warm dark bg, bright terracotta primary |

Switch via the `PaletteSwitcher` component (sunburst/snowflake icon). Preference persists in localStorage under `soos-palette`. Default is Ocean.

## Marketing Page Structure

The marketing page is composed of individual sections in `src/1-pages/marketing/ui/sections/`:

- `MarketingHeader` — Sticky nav with logo, nav links, language selector, theme/palette toggles, sign in/up buttons, mobile menu
- `HeroSection` — Headline, subtitle, CTA buttons, stats
- `FeaturesSection` — 6 feature cards with icons using shadcn Card
- `PricingSection` — 3-tier pricing with "Most Popular" badge
- `TestimonialsSection` — 3 testimonial cards
- `FaqSection` — Accordion-style FAQ
- `CtaSection` — Final call-to-action
- `FooterSection` — Links and copyright

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

### ✅ Phase 2 — Auth, Dashboard, Team & SEO (Complete)
- Neon Auth fully working with API proxy route and Origin override for dev subdomains
- Local profiles + workspace_memberships / membership_sites / workspace_invitations with role-based permissions (super_admin/owner/webmaster/editor)
- 4 auth pages (sign-in, sign-up, forgot-password, reset-password)
- Dashboard with collapsible sidebar, site builder UI, team management
- "Create Site" dialog
- Entity CRUD (blog posts, podcast episodes, awards) with per-type translation forms
- Platform translations table + seeding + helper
- AI translation flow via Gemini 2.5
- Marketing page SEO (per-locale metadata, OG, hreflang, canonical, sitemap)
- Dark/light theme (next-themes, semantic CSS vars across all platform pages)

### 🔄 Phase 3 — Block System Dark Mode & Polish (In Progress)
- 6 of 7 block types implemented ✅
- Block renderer + site builder UI ✅
- Tenant template dark mode pass — block components still use hardcoded zinc colors ⏳
- Contact block ❌

### 🔮 Phase 4 — Monetization (Not Started)
- Stripe integration ❌
- Full marketing landing page polish ❌

### Notable Gaps
- Zero tests (no test framework installed)
- RLS / row-level security not implemented
- No CI/CD configuration
- ~~Schema duplication (`content_items` vs `tenant_entities`)~~ ✅ Resolved, content_items dropped
- Tenant template blocks need dark mode pass
