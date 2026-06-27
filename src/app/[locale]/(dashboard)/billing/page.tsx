import { resolveRoles } from "@/5-shared/config/permissions/roles";
import { requirePermission } from "@/5-shared/config/permissions";
import { redirect } from "next/navigation";

export default async function BillingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const roles = await resolveRoles();

  if (!roles) {
    redirect(`/${locale}/auth/sign-in`);
  }

  try {
    requirePermission(roles, "manageBilling");
  } catch {
    redirect(`/${locale}/dashboard`);
  }

  return (
    <main className="min-h-screen bg-background p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-black text-foreground tracking-tighter">
          Billing
        </h1>
        <p className="text-muted-foreground font-medium mt-2">
          Manage your subscription, invoices, and payment methods.
        </p>
        <div className="mt-8 bg-card border border-border rounded-xl p-8 text-center">
          <p className="text-muted-foreground">
            Billing management interface — coming soon.
          </p>
        </div>
      </div>
    </main>
  );
}
