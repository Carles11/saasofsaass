"use server";

import { SUPPORTED_LOCALES } from "@/5-shared/config/languages/supportedLanguages";
import { requireProfile } from "@/5-shared/lib/auth/authorization";
import { ensureWorkspace } from "@/5-shared/lib/billing/workspace";
import { db } from "@/5-shared/lib/db";
import { blocks, tenants } from "@/5-shared/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { CreateTenantInput } from "./shared";
import { SLUG_REGEX } from "./shared";

function parseFormData(form: FormData): CreateTenantInput {
  const name = form.get("name")?.toString().trim() ?? "";
  const slug = form.get("slug")?.toString().trim().toLowerCase() ?? "";
  const defaultLocale = form.get("defaultLocale")?.toString() ?? "en";
  return { name, slug, defaultLocale };
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
  if (
    input.defaultLocale &&
    !SUPPORTED_LOCALES.includes(
      input.defaultLocale as (typeof SUPPORTED_LOCALES)[number],
    )
  ) {
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

  const { name, slug, defaultLocale } = input;

  // Check slug uniqueness
  const [existing] = await db
    .select({ id: tenants.id })
    .from(tenants)
    .where(eq(tenants.slug, slug))
    .limit(1);

  if (existing) {
    throw new Error(`A tenant with slug "${slug}" already exists.`);
  }

  // Find or auto-create workspace for the profile.
  // Creating sites (drafts) is always allowed — publishing is what's plan-gated.
  const workspace = await ensureWorkspace(profile.id, profile.name || null);

  // Insert tenant as a draft (not publicly served until published)
  const [tenant] = await db
    .insert(tenants)
    .values({
      name,
      slug,
      defaultLocale: defaultLocale ?? "en",
      locales: [defaultLocale ?? "en"],
      branding: {},
      status: "draft",
      workspaceId: workspace.id,
    })
    .returning();

  // Ownership is conferred by the workspace (workspaces.ownerProfileId) — no
  // per-tenant membership row is needed for the owner.

  // Auto-create hero and footer blocks (always present, cannot be removed)
  await db.insert(blocks).values([
    {
      tenantId: tenant.id,
      type: "hero",
      order: 0,
      isVisible: true,
      config: {},
      translations: {},
    },
    {
      tenantId: tenant.id,
      type: "footer",
      order: 1,
      isVisible: true,
      config: {},
      translations: {},
    },
  ]);

  revalidatePath("/", "layout");

  return {
    id: tenant.id,
    slug: tenant.slug,
    name: tenant.name,
  };
}
