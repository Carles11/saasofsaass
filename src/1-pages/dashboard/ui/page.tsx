import { CreateTenantDialog } from "@/2-widgets/dashboard/CreateTenantDialog";
import { BillingStatus } from "@/2-widgets/dashboard/BillingStatus";
import { SitesTable } from "@/2-widgets/dashboard/SitesTable";
import { db } from "@/5-shared/lib/db";
import { tenantDomains } from "@/5-shared/lib/db/schema";
import { getAccessibleSites } from "@/4-entities/tenant";
import {
  getPlatformTranslationsByNamespaces,
  resolveNamespacedTranslation,
} from "@/5-shared/lib/db/platform-translations";
import { and, eq, inArray } from "drizzle-orm";
import { getCurrentProfile } from "@/5-shared/lib/auth/authorization";
import {
  getWorkspaceByProfileId,
  countPublishedTenants,
} from "@/3-features/manage-billing/actions/billingHelpers";
import { getNextPlan } from "@/5-shared/lib/billing/plans";

export async function DashboardPage({ locale }: { locale?: string }) {
  const profile = await getCurrentProfile();
  const accessible = profile ? await getAccessibleSites(profile.id) : [];

  const userTenants = accessible.map((a) => a.tenant);
  const roles = accessible.map((a) => ({ tenantId: a.tenant.id, role: a.role }));
  const manageableTenantIds = accessible
    .filter((a) => a.role === "owner" || a.role === "webmaster")
    .map((a) => a.tenant.id);
  const tenantIds = userTenants.map((t) => t.id);

  const workspace = profile ? await getWorkspaceByProfileId(profile.id) : null;
  const currentSites = workspace ? await countPublishedTenants(workspace.id) : 0;

  const domains = tenantIds.length > 0
    ? await db
        .select({ tenantId: tenantDomains.tenantId, domain: tenantDomains.domain, status: tenantDomains.status })
        .from(tenantDomains)
        .where(and(eq(tenantDomains.isPrimary, true), inArray(tenantDomains.tenantId, tenantIds)))
    : [];

  const translations = await getPlatformTranslationsByNamespaces(
    ["dashboard.page", "dashboard.create-tenant"],
    locale ?? "en",
  );

  const title = resolveNamespacedTranslation(
    translations,
    "dashboard.page",
    "title",
    "Workshop",
  );
  const tenantCountLabel = resolveNamespacedTranslation(
    translations,
    "dashboard.page",
    "tenant-count",
    "{count} tenant(s)",
    { count: userTenants.length },
  );
  const createTenantTranslations = translations["dashboard.create-tenant"];

  return (
    <main className="min-h-screen bg-background p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-foreground tracking-tighter">{title}</h1>
            <p className="text-muted-foreground font-medium">
              {tenantCountLabel}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <CreateTenantDialog translations={createTenantTranslations} />
            <div className="flex items-center space-x-4 bg-card p-2 pr-6 rounded-full border border-border shadow-sm">
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs">
                {profile?.name?.slice(0, 2).toUpperCase() || profile?.email?.slice(0, 2).toUpperCase() || "AD"}
              </div>
              <span className="text-xs font-bold text-card-foreground uppercase tracking-tight">
                {profile?.name || profile?.email || "Admin"}
              </span>
            </div>
          </div>
        </header>
        {workspace && (
          <BillingStatus
            workspaceId={workspace.id}
            plan={workspace.plan}
            siteLimit={workspace.siteLimit}
            currentSites={currentSites}
            subscriptionStatus={workspace.subscriptionStatus}
            stripeCustomerId={workspace.stripeCustomerId}
            nextPlan={getNextPlan(workspace.plan)}
          />
        )}
        <SitesTable
          userTenants={userTenants}
          roles={roles}
          manageableTenantIds={manageableTenantIds}
          locale={locale ?? "en"}
          domains={domains}
        />
      </div>
    </main>
  );
}
