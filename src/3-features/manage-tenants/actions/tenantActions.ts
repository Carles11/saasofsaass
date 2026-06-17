"use server";

import { requireProfile } from "@/5-shared/lib/auth/authorization";
import { db } from "@/5-shared/lib/db";
import { tenants, workspaces } from "@/5-shared/lib/db/schema";
import { tenantMemberships } from "@/5-shared/lib/db/schema/auth";
import { eq, and, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getSiteLimit } from "@/5-shared/lib/billing/plans";
import { SLUG_REGEX } from "./shared";
import type { CreateTenantInput } from "./shared";

const ALLOWED_LOCALES = ["en", "es", "ca", "fr", "de", "it", "eu", "ga"] as const;

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
  if (input.defaultLocale && !ALLOWED_LOCALES.includes(input.defaultLocale as typeof ALLOWED_LOCALES[number])) {
    errors.defaultLocale = "Invalid default locale.";
  }

  return errors;
}

async function findOrCreateWorkspace(profileId: string, profileName: string | null) {
  // Fast path: check if workspace already exists
  const [existing] = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.ownerProfileId, profileId))
    .limit(1);

  if (existing) return existing;

  // Create workspace — unique constraint on owner_profile_id prevents duplicates
  const name = profileName ? `${profileName}'s Account` : "My Account";
  try {
    const [ws] = await db
      .insert(workspaces)
      .values({
        name,
        ownerProfileId: profileId,
        plan: "free",
        siteLimit: getSiteLimit("free"),
      })
      .returning();
    return ws;
  } catch (error: any) {
    // PostgreSQL unique violation (23505) — another request created a workspace first
    if (error?.cause?.code === "23505") {
      const [existingWs] = await db
        .select()
        .from(workspaces)
        .where(eq(workspaces.ownerProfileId, profileId))
        .limit(1);
      if (existingWs) return existingWs;
    }
    throw error;
  }
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

  // Find or auto-create workspace for the profile
  const workspace = await findOrCreateWorkspace(profile.id, profile.name || null);

  // Check subscription status
  if (workspace.subscriptionStatus === "past_due" || workspace.subscriptionStatus === "unpaid" || workspace.subscriptionStatus === "incomplete_expired") {
    throw new Error("Subscription is past due. Please update your billing information.");
  }

  // Count active tenants in this workspace
  const [countResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(tenants)
    .where(
      and(
        eq(tenants.workspaceId, workspace.id),
        eq(tenants.isActive, true),
      ),
    );

  const currentCount = Number(countResult?.count ?? 0);
  if (currentCount >= workspace.siteLimit) {
    throw new Error(
      `Site limit reached (${workspace.siteLimit}). Upgrade your plan to create more sites.`,
    );
  }

  // Insert tenant with workspace_id
  const [tenant] = await db
    .insert(tenants)
    .values({
      name,
      slug,
      defaultLocale: defaultLocale ?? "en",
      locales: [defaultLocale ?? "en"],
      branding: {},
      isActive: true,
      workspaceId: workspace.id,
    })
    .returning();

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
