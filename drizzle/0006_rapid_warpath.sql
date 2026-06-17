CREATE TABLE "tenant_domain_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"profile_id" uuid,
	"old_domain" text,
	"new_domain" text,
	"event" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tenant_domains" ADD COLUMN "status" text DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "tenant_domains" ADD COLUMN "is_primary" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "tenant_domains" ADD COLUMN "dns_instructions" text;--> statement-breakpoint
ALTER TABLE "tenant_domains" ADD COLUMN "last_error" text;--> statement-breakpoint
ALTER TABLE "tenant_domains" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "tenant_domains" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "tenant_domain_logs" ADD CONSTRAINT "tenant_domain_logs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenant_domain_logs" ADD CONSTRAINT "tenant_domain_logs_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;