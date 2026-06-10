import { CreateTenantDialog } from "@/2-widgets/dashboard/CreateTenantDialog";
import { db } from "@/5-shared/lib/db";
import { tenants } from "@/5-shared/lib/db/schema";
import { tenantMemberships } from "@/5-shared/lib/db/schema/auth";
import {
  getPlatformTranslationsByNamespaces,
  resolveNamespacedTranslation,
} from "@/5-shared/lib/db/platform-translations";
import { eq, inArray } from "drizzle-orm";
import Link from "next/link";
import { getCurrentProfile } from "@/5-shared/lib/auth/authorization";

export async function DashboardPage({ locale }: { locale?: string }) {
  const profile = await getCurrentProfile();
  const memberships = profile
    ? await db
        .select()
        .from(tenantMemberships)
        .where(eq(tenantMemberships.profileId, profile.id))
    : [];

  const tenantIds = memberships.map((m) => m.tenantId);
  const userTenants = tenantIds.length > 0
    ? await db.select().from(tenants).where(inArray(tenants.id, tenantIds))
    : [];

  const ownerTenantIds = memberships.filter((m) => m.role === "owner").map((m) => m.tenantId);

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
  const languagesLabel = resolveNamespacedTranslation(
    translations,
    "dashboard.page",
    "languages-count",
    "languages",
  );
  const ownerRoleLabel = resolveNamespacedTranslation(
    translations,
    "dashboard.page",
    "role.owner",
    "owner",
  );
  const editorRoleLabel = resolveNamespacedTranslation(
    translations,
    "dashboard.page",
    "role.editor",
    "editor",
  );
  const emptyTitle = resolveNamespacedTranslation(
    translations,
    "dashboard.page",
    "empty.title",
    "No Tenants Found",
  );
  const emptySubtitle = resolveNamespacedTranslation(
    translations,
    "dashboard.page",
    "empty.subtitle",
    "Your workshop is initialized. Awaiting the first deployment.",
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
        <section className="grid grid-cols-1 gap-6">
          {userTenants.map((tenant) => (
            <Link
              key={tenant.id}
              href={`/${locale ?? "en"}/dashboard/site-builder/${tenant.id}`}
              className="block bg-card p-8 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-card-foreground">{tenant.name}</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {tenant.category} &middot; {tenant.locales?.length || 0} {languagesLabel}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded-full">
                    {ownerTenantIds.includes(tenant.id) ? ownerRoleLabel : editorRoleLabel}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </section>
        {userTenants.length === 0 && (
          <section className="mt-8 bg-card p-20 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center text-center">
            <h3 className="text-xl font-bold text-card-foreground mb-2">{emptyTitle}</h3>
            <p className="text-muted-foreground max-w-sm mx-auto italic font-medium">
              {emptySubtitle}
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
