"use server";

import { CATEGORY_BLOCKS } from "@/5-shared/config/category-blocks";
import { requireProfile } from "@/5-shared/lib/auth/authorization";
import { db } from "@/5-shared/lib/db";
import { blocks, tenants } from "@/5-shared/lib/db/schema";
import { tenantMemberships } from "@/5-shared/lib/db/schema/auth";
import type { TenantCategory } from "@/5-shared/types/tenants/categories";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const SLUG_REGEX = /^[a-z0-9]([a-z0-9-]{1,61})[a-z0-9]$/;
const ALLOWED_CATEGORIES: TenantCategory[] = ["social-work", "wedding"];
const ALLOWED_LOCALES = ["en", "es", "ca", "fr", "de", "it", "eu", "ga"] as const;

export interface CreateTenantInput {
  name: string;
  slug: string;
  category: TenantCategory;
  defaultLocale?: string;
}

function parseFormData(form: FormData): CreateTenantInput {
  const name = form.get("name")?.toString().trim() ?? "";
  const slug = form.get("slug")?.toString().trim().toLowerCase() ?? "";
  const category = form.get("category")?.toString() as TenantCategory;
  const defaultLocale = form.get("defaultLocale")?.toString() ?? "en";
  return { name, slug, category, defaultLocale };
}

function validate(input: CreateTenantInput): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!input.name || input.name.length > 100) {
    errors.name = "Name is required (max 100 characters).";
  }
  if (!SLUG_REGEX.test(input.slug)) {
    errors.slug =
      "Slug must be 3-63 characters, only lowercase letters, numbers, and hyphens. Must start and end with a letter or number.";
  }
  if (!ALLOWED_CATEGORIES.includes(input.category)) {
    errors.category = "Invalid category.";
  }
  if (input.defaultLocale && !ALLOWED_LOCALES.includes(input.defaultLocale as typeof ALLOWED_LOCALES[number])) {
    errors.defaultLocale = "Invalid default locale.";
  }

  return errors;
}

export async function createTenant(raw: FormData | CreateTenantInput) {
  const profile = await requireProfile();

  const input = raw instanceof FormData ? parseFormData(raw) : raw;

  const errors = validate(input);
  if (Object.keys(errors).length > 0) {
    throw new Error(Object.values(errors).join(" "));
  }

  const { name, slug, category, defaultLocale } = input;

  // Check slug uniqueness
  const [existing] = await db
    .select({ id: tenants.id })
    .from(tenants)
    .where(eq(tenants.slug, slug))
    .limit(1);

  if (existing) {
    throw new Error(`A tenant with slug "${slug}" already exists.`);
  }

  // Insert tenant
  const [tenant] = await db
    .insert(tenants)
    .values({
      name,
      slug,
      category,
      defaultLocale: defaultLocale ?? "en",
      locales: [defaultLocale ?? "en"],
      branding: {},
      isActive: true,
    })
    .returning();

  const allowedBlocks = CATEGORY_BLOCKS[category];

  // Pre-seed blocks from category config
  if (allowedBlocks) {
    await db.insert(blocks).values(
      allowedBlocks.map((type, idx) => ({
        tenantId: tenant.id,
        type,
        order: idx,
        isVisible: true,
        config: {},
        translations: {},
      }))
    );
  }

  // Create owner membership
  await db.insert(tenantMemberships).values({
    tenantId: tenant.id,
    profileId: profile.id,
    role: "owner",
  });

  revalidatePath("/", "layout");

  return {
    id: tenant.id,
    slug: tenant.slug,
    name: tenant.name,
  };
}
