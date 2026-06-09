import { db } from "@/5-shared/lib/db";
import { tenants } from "@/5-shared/lib/db/schema";
import { profiles, tenantMemberships } from "@/5-shared/lib/db/schema/auth";
import { eq, inArray } from "drizzle-orm";
import { TeamManager } from "@/2-widgets/dashboard/TeamManager/ui/TeamManager";
import { getCurrentProfile } from "@/5-shared/lib/auth/authorization";

interface TeamPageProps {
  locale: string;
}

export async function TeamPage({ locale }: TeamPageProps) {
  const profile = await getCurrentProfile();
  if (!profile) return <p className="text-zinc-500 p-6">Please sign in.</p>;

  // Get all tenants the user has access to
  const memberships = await db
    .select()
    .from(tenantMemberships)
    .where(eq(tenantMemberships.profileId, profile.id));

  if (memberships.length === 0) {
    return (
      <main className="min-h-screen bg-zinc-50 p-6 md:p-12">
        <p className="text-zinc-500">You don&apos;t have access to any tenants yet.</p>
      </main>
    );
  }

  // For now show all tenants the user is an owner of
  const ownedTenantIds = memberships
    .filter((m) => m.role === "owner")
    .map((m) => m.tenantId);

  if (ownedTenantIds.length === 0) {
    return (
      <main className="min-h-screen bg-zinc-50 p-6 md:p-12">
        <h1 className="text-2xl font-bold mb-4">Team</h1>
        <p className="text-zinc-500">Only tenant owners can manage team members.</p>
      </main>
    );
  }

  const ownedTenants = await db
    .select()
    .from(tenants)
    .where(inArray(tenants.id, ownedTenantIds));

  // Fetch members for each owned tenant
  const tenantTeams = await Promise.all(
    ownedTenants.map(async (tenant) => {
      const members = await db
        .select({ membership: tenantMemberships, profile: profiles })
        .from(tenantMemberships)
        .innerJoin(profiles, eq(tenantMemberships.profileId, profiles.id))
        .where(eq(tenantMemberships.tenantId, tenant.id))
        .orderBy(tenantMemberships.role);

      return { tenant, members };
    }),
  );

  return (
    <main className="min-h-screen bg-zinc-50 p-6 md:p-12">
      <div className="max-w-3xl mx-auto space-y-8">
        <h1 className="text-2xl font-bold text-zinc-900">Team Management</h1>
        {tenantTeams.map(({ tenant, members }) => (
          <TeamManager key={tenant.id} tenant={tenant} initialMembers={members} />
        ))}
      </div>
    </main>
  );
}
