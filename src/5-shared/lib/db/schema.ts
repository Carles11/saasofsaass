import { pgTable, uuid, text, timestamp, jsonb, boolean, integer } from 'drizzle-orm/pg-core'

// ============================================
// TENANTS
// ============================================
export const tenants = pgTable('tenants', {
  id:         uuid('id').primaryKey().defaultRandom(),
  name:       text('name').notNull(),
  slug:       text('slug').notNull().unique(),         // e.g. "agora"
  domain:     text('domain'),                          // custom domain e.g. "agora.com"
  category:   text('category').notNull(),              // "wedding", "social-work", "law"...
  locales:    text('locales').array().notNull().default(['en']),  // enabled languages
  defaultLocale: text('default_locale').notNull().default('en'),
  branding:   jsonb('branding').default({}),           // HSL vars, logo, fonts
  isActive:   boolean('is_active').notNull().default(true),
  createdAt:  timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt:  timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

// ============================================
// BLOCKS
// ============================================
export const blocks = pgTable('blocks', {
  id:         uuid('id').primaryKey().defaultRandom(),
  tenantId:   uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  type:       text('type').notNull(),                  // "hero", "blog", "awards", "podcast", "contact"
  order:      integer('order').notNull().default(0),   // display order on the site
  isVisible:  boolean('is_visible').notNull().default(true),
  config:     jsonb('config').default({}),             // block-level settings (CTA text, layout, etc)
  translations: jsonb('translations').default({}),     // { en: { title, subtitle }, es: { ... } }
  createdAt:  timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt:  timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

// ============================================
// CONTENT ITEMS (repeatable content inside blocks)
// ============================================
export const contentItems = pgTable('content_items', {
  id:         uuid('id').primaryKey().defaultRandom(),
  tenantId:   uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  blockId:    uuid('block_id').notNull().references(() => blocks.id, { onDelete: 'cascade' }),
  type:       text('type').notNull(),                  // "blog-post", "award", "episode", "team-member"
  order:      integer('order').notNull().default(0),
  isPublished: boolean('is_published').notNull().default(false),
  slug:       text('slug'),                            // for blog posts, SEO
  coverImage: text('cover_image'),                     // URL
  data:       jsonb('data').default({}),               // type-specific fields (duration, audioUrl, etc)
  translations: jsonb('translations').default({}),     // { en: { title, body }, es: { ... } }
  publishedAt: timestamp('published_at', { withTimezone: true }),
  createdAt:  timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt:  timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

// ============================================
// TRANSACTIONS (1% platform fee)
// ============================================
export const transactions = pgTable('transactions', {
  id:           uuid('id').primaryKey().defaultRandom(),
  tenantId:     uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  amount:       integer('amount').notNull(),            // in cents
  currency:     text('currency').notNull().default('eur'),
  platformFee:  integer('platform_fee').notNull(),     // 1% in cents
  status:       text('status').notNull().default('pending'), // "pending", "completed", "refunded"
  stripeId:     text('stripe_id'),                     // Stripe payment intent ID
  metadata:     jsonb('metadata').default({}),
  createdAt:    timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt:    timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

// ============================================
// PLATFORM TRANSLATIONS (your UI strings)
// ============================================
export const platformTranslations = pgTable('platform_translations', {
  id:         uuid('id').primaryKey().defaultRandom(),
  namespace:  text('namespace').notNull(),             // "common", "dashboard", "errors", "auth"
  key:        text('key').notNull(),
  locale:     text('locale').notNull(),
  value:      text('value').notNull(),
  createdAt:  timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt:  timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

// ============================================
// TYPES (inferred from schema)
// ============================================
export type Tenant        = typeof tenants.$inferSelect
export type NewTenant     = typeof tenants.$inferInsert
export type Block         = typeof blocks.$inferSelect
export type NewBlock      = typeof blocks.$inferInsert
export type ContentItem   = typeof contentItems.$inferSelect
export type NewContentItem = typeof contentItems.$inferInsert
export type Transaction   = typeof transactions.$inferSelect
export type NewTransaction = typeof transactions.$inferInsert