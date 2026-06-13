import { db } from "@/5-shared/lib/db";
import { tenants } from "@/5-shared/lib/db/schema";
import { tenantMemberships } from "@/5-shared/lib/db/schema/auth";
import { eq, and, sql } from "drizzle-orm";
import { resolveRoles } from "@/5-shared/config/permissions/roles";
import { getWorkspaceByProfileId, countActiveTenants } from "@/3-features/manage-billing/actions/billingHelpers";

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
      <p className="text-sm text-muted-foreground font-medium">{label}</p>
      <p className="text-3xl font-black text-foreground tracking-tighter mt-1">
        {value}
      </p>
      {sub && (
        <p className="text-xs text-muted-foreground mt-1">{sub}</p>
      )}
    </div>
  );
}

export async function DashboardOverview({ locale }: { locale?: string }) {
  const roles = await resolveRoles();

  if (!roles) {
    return (
      <main className="min-h-screen bg-background p-6 md:p-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-black text-foreground tracking-tighter">
            Dashboard
          </h1>
          <p className="text-muted-foreground font-medium mt-2">
            Sign in to view your dashboard.
          </p>
        </div>
      </main>
    );
  }

  const workspace = await getWorkspaceByProfileId(roles.profileId);
  const currentSites = workspace ? await countActiveTenants(workspace.id) : 0;

  const [editorResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(tenantMemberships)
    .where(eq(tenantMemberships.profileId, roles.profileId));

  const myMemberships = Number(editorResult?.count ?? 0);

  const planLabel = workspace?.plan ?? "—";
  const siteLimit = workspace?.siteLimit ?? 0;

  return (
    <main className="min-h-screen bg-background p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-black text-foreground tracking-tighter mb-8">
          Dashboard
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard label="Total Sites" value={currentSites} />
          <StatCard label="Active Editors" value={myMemberships} />
          <StatCard
            label="Pending Invites"
            value="—"
            sub="TODO: invite system"
          />
          <StatCard label="Workspace Plan" value={planLabel} />
          <StatCard
            label="Site Usage"
            value={`${currentSites} / ${siteLimit}`}
            sub={siteLimit > 0 ? `${Math.round((currentSites / siteLimit) * 100)}% used` : undefined}
          />
          <StatCard
            label="Recent Activity"
            value="—"
            sub="TODO: activity feed"
          />
        </div>
      </div>
    </main>
  );
}
