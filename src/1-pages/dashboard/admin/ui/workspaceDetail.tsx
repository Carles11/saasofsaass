import Link from "next/link";
import { AdminWorkspaceControls } from "@/2-widgets/dashboard/AdminWorkspaces";
import { PLAN_LABELS, type PlanId } from "@/5-shared/lib/billing/plans";
import type { AdminWorkspaceDetail } from "@/3-features/admin/queries/adminWorkspaces";

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    published:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    draft: "bg-muted text-muted-foreground",
    archived:
      "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  };
  const cls = styles[status] ?? styles.draft;
  return (
    <span
      className={`inline-flex items-center rounded-full gap-1.5 px-2.5 py-0.5 text-xs font-semibold ${cls}`}
    >
      <span className="rounded-full size-1.5 bg-current" />
      {status}
    </span>
  );
}

function SubscriptionPill({ status }: { status: string | null }) {
  if (!status) return null;
  const styles: Record<string, string> = {
    active: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    past_due: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    canceled: "bg-muted text-muted-foreground",
    trialing: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  };
  const cls = styles[status] ?? "bg-muted text-muted-foreground";
  const label = status.replace(/_/g, " ");
  return (
    <span
      className={`inline-flex items-center rounded-full gap-1.5 px-2.5 py-0.5 text-xs font-semibold ${cls}`}
    >
      <span className="rounded-full size-1.5 bg-current" />
      {label}
    </span>
  );
}

export async function AdminWorkspaceDetailPage({
  detail,
  locale,
}: {
  detail: AdminWorkspaceDetail;
  locale: string;
}) {
  return (
    <main className="min-h-screen bg-background p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <Link
          href={`/${locale}/admin`}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 inline-block"
        >
          &larr; Back to Admin
        </Link>

        <h1 className="text-4xl font-black text-foreground tracking-tighter mb-2">
          {detail.name}
        </h1>

        <div className="bg-card border border-border rounded-xl p-6 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Owner
              </p>
              <p className="text-sm font-semibold text-card-foreground mt-1">
                {detail.owner?.name ?? "—"}
              </p>
              {detail.owner?.email && (
                <p className="text-xs text-muted-foreground">
                  {detail.owner.email}
                </p>
              )}
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Plan
              </p>
              <p className="text-sm font-semibold text-card-foreground mt-1">
                {PLAN_LABELS[detail.plan as PlanId] ?? detail.plan}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Subscription
              </p>
              <div className="mt-1">
                <SubscriptionPill status={detail.subscriptionStatus} />
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Stripe Customer
              </p>
              <p className="text-sm font-semibold text-card-foreground mt-1 font-mono">
                {detail.stripeCustomerId ?? "—"}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Site Limit
              </p>
              <p className="text-sm font-semibold text-card-foreground mt-1">
                {detail.siteLimit}
                {detail.addonSites > 0 && (
                  <span className="text-muted-foreground font-normal">
                    {" "}
                    (+{detail.addonSites} add-on)
                  </span>
                )}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Created
              </p>
              <p className="text-sm font-semibold text-card-foreground mt-1">
                {detail.createdAt.toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        <AdminWorkspaceControls
          workspaceId={detail.id}
          currentPlan={detail.plan}
          addonSites={detail.addonSites}
          sites={detail.sites}
        />

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-base font-bold text-card-foreground mb-4">
              Members
            </h3>
            {detail.members.length === 0 ? (
              <p className="text-sm text-muted-foreground">No members.</p>
            ) : (
              <div className="space-y-3">
                {detail.members.map((m) => (
                  <div
                    key={m.membershipId}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-semibold text-card-foreground">
                        {m.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {m.email}
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {m.role}
                      {m.siteScope === "specific" && (
                        <span className="text-muted-foreground/60">
                          {" "}
                          (specific)
                        </span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-base font-bold text-card-foreground mb-4">
              Pending Invitations
            </h3>
            {detail.pendingInvites.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No pending invitations.
              </p>
            ) : (
              <div className="space-y-3">
                {detail.pendingInvites.map((inv) => (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-semibold text-card-foreground">
                        {inv.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Role: {inv.role} ·{" "}
                        {inv.createdAt.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
