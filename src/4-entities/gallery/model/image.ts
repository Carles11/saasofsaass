import {
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const galleryImages = pgTable(
  "gallery_images",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id").notNull(),
    blockId: uuid("block_id").notNull(),
    s3Key: text("s3_key").notNull().unique(), // e.g. "tenant123/gallery/filename.jpg"
    order: integer("order").notNull().default(0),
    meta: jsonb("meta").notNull().default({}), // { width, height, size, mime, hash, etc. }
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    tenantIdx: index("gallery_images_tenant_id_idx").on(table.tenantId),
  })
);

export const galleryImageI18n = pgTable(
  "gallery_image_i18n",
  {
    imageId: uuid("image_id")
      .notNull()
      .references(() => galleryImages.id, { onDelete: "cascade" }),
    lang: text("lang").notNull(), // e.g. 'en', 'es', etc.
    alt: text("alt").notNull(),
    caption: text("caption").notNull(),
  },
  (table) => ({
    pk: primaryKey(table.imageId, table.lang),
  })
);
