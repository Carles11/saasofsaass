import { jsonb, pgTable, primaryKey, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { tenants, workspaces } from "../schema";

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name").notNull().default(""),
  avatarUrl: text("avatar_url"),
  role: text("role").notNull().default("user"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const tenantMemberships = pgTable("tenant_memberships", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  profileId: uuid("profile_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  role: text("role").notNull().default("editor"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  uniqueMembership: unique().on(t.tenantId, t.profileId),
}));

// ============================================
// WORKSPACE MEMBERSHIPS
// ============================================
export const workspaceMemberships = pgTable("workspace_memberships", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  profileId: uuid("profile_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  role: text("role").notNull().default("editor"),
  siteScope: text("site_scope").notNull().default("specific"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  uniqueWorkspaceProfile: unique().on(t.workspaceId, t.profileId),
}));

// ============================================
// MEMBERSHIP SITES — which tenants a scoped membership covers
// ============================================
export const membershipSites = pgTable("membership_sites", {
  membershipId: uuid("membership_id")
    .notNull()
    .references(() => workspaceMemberships.id, { onDelete: "cascade" }),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
}, (t) => ({
  compositePrimaryKey: primaryKey({ columns: [t.membershipId, t.tenantId] }),
}));

// ============================================
// WORKSPACE INVITATIONS
// ============================================
export const workspaceInvitations = pgTable("workspace_invitations", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  invitedName: text("invited_name"),
  role: text("role").notNull().default("editor"),
  siteScope: text("site_scope").notNull().default("specific"),
  siteIds: jsonb("site_ids").$type<string[]>().notNull().default([]),
  token: text("token").notNull().unique(),
  status: text("status").notNull().default("pending"),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  invitedByProfileId: uuid("invited_by_profile_id")
    .references(() => profiles.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
export type TenantMembership = typeof tenantMemberships.$inferSelect;
export type NewTenantMembership = typeof tenantMemberships.$inferInsert;
export type WorkspaceMembership = typeof workspaceMemberships.$inferSelect;
export type NewWorkspaceMembership = typeof workspaceMemberships.$inferInsert;
export type MembershipSite = typeof membershipSites.$inferSelect;
export type NewMembershipSite = typeof membershipSites.$inferInsert;
export type WorkspaceInvitation = typeof workspaceInvitations.$inferSelect;
export type NewWorkspaceInvitation = typeof workspaceInvitations.$inferInsert;
