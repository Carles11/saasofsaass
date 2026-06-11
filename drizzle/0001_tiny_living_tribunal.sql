CREATE TABLE "gallery_image_i18n" (
	"image_id" uuid NOT NULL,
	"lang" text NOT NULL,
	"alt" text NOT NULL,
	"caption" text NOT NULL,
	CONSTRAINT "gallery_image_i18n_image_id_lang_pk" PRIMARY KEY("image_id","lang")
);
--> statement-breakpoint
CREATE TABLE "gallery_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"block_id" uuid NOT NULL,
	"s3_key" text NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"meta" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "gallery_images_s3_key_unique" UNIQUE("s3_key")
);
--> statement-breakpoint
CREATE TABLE "hero_image_i18n" (
	"image_id" uuid NOT NULL,
	"lang" text NOT NULL,
	"alt" text NOT NULL,
	CONSTRAINT "hero_image_i18n_image_id_lang_pk" PRIMARY KEY("image_id","lang")
);
--> statement-breakpoint
CREATE TABLE "hero_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"s3_key" text NOT NULL,
	"meta" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "hero_images_s3_key_unique" UNIQUE("s3_key")
);
--> statement-breakpoint
CREATE TABLE "tenant_domains" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"domain" text NOT NULL,
	CONSTRAINT "tenant_domains_domain_unique" UNIQUE("domain")
);
--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "template_id" text DEFAULT 'default' NOT NULL;--> statement-breakpoint
ALTER TABLE "gallery_image_i18n" ADD CONSTRAINT "gallery_image_i18n_image_id_gallery_images_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."gallery_images"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hero_image_i18n" ADD CONSTRAINT "hero_image_i18n_image_id_hero_images_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."hero_images"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenant_domains" ADD CONSTRAINT "tenant_domains_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "gallery_images_tenant_id_idx" ON "gallery_images" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "hero_images_tenant_id_idx" ON "hero_images" USING btree ("tenant_id");