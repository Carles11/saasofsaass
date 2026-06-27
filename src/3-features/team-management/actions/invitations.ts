"use server";

import { db } from "@/5-shared/lib/db";
import { tenants, workspaces } from "@/5-shared/lib/db/schema";
import {
  profiles,
  workspaceMemberships,
  membershipSites,
  workspaceInvitations,
} from "@/5-shared/lib/db/schema/auth";
import { and, eq, inArray, ne, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireProfile } from "@/5-shared/lib/auth/authorization";
import { authServer } from "@/5-shared/lib/auth/server";
import { syncProfile } from "@/5-shared/lib/auth/sync-profile";
import { getPlanForWorkspace } from "@/5-shared/lib/billing/workspace";
import { planAllowsTeam, getSeatLimit, isUnlimited } from "@/5-shared/lib/billing/plans";
import { sendTeamInviteEmail } from "@/5-shared/lib/email/resend";
import { generateInviteToken, getInviteExpiry } from "../lib/inviteToken";
import {
  getWorkspaceRoleForCaller,
  getWebmasterAccessibleTenantIds,
} from "../lib/teamAccess";

type InviteRole = "webmaster" | "editor";
type SiteScope = "all" | "specific";

export interface CreateInvitationInput {
  workspaceId: string;
  email: string;
  invitedName?: string;
  role: InviteRole;
  siteScope: SiteScope;
  siteIds?: string[];
  locale?: string;
}

/**
 * Create (or refresh) a pending invitation and email the invitee an accept link.
 * No profile or membership is created until the invitee accepts.
 *
 * Authorization:
 *  - only the workspace owner may invite web-masters or grant scope = "all"
 *  - web-masters may invite editors, scoped to sites they themselves can access
 */
export async function createInvitation(input: CreateInvitationInput): Promise<void> {
  const caller = await requireProfile();
  const callerRole = await getWorkspaceRoleForCaller(input.workspaceId, caller);
  if (callerRole !== "owner" && callerRole !== "webmaster") {
    throw new Error("You don't have permission to invite members to this workspace");
  }

  if (input.role === "webmaster" && callerRole !== "owner") {
    throw new Error("Only the workspace owner can invite web-masters");
  }

  const siteScope = input.siteScope;
  const siteIds = input.siteIds ?? [];

  if (siteScope === "all" && callerRole !== "owner") {
    throw new Error("Only the workspace owner can grant access to all sites");
  }

  if (siteScope === "specific") {
    if (siteIds.length === 0) throw new Error("Select at least one site");
    const valid = await db
      .select({ id: tenants.id })
      .from(tenants)
      .where(and(eq(tenants.workspaceId, input.workspaceId), inArray(tenants.id, siteIds)));
    const validIds = new Set(valid.map((v) => v.id));
    if (siteIds.some((id) => !validIds.has(id))) {
      throw new Error("One or more selected sites are invalid");
    }
    if (callerRole === "webmaster") {
      const accessible = new Set(
        await getWebmasterAccessibleTenantIds(input.workspaceId, caller.id),
      );
      if (siteIds.some((id) => !accessible.has(id))) {
        throw new Error("You can only assign sites you have access to");
      }
    }
  }

  const plan = await getPlanForWorkspace(input.workspaceId);
  if (!planAllowsTeam(plan)) {
    throw new Error("Upgrade to Pro to invite team members");
  }

  const email = input.email.trim().toLowerCase();
  if (!email) throw new Error("Email is required");

  // The workspace owner can't be invited.
  const [wsOwner] = await db
    .select({ ownerEmail: profiles.email })
    .from(workspaces)
    .innerJoin(profiles, eq(workspaces.ownerProfileId, profiles.id))
    .where(eq(workspaces.id, input.workspaceId))
    .limit(1);
  if (wsOwner && wsOwner.ownerEmail.toLowerCase() === email) {
    throw new Error("That person already owns this workspace");
  }

  // Already an active member of this workspace?
  const existingMember = await db
    .select({ id: workspaceMemberships.id })
    .from(workspaceMemberships)
    .innerJoin(profiles, eq(workspaceMemberships.profileId, profiles.id))
    .where(
      and(
        eq(workspaceMemberships.workspaceId, input.workspaceId),
        eq(profiles.email, email),
      ),
    )
    .limit(1);
  if (existingMember.length > 0) {
    throw new Error("That person is already on the team");
  }

  // Per-plan seat cap. Re-sending to an already-pending email doesn't take a new
  // seat (that email is excluded from the pending count).
  const seatLimit = getSeatLimit(plan, input.role);
  if (!isUnlimited(seatLimit)) {
    const [memberCount] = await db
      .select({ n: sql<number>`count(*)` })
      .from(workspaceMemberships)
      .where(
        and(
          eq(workspaceMemberships.workspaceId, input.workspaceId),
          eq(workspaceMemberships.role, input.role),
        ),
      );
    const [inviteCount] = await db
      .select({ n: sql<number>`count(*)` })
      .from(workspaceInvitations)
      .where(
        and(
          eq(workspaceInvitations.workspaceId, input.workspaceId),
          eq(workspaceInvitations.status, "pending"),
          eq(workspaceInvitations.role, input.role),
          ne(workspaceInvitations.email, email),
        ),
      );
    const used = Number(memberCount?.n ?? 0) + Number(inviteCount?.n ?? 0);
    if (used >= seatLimit) {
      const roleName = input.role === "webmaster" ? "web-master" : "editor";
      throw new Error(`You've reached your ${roleName} seat limit for this plan.`);
    }
  }

  const token = generateInviteToken();
  const expiresAt = getInviteExpiry();

  // Refresh an existing pending invite for the same email, else create one.
  const [pending] = await db
    .select({ id: workspaceInvitations.id })
    .from(workspaceInvitations)
    .where(
      and(
        eq(workspaceInvitations.workspaceId, input.workspaceId),
        eq(workspaceInvitations.email, email),
        eq(workspaceInvitations.status, "pending"),
      ),
    )
    .limit(1);

  if (pending) {
    await db
      .update(workspaceInvitations)
      .set({
        invitedName: input.invitedName ?? null,
        role: input.role,
        siteScope,
        siteIds,
        token,
        expiresAt,
        invitedByProfileId: caller.id,
        updatedAt: new Date(),
      })
      .where(eq(workspaceInvitations.id, pending.id));
  } else {
    await db.insert(workspaceInvitations).values({
      workspaceId: input.workspaceId,
      email,
      invitedName: input.invitedName ?? null,
      role: input.role,
      siteScope,
      siteIds,
      token,
      status: "pending",
      expiresAt,
      invitedByProfileId: caller.id,
    });
  }

  try {
    await sendTeamInviteEmail({
      to: email,
      invitedName: input.invitedName ?? null,
      inviterName: caller.name || caller.email,
      role: input.role,
      locale: input.locale ?? "en",
      token,
    });
  } catch (err) {
    console.error("Failed to send invite email:", err);
  }

  revalidatePath("/[locale]/team", "page");
}

export type AcceptResult =
  | { ok: true }
  | { ok: false; error: "not-authenticated" | "not-found" | "used" | "expired" | "email-mismatch" };

/**
 * Materialize a pending invitation for the signed-in user. Must be called by an
 * authenticated session whose email matches the invitation.
 */
export async function acceptInvitation(token: string): Promise<AcceptResult> {
  const session = (await authServer.getSession()).data;
  if (!session?.user?.email) return { ok: false, error: "not-authenticated" };

  const [inv] = await db
    .select()
    .from(workspaceInvitations)
    .where(eq(workspaceInvitations.token, token))
    .limit(1);
  if (!inv) return { ok: false, error: "not-found" };
  if (inv.status !== "pending") return { ok: false, error: "used" };
  if (new Date(inv.expiresAt) < new Date()) {
    await db
      .update(workspaceInvitations)
      .set({ status: "expired", updatedAt: new Date() })
      .where(eq(workspaceInvitations.id, inv.id));
    return { ok: false, error: "expired" };
  }

  const sessionEmail = session.user.email.toLowerCase();
  if (sessionEmail !== inv.email.toLowerCase()) {
    return { ok: false, error: "email-mismatch" };
  }

  const profile = await syncProfile(session);
  if (!profile) return { ok: false, error: "not-authenticated" };

  // Seed the profile name from the invitation only when it's still a stub.
  if (inv.invitedName) {
    const stub = sessionEmail.split("@")[0];
    if (!profile.name || profile.name === stub) {
      await db
        .update(profiles)
        .set({ name: inv.invitedName })
        .where(eq(profiles.id, profile.id));
    }
  }

  const [existing] = await db
    .select({ id: workspaceMemberships.id })
    .from(workspaceMemberships)
    .where(
      and(
        eq(workspaceMemberships.workspaceId, inv.workspaceId),
        eq(workspaceMemberships.profileId, profile.id),
      ),
    )
    .limit(1);

  let membershipId: string;
  if (existing) {
    await db
      .update(workspaceMemberships)
      .set({ role: inv.role, siteScope: inv.siteScope, updatedAt: new Date() })
      .where(eq(workspaceMemberships.id, existing.id));
    membershipId = existing.id;
    await db.delete(membershipSites).where(eq(membershipSites.membershipId, membershipId));
  } else {
    const [m] = await db
      .insert(workspaceMemberships)
      .values({
        workspaceId: inv.workspaceId,
        profileId: profile.id,
        role: inv.role,
        siteScope: inv.siteScope,
      })
      .returning({ id: workspaceMemberships.id });
    membershipId = m.id;
  }

  const siteIds = (inv.siteIds ?? []) as string[];
  if (inv.siteScope === "specific" && siteIds.length > 0) {
    // Only link sites that still belong to the workspace.
    const valid = await db
      .select({ id: tenants.id })
      .from(tenants)
      .where(and(eq(tenants.workspaceId, inv.workspaceId), inArray(tenants.id, siteIds)));
    if (valid.length > 0) {
      await db
        .insert(membershipSites)
        .values(valid.map((v) => ({ membershipId, tenantId: v.id })))
        .onConflictDoNothing();
    }
  }

  await db
    .update(workspaceInvitations)
    .set({ status: "accepted", updatedAt: new Date() })
    .where(eq(workspaceInvitations.id, inv.id));

  revalidatePath("/[locale]/team", "page");
  revalidatePath("/[locale]/sites", "page");
  return { ok: true };
}

/** Revoke a pending invitation (owner, or the web-master who created it). */
export async function revokeInvitation(invitationId: string): Promise<void> {
  const caller = await requireProfile();
  const [inv] = await db
    .select()
    .from(workspaceInvitations)
    .where(eq(workspaceInvitations.id, invitationId))
    .limit(1);
  if (!inv) throw new Error("Invitation not found");

  const callerRole = await getWorkspaceRoleForCaller(inv.workspaceId, caller);
  const isCreator = inv.invitedByProfileId === caller.id;
  if (callerRole !== "owner" && !(callerRole === "webmaster" && isCreator)) {
    throw new Error("You cannot revoke this invitation");
  }

  await db
    .update(workspaceInvitations)
    .set({ status: "revoked", updatedAt: new Date() })
    .where(eq(workspaceInvitations.id, invitationId));

  revalidatePath("/[locale]/team", "page");
}

/** Re-send a pending invitation with a fresh token + expiry. */
export async function resendInvitation(invitationId: string, locale = "en"): Promise<void> {
  const caller = await requireProfile();
  const [inv] = await db
    .select()
    .from(workspaceInvitations)
    .where(eq(workspaceInvitations.id, invitationId))
    .limit(1);
  if (!inv) throw new Error("Invitation not found");
  if (inv.status !== "pending") throw new Error("Only pending invitations can be resent");

  const callerRole = await getWorkspaceRoleForCaller(inv.workspaceId, caller);
  const isCreator = inv.invitedByProfileId === caller.id;
  if (callerRole !== "owner" && !(callerRole === "webmaster" && isCreator)) {
    throw new Error("You cannot resend this invitation");
  }

  const token = generateInviteToken();
  const expiresAt = getInviteExpiry();
  await db
    .update(workspaceInvitations)
    .set({ token, expiresAt, updatedAt: new Date() })
    .where(eq(workspaceInvitations.id, invitationId));

  try {
    await sendTeamInviteEmail({
      to: inv.email,
      invitedName: inv.invitedName,
      inviterName: caller.name || caller.email,
      role: inv.role as InviteRole,
      locale,
      token,
    });
  } catch (err) {
    console.error("Failed to resend invite email:", err);
  }

  revalidatePath("/[locale]/team", "page");
}
