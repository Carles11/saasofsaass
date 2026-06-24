"use server";

import { db } from "@/5-shared/lib/db";
import { tenants } from "@/5-shared/lib/db/schema";
import { profiles, tenantMemberships } from "@/5-shared/lib/db/schema/auth";
import { eq, and, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireProfile, assertTenantRole } from "@/5-shared/lib/auth/authorization";
import { sendInviteEmail } from "@/5-shared/lib/email/resend";

/** Invite a new member to a tenant (owner only). */
export async function inviteMember(tenantId: string, email: string, role: "owner" | "editor", locale = "en") {
  const inviter = await requireProfile();
  await assertTenantRole(tenantId, "owner", inviter.id);

  // Find or create profile by email
  let [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.email, email))
    .limit(1);

  if (!profile) {
    [profile] = await db
      .insert(profiles)
      .values({ email, name: email.split("@")[0], role: "user" })
      .returning();
  }

  // Check if already a member
  const [existing] = await db
    .select({ id: tenantMemberships.id })
    .from(tenantMemberships)
    .where(
      and(
        eq(tenantMemberships.tenantId, tenantId),
        eq(tenantMemberships.profileId, profile.id),
      ),
    )
    .limit(1);

  if (existing) {
    await db
      .update(tenantMemberships)
      .set({ role })
      .where(eq(tenantMemberships.id, existing.id));
  } else {
    await db.insert(tenantMemberships).values({ tenantId, profileId: profile.id, role });
  }

  // Send invite email — non-blocking, failure does not roll back the membership
  try {
    const [tenant] = await db.select({ name: tenants.name }).from(tenants).where(eq(tenants.id, tenantId)).limit(1);
    await sendInviteEmail({
      to: email,
      tenantName: tenant?.name ?? "your site",
      inviterName: inviter.name || inviter.email,
      role,
      locale,
    });
  } catch (err) {
    console.error("Failed to send invite email:", err);
  }

  revalidatePath("/[locale]/dashboard/team", "page");
}

/** Remove a member from a tenant (owner only). */
export async function removeMember(tenantId: string, membershipId: string) {
  await assertTenantRole(tenantId, "owner");

  const [target] = await db
    .select({ role: tenantMemberships.role })
    .from(tenantMemberships)
    .where(eq(tenantMemberships.id, membershipId))
    .limit(1);

  if (!target) throw new Error("Membership not found");

  if (target.role === "owner") {
    const [ownerCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(tenantMemberships)
      .where(
        and(
          eq(tenantMemberships.tenantId, tenantId),
          eq(tenantMemberships.role, "owner"),
        ),
      );

    if (Number(ownerCount?.count ?? 0) <= 1) {
      throw new Error("Cannot remove the last owner. Transfer ownership first.");
    }
  }

  await db
    .delete(tenantMemberships)
    .where(
      and(
        eq(tenantMemberships.id, membershipId),
        eq(tenantMemberships.tenantId, tenantId),
      ),
    );

  revalidatePath("/[locale]/dashboard/team", "page");
}

/** Change an existing member's role (owner only). Cannot demote the last owner. */
export async function changeMemberRole(tenantId: string, membershipId: string, newRole: "owner" | "editor") {
  await assertTenantRole(tenantId, "owner");

  const [target] = await db
    .select({ role: tenantMemberships.role })
    .from(tenantMemberships)
    .where(eq(tenantMemberships.id, membershipId))
    .limit(1);

  if (!target) throw new Error("Membership not found");

  if (target.role === "owner" && newRole !== "owner") {
    const [ownerCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(tenantMemberships)
      .where(and(eq(tenantMemberships.tenantId, tenantId), eq(tenantMemberships.role, "owner")));

    if (Number(ownerCount?.count ?? 0) <= 1) {
      throw new Error("Cannot demote the last owner. Assign another owner first.");
    }
  }

  await db
    .update(tenantMemberships)
    .set({ role: newRole })
    .where(and(eq(tenantMemberships.id, membershipId), eq(tenantMemberships.tenantId, tenantId)));

  revalidatePath("/[locale]/dashboard/team", "page");
}

/** Get all members for a tenant with their profiles. */
export async function getTeamMembers(tenantId: string) {
  const rows = await db
    .select({
      membership: tenantMemberships,
      profile: profiles,
    })
    .from(tenantMemberships)
    .innerJoin(profiles, eq(tenantMemberships.profileId, profiles.id))
    .where(eq(tenantMemberships.tenantId, tenantId))
    .orderBy(tenantMemberships.role);

  return rows;
}

/** Get all tenants the current user has access to. */
export async function getUserTenants() {
  const profile = await requireProfile();

  const rows = await db
    .select({
      membership: tenantMemberships,
      tenant: {
        id: tenantMemberships.tenantId,
      },
    })
    .from(tenantMemberships)
    .innerJoin(profiles, eq(tenantMemberships.profileId, profiles.id))
    .where(eq(tenantMemberships.profileId, profile.id));

  return rows.map((r) => r.membership);
}
