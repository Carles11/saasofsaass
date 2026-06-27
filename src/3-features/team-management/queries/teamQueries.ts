import { db } from "@/5-shared/lib/db";
import { tenants, workspaces } from "@/5-shared/lib/db/schema";
import {
  profiles,
  workspaceMemberships,
  membershipSites,
  workspaceInvitations,
} from "@/5-shared/lib/db/schema/auth";
import { and, eq, inArray } from "drizzle-orm";
import {
  requireProfile,
  assertCanManageStructure,
} from "@/5-shared/lib/auth/authorization";
import { getWorkspaceRoleForCaller } from "../lib/teamAccess";

export interface TeamPerson {
  profileId: string;
  name: string;
  email: string;
  avatarUrl: string | null;
}

export interface TeamMemberView extends TeamPerson {
  membershipId: string;
  role: "webmaster" | "editor";
  siteScope: "all" | "specific";
  siteIds: string[];
}

export interface TeamPendingInvite {
  id: string;
  email: string;
  invitedName: string | null;
  role: "webmaster" | "editor";
  siteScope: "all" | "specific";
  siteIds: string[];
  createdAt: Date;
  expiresAt: Date;
}

export interface TeamView {
  callerRole: "owner" | "webmaster";
  owner: TeamPerson | null;
  members: TeamMemberView[];
  pending: TeamPendingInvite[];
  sites: { id: string; name: string }[];
}

/** Full team view for the workspace-wide /team page (owner or web-master only). */
export async function listTeam(workspaceId: string): Promise<TeamView> {
  const caller = await requireProfile();
  const callerRole = await getWorkspaceRoleForCaller(workspaceId, caller);
  if (callerRole !== "owner" && callerRole !== "webmaster") {
    throw new Error("You don't have access to this team");
  }

  const [ws] = await db
    .select({ ownerProfileId: workspaces.ownerProfileId })
    .from(workspaces)
    .where(eq(workspaces.id, workspaceId))
    .limit(1);

  let owner: TeamPerson | null = null;
  if (ws) {
    const [op] = await db
      .select({
        profileId: profiles.id,
        name: profiles.name,
        email: profiles.email,
        avatarUrl: profiles.avatarUrl,
      })
      .from(profiles)
      .where(eq(profiles.id, ws.ownerProfileId))
      .limit(1);
    owner = op ?? null;
  }

  const memberRows = await db
    .select({ membership: workspaceMemberships, profile: profiles })
    .from(workspaceMemberships)
    .innerJoin(profiles, eq(workspaceMemberships.profileId, profiles.id))
    .where(eq(workspaceMemberships.workspaceId, workspaceId))
    .orderBy(workspaceMemberships.role);

  const membershipIds = memberRows.map((r) => r.membership.id);
  const siteLinks = membershipIds.length
    ? await db
        .select({
          membershipId: membershipSites.membershipId,
          tenantId: membershipSites.tenantId,
        })
        .from(membershipSites)
        .where(inArray(membershipSites.membershipId, membershipIds))
    : [];
  const siteMap = new Map<string, string[]>();
  for (const l of siteLinks) {
    const arr = siteMap.get(l.membershipId) ?? [];
    arr.push(l.tenantId);
    siteMap.set(l.membershipId, arr);
  }

  const members: TeamMemberView[] = memberRows.map((r) => ({
    membershipId: r.membership.id,
    profileId: r.profile.id,
    name: r.profile.name,
    email: r.profile.email,
    avatarUrl: r.profile.avatarUrl,
    role: r.membership.role as "webmaster" | "editor",
    siteScope: r.membership.siteScope as "all" | "specific",
    siteIds: siteMap.get(r.membership.id) ?? [],
  }));

  const pendingRows = await db
    .select({
      id: workspaceInvitations.id,
      email: workspaceInvitations.email,
      invitedName: workspaceInvitations.invitedName,
      role: workspaceInvitations.role,
      siteScope: workspaceInvitations.siteScope,
      siteIds: workspaceInvitations.siteIds,
      createdAt: workspaceInvitations.createdAt,
      expiresAt: workspaceInvitations.expiresAt,
    })
    .from(workspaceInvitations)
    .where(
      and(
        eq(workspaceInvitations.workspaceId, workspaceId),
        eq(workspaceInvitations.status, "pending"),
      ),
    )
    .orderBy(workspaceInvitations.createdAt);

  const pending: TeamPendingInvite[] = pendingRows.map((p) => ({
    id: p.id,
    email: p.email,
    invitedName: p.invitedName,
    role: p.role as "webmaster" | "editor",
    siteScope: p.siteScope as "all" | "specific",
    siteIds: (p.siteIds ?? []) as string[],
    createdAt: p.createdAt,
    expiresAt: p.expiresAt,
  }));

  const sites = await db
    .select({ id: tenants.id, name: tenants.name })
    .from(tenants)
    .where(eq(tenants.workspaceId, workspaceId))
    .orderBy(tenants.name);

  return { callerRole, owner, members, pending, sites };
}

export interface SiteCollaborator extends TeamPerson {
  role: "owner" | "webmaster" | "editor";
  membershipId: string | null;
}

/**
 * Everyone with access to a single site (for the in-builder collaborators
 * panel). Caller must be able to manage the site's structure.
 */
export async function listSiteCollaborators(tenantId: string): Promise<{
  owner: TeamPerson | null;
  collaborators: SiteCollaborator[];
}> {
  await assertCanManageStructure(tenantId);

  const [t] = await db
    .select({ workspaceId: tenants.workspaceId })
    .from(tenants)
    .where(eq(tenants.id, tenantId))
    .limit(1);
  if (!t?.workspaceId) return { owner: null, collaborators: [] };
  const workspaceId = t.workspaceId;

  const [ws] = await db
    .select({ ownerProfileId: workspaces.ownerProfileId })
    .from(workspaces)
    .where(eq(workspaces.id, workspaceId))
    .limit(1);

  let owner: TeamPerson | null = null;
  if (ws) {
    const [op] = await db
      .select({
        profileId: profiles.id,
        name: profiles.name,
        email: profiles.email,
        avatarUrl: profiles.avatarUrl,
      })
      .from(profiles)
      .where(eq(profiles.id, ws.ownerProfileId))
      .limit(1);
    owner = op ?? null;
  }

  // Members with all-sites scope.
  const allScope = await db
    .select({ membership: workspaceMemberships, profile: profiles })
    .from(workspaceMemberships)
    .innerJoin(profiles, eq(workspaceMemberships.profileId, profiles.id))
    .where(
      and(
        eq(workspaceMemberships.workspaceId, workspaceId),
        eq(workspaceMemberships.siteScope, "all"),
      ),
    );

  // Members scoped specifically to this site.
  const specific = await db
    .select({ membership: workspaceMemberships, profile: profiles })
    .from(membershipSites)
    .innerJoin(
      workspaceMemberships,
      eq(membershipSites.membershipId, workspaceMemberships.id),
    )
    .innerJoin(profiles, eq(workspaceMemberships.profileId, profiles.id))
    .where(
      and(
        eq(membershipSites.tenantId, tenantId),
        eq(workspaceMemberships.siteScope, "specific"),
      ),
    );

  const seen = new Set<string>();
  const collaborators: SiteCollaborator[] = [];
  for (const r of [...allScope, ...specific]) {
    if (seen.has(r.membership.id)) continue;
    seen.add(r.membership.id);
    collaborators.push({
      membershipId: r.membership.id,
      profileId: r.profile.id,
      name: r.profile.name,
      email: r.profile.email,
      avatarUrl: r.profile.avatarUrl,
      role: r.membership.role as "webmaster" | "editor",
    });
  }

  return { owner, collaborators };
}

export interface InvitationDisplay {
  email: string;
  invitedName: string | null;
  role: "webmaster" | "editor";
  siteScope: "all" | "specific";
  siteNames: string[];
  inviterName: string | null;
  status: "pending" | "accepted" | "revoked" | "expired";
}

/**
 * Public, token-gated view of an invitation for the accept landing page.
 * The token is the secret, so no session is required to read it.
 */
export async function getInvitationForDisplay(
  token: string,
): Promise<InvitationDisplay | null> {
  const [inv] = await db
    .select()
    .from(workspaceInvitations)
    .where(eq(workspaceInvitations.token, token))
    .limit(1);
  if (!inv) return null;

  let inviterName: string | null = null;
  if (inv.invitedByProfileId) {
    const [p] = await db
      .select({ name: profiles.name, email: profiles.email })
      .from(profiles)
      .where(eq(profiles.id, inv.invitedByProfileId))
      .limit(1);
    inviterName = p ? p.name || p.email : null;
  }

  const siteIds = (inv.siteIds ?? []) as string[];
  let siteNames: string[] = [];
  if (inv.siteScope === "specific" && siteIds.length > 0) {
    const rows = await db
      .select({ name: tenants.name })
      .from(tenants)
      .where(inArray(tenants.id, siteIds));
    siteNames = rows.map((r) => r.name);
  }

  const expired = new Date(inv.expiresAt) < new Date();
  const status =
    inv.status !== "pending"
      ? (inv.status as "accepted" | "revoked" | "expired")
      : expired
        ? "expired"
        : "pending";

  return {
    email: inv.email,
    invitedName: inv.invitedName,
    role: inv.role as "webmaster" | "editor",
    siteScope: inv.siteScope as "all" | "specific",
    siteNames,
    inviterName,
    status,
  };
}
