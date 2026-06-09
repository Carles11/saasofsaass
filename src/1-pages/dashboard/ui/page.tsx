import { db } from "@/5-shared/lib/db";
import { tenants } from "@/5-shared/lib/db/schema";
import { tenantMemberships } from "@/5-shared/lib/db/schema/auth";
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

  return (
    <main className="min-h-screen bg-zinc-50 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-zinc-900 tracking-tighter">Workshop</h1>
            <p className="text-zinc-500 font-medium">
              {userTenants.length} tenant{userTenants.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex items-center space-x-4 bg-white p-2 pr-6 rounded-full border border-zinc-200 shadow-sm">
            <div className="h-10 w-10 rounded-full bg-zinc-900 flex items-center justify-center text-white font-bold text-xs">
              {profile?.name?.slice(0, 2).toUpperCase() || profile?.email?.slice(0, 2).toUpperCase() || "AD"}
            </div>
            <span className="text-xs font-bold text-zinc-900 uppercase tracking-tight">
              {profile?.name || profile?.email || "Admin"}
            </span>
          </div>
        </header>
        <section className="grid grid-cols-1 gap-6">
          {userTenants.map((tenant) => (
            <Link
              key={tenant.id}
              href={`/${locale ?? "en"}/dashboard/site-builder/${tenant.id}`}
              className="block bg-white p-8 rounded-[2rem] border border-zinc-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-zinc-900">{tenant.name}</h2>
                  <p className="text-sm text-zinc-500 mt-1">
                    {tenant.category} &middot; {tenant.locales?.length || 0} languages
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-zinc-400 bg-zinc-100 px-2 py-1 rounded-full">
                    {ownerTenantIds.includes(tenant.id) ? "owner" : "editor"}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </section>
        {userTenants.length === 0 && (
          <section className="mt-8 bg-white p-20 rounded-[3rem] border-2 border-dashed border-zinc-100 flex flex-col items-center justify-center text-center">
            <h3 className="text-xl font-bold text-zinc-900 mb-2">No Tenants Found</h3>
            <p className="text-zinc-400 max-w-sm mx-auto italic font-medium">
              Your workshop is initialized. Awaiting the first deployment.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
