import {
  countPublishedTenants,
  getWorkspaceByProfileId,
} from "@/3-features/manage-billing/actions/billingHelpers";
import { resolveRoles } from "@/5-shared/config/permissions/roles";
import { db } from "@/5-shared/lib/db";
import { tenants } from "@/5-shared/lib/db/schema";
import { workspaceMemberships } from "@/5-shared/lib/db/schema/auth";
import { and, eq, sql } from "drizzle-orm";
import { PLAN_LABELS, type PlanId } from "@/5-shared/lib/billing/plans";

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
    <div className="bg-card border border-border p-6 shadow-sm">
      <p className="text-sm text-muted-foreground font-medium">{label}</p>
      <p className="text-3xl font-black text-foreground tracking-tighter mt-1">
        {value}
      </p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
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
  const publishedSites = workspace ? await countPublishedTenants(workspace.id) : 0;

  const [draftResult] = workspace
    ? await db
        .select({ count: sql<number>`count(*)` })
        .from(tenants)
        .where(and(eq(tenants.workspaceId, workspace.id), eq(tenants.status, "draft")))
    : [{ count: 0 }];
  const draftSites = Number(draftResult?.count ?? 0);

  const [teamResult] = workspace
    ? await db
        .select({ count: sql<number>`count(*)` })
        .from(workspaceMemberships)
        .where(eq(workspaceMemberships.workspaceId, workspace.id))
    : [{ count: 0 }];

  const teamMembers = Number(teamResult?.count ?? 0);

  const planLabel = workspace ? PLAN_LABELS[workspace.plan as PlanId] ?? workspace.plan : "—";
  const siteLimit = workspace?.siteLimit ?? 0;
  const limitLabel = siteLimit < 0 ? "∞" : String(siteLimit);

  return (
    <main className="min-h-screen bg-background p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-black text-foreground tracking-tighter mb-8">
          Dashboard
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard label="Published" value={publishedSites} />
          <StatCard label="Drafts" value={draftSites} sub="Unlimited on every plan" />
          <StatCard label="Team Members" value={teamMembers} />
          <StatCard label="Workspace Plan" value={planLabel} />
          <StatCard
            label="Published Usage"
            value={`${publishedSites} / ${limitLabel}`}
            sub={
              siteLimit > 0
                ? `${Math.round((publishedSites / siteLimit) * 100)}% used`
                : siteLimit < 0
                  ? "Unlimited"
                  : undefined
            }
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
