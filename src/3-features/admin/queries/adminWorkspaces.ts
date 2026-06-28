import { assertSuperAdmin } from "@/5-shared/lib/auth/authorization";
import { db } from "@/5-shared/lib/db";
import { workspaces, tenants } from "@/5-shared/lib/db/schema";
import { profiles, workspaceMemberships, workspaceInvitations } from "@/5-shared/lib/db/schema/auth";
import { and, desc, eq, sql } from "drizzle-orm";

export interface AdminWorkspaceRow {
  id: string;
  name: string;
  plan: string;
  subscriptionStatus: string | null;
  ownerName: string;
  ownerEmail: string;
  ownerAvatar: string | null;
  totalSites: number;
  publishedSites: number;
  memberCount: number;
  createdAt: Date;
}

/** Every workspace with owner + rollup counts, for the admin table. Super-admin only. */
export async function listAdminWorkspaces(): Promise<AdminWorkspaceRow[]> {
  await assertSuperAdmin();

  const rows = await db
    .select({
      id: workspaces.id,
      name: workspaces.name,
      plan: workspaces.plan,
      subscriptionStatus: workspaces.subscriptionStatus,
      ownerName: profiles.name,
      ownerEmail: profiles.email,
      ownerAvatar: profiles.avatarUrl,
      totalSites: sql<number>`(select count(*) from ${tenants} where ${tenants.workspaceId} = ${workspaces.id})`,
      publishedSites: sql<number>`(select count(*) from ${tenants} where ${tenants.workspaceId} = ${workspaces.id} and ${tenants.status} = 'published')`,
      memberCount: sql<number>`(select count(*) from ${workspaceMemberships} where ${workspaceMemberships.workspaceId} = ${workspaces.id})`,
      createdAt: workspaces.createdAt,
    })
    .from(workspaces)
    .innerJoin(profiles, eq(workspaces.ownerProfileId, profiles.id))
    .orderBy(desc(workspaces.createdAt));

  return rows.map((r) => ({
    ...r,
    totalSites: Number(r.totalSites),
    publishedSites: Number(r.publishedSites),
    memberCount: Number(r.memberCount),
  }));
}

export interface AdminWorkspaceDetail {
  id: string;
  name: string;
  plan: string;
  subscriptionStatus: string | null;
  addonSites: number;
  siteLimit: number;
  stripeCustomerId: string | null;
  createdAt: Date;
  owner: { id: string; name: string; email: string; avatarUrl: string | null } | null;
  sites: { id: string; name: string; slug: string; status: string }[];
  members: { membershipId: string; name: string; email: string; role: string; siteScope: string }[];
  pendingInvites: { id: string; email: string; role: string; createdAt: Date }[];
}

/** Full drill-in for one workspace. Super-admin only. */
export async function getAdminWorkspaceDetail(
  workspaceId: string,
): Promise<AdminWorkspaceDetail | null> {
  await assertSuperAdmin();

  const [ws] = await db
    .select({
      id: workspaces.id,
      name: workspaces.name,
      plan: workspaces.plan,
      subscriptionStatus: workspaces.subscriptionStatus,
      addonSites: workspaces.addonSites,
      siteLimit: workspaces.siteLimit,
      stripeCustomerId: workspaces.stripeCustomerId,
      createdAt: workspaces.createdAt,
      ownerProfileId: workspaces.ownerProfileId,
    })
    .from(workspaces)
    .where(eq(workspaces.id, workspaceId))
    .limit(1);
  if (!ws) return null;

  const [owner] = await db
    .select({
      id: profiles.id,
      name: profiles.name,
      email: profiles.email,
      avatarUrl: profiles.avatarUrl,
    })
    .from(profiles)
    .where(eq(profiles.id, ws.ownerProfileId))
    .limit(1);

  const sites = await db
    .select({ id: tenants.id, name: tenants.name, slug: tenants.slug, status: tenants.status })
    .from(tenants)
    .where(eq(tenants.workspaceId, workspaceId))
    .orderBy(tenants.name);

  const members = await db
    .select({
      membershipId: workspaceMemberships.id,
      name: profiles.name,
      email: profiles.email,
      role: workspaceMemberships.role,
      siteScope: workspaceMemberships.siteScope,
    })
    .from(workspaceMemberships)
    .innerJoin(profiles, eq(workspaceMemberships.profileId, profiles.id))
    .where(eq(workspaceMemberships.workspaceId, workspaceId));

  const pendingInvites = await db
    .select({
      id: workspaceInvitations.id,
      email: workspaceInvitations.email,
      role: workspaceInvitations.role,
      createdAt: workspaceInvitations.createdAt,
    })
    .from(workspaceInvitations)
    .where(
      and(
        eq(workspaceInvitations.workspaceId, workspaceId),
        eq(workspaceInvitations.status, "pending"),
      ),
    );

  return {
    id: ws.id,
    name: ws.name,
    plan: ws.plan,
    subscriptionStatus: ws.subscriptionStatus,
    addonSites: ws.addonSites,
    siteLimit: ws.siteLimit,
    stripeCustomerId: ws.stripeCustomerId,
    createdAt: ws.createdAt,
    owner: owner ?? null,
    sites,
    members,
    pendingInvites,
  };
}
