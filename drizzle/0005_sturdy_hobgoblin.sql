ALTER TABLE "tenant_domains" ADD COLUMN "status" text DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "tenant_domains" ADD COLUMN "is_primary" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "tenant_domains" ADD COLUMN "dns_instructions" text;--> statement-breakpoint
ALTER TABLE "tenant_domains" ADD COLUMN "last_error" text;--> statement-breakpoint
ALTER TABLE "tenant_domains" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "tenant_domains" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;