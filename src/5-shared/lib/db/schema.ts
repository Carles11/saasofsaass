import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { galleryImageI18n, galleryImages } from "@/4-entities/gallery/model/image";
import { heroImageI18n, heroImages } from "@/4-entities/hero/model/image";

// ============================================
// TENANTS
// ============================================
export const tenants = pgTable("tenants", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(), // e.g. "agora"
  domain: text("domain"), // custom domain e.g. "agora.com"

  locales: text("locales").array().notNull().default(["en"]), // enabled languages
  defaultLocale: text("default_locale").notNull().default("en"),
  branding: jsonb("branding").default({}), // HSL vars, logo, fonts
  templateId: text("template_id").notNull().default("default"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ============================================
// BLOCKS
// ============================================
export const blocks = pgTable(
  "blocks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    type: text("type").notNull(), // "hero", "blog", "awards", "podcast", "contact"
    order: integer("order").notNull().default(0), // display order on the site
    isVisible: boolean("is_visible").notNull().default(true),
    config: jsonb("config").default({}), // block-level settings (CTA text, layout, etc)
    translations: jsonb("translations").default({}), // { en: { title, subtitle }, es: { ... } }
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("blocks_tenant_order_idx").on(t.tenantId, t.order)]
);

// ============================================
// TENANT ENTITIES — Metadata spine for dynamic collections
// (blog posts, podcast episodes, awards, etc.)
// Translatable strings live in tenant_translations below.
// ============================================
export const tenantEntities = pgTable(
  "tenant_entities",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    blockId: uuid("block_id").references(() => blocks.id, { onDelete: "set null" }), // nullable
    kind: text("kind").notNull(), // 'blog_post' | 'podcast_episode' | 'award_item'
    status: text("status").notNull().default("draft"), // 'draft' | 'published' | 'archived'
    order: integer("order").notNull().default(0),
    slug: text("slug"), // SEO slug — unique per tenant
    coverImageUrl: text("cover_image_url"),
    metadata: jsonb("metadata").default({}), // kind-specific non-translatable fields
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("entities_tenant_kind_idx").on(t.tenantId, t.kind),
    index("entities_tenant_status_idx").on(t.tenantId, t.status),
    index("entities_block_order_idx").on(t.blockId, t.order),
    uniqueIndex("entities_tenant_slug_idx").on(t.tenantId, t.slug),
  ]
);

// ============================================
// TENANT TRANSLATIONS — Per-entity, per-locale translatable content
// namespace pattern: entity:{entity_id}
// payload shape is determined by kind (see types/tenants/entities.ts)
// ============================================
export const tenantTranslations = pgTable(
  "tenant_translations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    entityId: uuid("entity_id")
      .notNull()
      .references(() => tenantEntities.id, { onDelete: "cascade" }),
    locale: text("locale").notNull(), // e.g. 'en', 'es', 'ca'
    payload: jsonb("payload").notNull().default({}), // { title, body, excerpt, ... }
    translationStatus: text("translation_status").notNull().default("pending"), // 'pending'|'translated'|'failed'|'locked'
    isLocked: boolean("is_locked").notNull().default(false), // true = Gemini must not overwrite
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("translations_entity_locale_idx").on(t.entityId, t.locale),
    index("translations_tenant_locale_idx").on(t.tenantId, t.locale),
  ]
);

// ============================================
// TENANT DOMAINS
// ============================================
export const tenantDomains = pgTable("tenant_domains", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  domain: text("domain").notNull().unique(),
});

// ============================================
// TRANSACTIONS (1% platform fee)
// ============================================
export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  amount: integer("amount").notNull(), // in cents
  currency: text("currency").notNull().default("eur"),
  platformFee: integer("platform_fee").notNull(), // 1% in cents
  status: text("status").notNull().default("pending"), // "pending", "completed", "refunded"
  stripeId: text("stripe_id"), // Stripe payment intent ID
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ============================================
// PLATFORM TRANSLATIONS (your UI strings)
// ============================================
export const platformTranslations = pgTable("platform_translations", {
  id: uuid("id").primaryKey().defaultRandom(),
  namespace: text("namespace").notNull(), // "common", "dashboard", "errors", "auth"
  key: text("key").notNull(),
  locale: text("locale").notNull(),
  value: text("value").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  uniqueNsKeyLocale: unique().on(t.namespace, t.key, t.locale),
}));

// ============================================
// AUTH (profiles + tenant memberships)
// ============================================
export { profiles, tenantMemberships } from "./schema/auth";

// ============================================
// IMAGES (for image gallery block and HeroImages)
// ============================================
export { galleryImageI18n, galleryImages, heroImageI18n, heroImages };

// ============================================
// TYPES (inferred from schema)
// ============================================
export type Tenant = typeof tenants.$inferSelect;
export type NewTenant = typeof tenants.$inferInsert;
export type Block = typeof blocks.$inferSelect;
export type NewBlock = typeof blocks.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
export type TenantEntity = typeof tenantEntities.$inferSelect;
export type NewTenantEntity = typeof tenantEntities.$inferInsert;
export type TenantTranslation = typeof tenantTranslations.$inferSelect;
export type NewTenantTranslation = typeof tenantTranslations.$inferInsert;
export type { Profile, NewProfile, TenantMembership, NewTenantMembership } from "./schema/auth";
