import { getPlatformMetrics } from "@/3-features/admin/queries/platformMetrics";
import { listAdminWorkspaces } from "@/3-features/admin/queries/adminWorkspaces";
import { AdminWorkspacesTable } from "@/2-widgets/dashboard/AdminWorkspaces";
import { PLAN_LABELS, PLAN_ORDER, type PlanId } from "@/5-shared/lib/billing/plans";

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

export async function AdminDashboardPage({ locale }: { locale: string }) {
  const [metrics, rows] = await Promise.all([
    getPlatformMetrics(),
    listAdminWorkspaces(),
  ]);

  return (
    <main className="min-h-screen bg-background p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-black text-foreground tracking-tighter mb-8">
          Admin
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard label="Users" value={metrics.users} />
          <StatCard label="Workspaces" value={metrics.workspaces} />
          <StatCard
            label="Total Sites"
            value={metrics.sites.total}
            sub={`${metrics.sites.published} published · ${metrics.sites.draft} draft · ${metrics.sites.archived} archived`}
          />
          <StatCard label="Approx. MRR" value={`€${metrics.approxMrrEur}`} />
          <StatCard label="Platform Fees" value={`€${metrics.platformFeeEur}`} />
          <StatCard label="Pending Invitations" value={metrics.pendingInvitations} />
          <StatCard label="Domains Pending" value={metrics.domainsPending} />
          <StatCard label="AI Blocks Used" value={metrics.aiBlocksUsed} />
          <StatCard
            label="Sign-ups (7d / 30d)"
            value={`${metrics.signups7d} / ${metrics.signups30d}`}
          />
        </div>

        <div className="bg-card border border-border p-6 shadow-sm mb-8">
          <h2 className="text-lg font-bold text-card-foreground mb-4">
            Per-Plan Breakdown
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 py-2">
                    Plan
                  </th>
                  <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 py-2">
                    Workspaces
                  </th>
                  <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 py-2">
                    Active Subs
                  </th>
                </tr>
              </thead>
              <tbody>
                {PLAN_ORDER.map((plan) => (
                  <tr key={plan} className="border-b border-border last:border-0">
                    <td className="px-3 py-2 font-semibold text-card-foreground">
                      {PLAN_LABELS[plan]}
                    </td>
                    <td className="px-3 py-2 text-right text-card-foreground">
                      {metrics.workspacesByPlan[plan] ?? 0}
                    </td>
                    <td className="px-3 py-2 text-right text-card-foreground">
                      {metrics.activeSubsByPlan[plan] ?? 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <AdminWorkspacesTable rows={rows} locale={locale} />
      </div>
    </main>
  );
}
