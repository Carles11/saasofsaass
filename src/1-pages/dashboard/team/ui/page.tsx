import { db } from "@/5-shared/lib/db";
import { tenants } from "@/5-shared/lib/db/schema";
import { profiles, tenantMemberships } from "@/5-shared/lib/db/schema/auth";
import {
  getPlatformTranslationsByNamespaces,
  resolveNamespacedTranslation,
} from "@/5-shared/lib/db/platform-translations";
import { eq, inArray } from "drizzle-orm";
import { TeamManager } from "@/2-widgets/dashboard/TeamManager/ui/TeamManager";
import { getCurrentProfile } from "@/5-shared/lib/auth/authorization";

interface TeamPageProps {
  locale: string;
}

export async function TeamPage({ locale }: TeamPageProps) {
  const translations = await getPlatformTranslationsByNamespaces(
    ["dashboard.team", "dashboard.team-manager"],
    locale || "en",
  );

  const signInRequired = resolveNamespacedTranslation(
    translations,
    "dashboard.team",
    "sign-in-required",
    "Please sign in.",
  );
  const noTenantAccess = resolveNamespacedTranslation(
    translations,
    "dashboard.team",
    "no-tenant-access",
    "You don't have access to any tenants yet.",
  );
  const ownersOnly = resolveNamespacedTranslation(
    translations,
    "dashboard.team",
    "owners-only",
    "Only tenant owners can manage team members.",
  );
  const title = resolveNamespacedTranslation(
    translations,
    "dashboard.team",
    "title",
    "Team Management",
  );

  const profile = await getCurrentProfile();
  if (!profile) return <p className="text-muted-foreground p-6">{signInRequired}</p>;

  // Get all tenants the user has access to
  const memberships = await db
    .select()
    .from(tenantMemberships)
    .where(eq(tenantMemberships.profileId, profile.id));

  if (memberships.length === 0) {
    return (
      <main className="min-h-screen bg-background p-6 md:p-12">
        <p className="text-muted-foreground">{noTenantAccess}</p>
      </main>
    );
  }

  // For now show all tenants the user is an owner of
  const ownedTenantIds = memberships
    .filter((m) => m.role === "owner")
    .map((m) => m.tenantId);

  if (ownedTenantIds.length === 0) {
    return (
      <main className="min-h-screen bg-background p-6 md:p-12">
        <h1 className="text-2xl font-bold mb-4">Team</h1>
        <p className="text-muted-foreground">{ownersOnly}</p>
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
    <main className="min-h-screen bg-background p-6 md:p-12">
      <div className="max-w-3xl mx-auto space-y-8">
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        {tenantTeams.map(({ tenant, members }) => (
          <TeamManager
            key={tenant.id}
            tenant={tenant}
            initialMembers={members}
            currentProfileId={profile.id}
            translations={translations["dashboard.team-manager"]}
          />
        ))}
      </div>
    </main>
  );
}
