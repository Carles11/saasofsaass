ALTER TABLE "profiles" ADD COLUMN "auth_user_id" text;
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_auth_user_id_unique" UNIQUE ("auth_user_id");
