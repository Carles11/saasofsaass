CREATE TABLE IF NOT EXISTS "donations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"block_id" uuid,
	"paypal_url" text,
	"bank_account_iban" text,
	"bank_account_swift" text,
	"bank_account_holder" text,
	"bank_name" text,
	"bizum_phone" text,
	"venmo_username" text,
	"giftlist_url" text,
	"honeymoon_fund_url" text,
	"other_method_url" text,
	"other_method_desc" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "donations" ADD CONSTRAINT "donations_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "donations" ADD CONSTRAINT "donations_block_id_blocks_id_fk" FOREIGN KEY ("block_id") REFERENCES "public"."blocks"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "donations_tenant_block_idx" ON "donations" USING btree ("tenant_id","block_id");
