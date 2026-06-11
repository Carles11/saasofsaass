import { index, jsonb, pgTable, primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const heroImages = pgTable(
  "hero_images",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id").notNull(),
    s3Key: text("s3_key").notNull().unique(), // e.g. "tenant123/hero/filename.webp"
    meta: jsonb("meta").notNull().default({}), // { width, height, size, mime, etc. }
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    tenantIdx: index("hero_images_tenant_id_idx").on(table.tenantId),
  })
);

export const heroImageI18n = pgTable(
  "hero_image_i18n",
  {
    imageId: uuid("image_id")
      .notNull()
      .references(() => heroImages.id, { onDelete: "cascade" }),
    lang: text("lang").notNull(), // e.g. 'en', 'es', etc.
    alt: text("alt").notNull(),
  },
  (table) => ({
    pk: primaryKey(table.imageId, table.lang),
  })
);
