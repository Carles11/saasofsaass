"use server";

import { db } from "@/5-shared/lib/db";
import { tenants } from "@/5-shared/lib/db/schema";
import { workspaceMemberships, membershipSites } from "@/5-shared/lib/db/schema/auth";
import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireProfile, assertWorkspaceOwner } from "@/5-shared/lib/auth/authorization";
import { getWorkspaceRoleForCaller } from "../lib/teamAccess";

type MemberRole = "webmaster" | "editor";
type SiteScope = "all" | "specific";

/**
 * Remove a team member. The owner may remove anyone; a web-master may remove
 * only editors. Cascade clears the member's site links.
 */
export async function removeMember(membershipId: string): Promise<void> {
  const caller = await requireProfile();
  const [m] = await db
    .select({
      workspaceId: workspaceMemberships.workspaceId,
      role: workspaceMemberships.role,
    })
    .from(workspaceMemberships)
    .where(eq(workspaceMemberships.id, membershipId))
    .limit(1);
  if (!m) throw new Error("errors.member-not-found");

  const callerRole = await getWorkspaceRoleForCaller(m.workspaceId, caller);
  const allowed =
    callerRole === "owner" || (callerRole === "webmaster" && m.role === "editor");
  if (!allowed) throw new Error("errors.cannot-remove-member");

  await db.delete(workspaceMemberships).where(eq(workspaceMemberships.id, membershipId));
  revalidatePath("/[locale]/team", "page");
}

/** Change a member's role (owner only). */
export async function updateMemberRole(
  membershipId: string,
  newRole: MemberRole,
): Promise<void> {
  const caller = await requireProfile();
  const [m] = await db
    .select({ workspaceId: workspaceMemberships.workspaceId })
    .from(workspaceMemberships)
    .where(eq(workspaceMemberships.id, membershipId))
    .limit(1);
  if (!m) throw new Error("errors.member-not-found");

  await assertWorkspaceOwner(m.workspaceId, caller.id);

  await db
    .update(workspaceMemberships)
    .set({ role: newRole, updatedAt: new Date() })
    .where(eq(workspaceMemberships.id, membershipId));
  revalidatePath("/[locale]/team", "page");
}

/** Change which sites a member can access (owner only). */
export async function updateMemberSites(
  membershipId: string,
  siteScope: SiteScope,
  siteIds: string[] = [],
): Promise<void> {
  const caller = await requireProfile();
  const [m] = await db
    .select({ workspaceId: workspaceMemberships.workspaceId })
    .from(workspaceMemberships)
    .where(eq(workspaceMemberships.id, membershipId))
    .limit(1);
  if (!m) throw new Error("errors.member-not-found");

  await assertWorkspaceOwner(m.workspaceId, caller.id);

  if (siteScope === "specific") {
    if (siteIds.length === 0) throw new Error("errors.select-at-least-one-site");
    const valid = await db
      .select({ id: tenants.id })
      .from(tenants)
      .where(and(eq(tenants.workspaceId, m.workspaceId), inArray(tenants.id, siteIds)));
    if (valid.length !== siteIds.length) {
      throw new Error("errors.invalid-sites");
    }
    await db
      .update(workspaceMemberships)
      .set({ siteScope: "specific", updatedAt: new Date() })
      .where(eq(workspaceMemberships.id, membershipId));
    await db.delete(membershipSites).where(eq(membershipSites.membershipId, membershipId));
    await db
      .insert(membershipSites)
      .values(valid.map((v) => ({ membershipId, tenantId: v.id })))
      .onConflictDoNothing();
  } else {
    await db
      .update(workspaceMemberships)
      .set({ siteScope: "all", updatedAt: new Date() })
      .where(eq(workspaceMemberships.id, membershipId));
    await db.delete(membershipSites).where(eq(membershipSites.membershipId, membershipId));
  }

  revalidatePath("/[locale]/team", "page");
}
