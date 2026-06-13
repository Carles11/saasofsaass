import { resolveRoles } from "@/5-shared/config/permissions/roles";
import { requirePermission } from "@/5-shared/config/permissions";
import { redirect } from "next/navigation";

export default async function AccountPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const roles = await resolveRoles();

  if (!roles) {
    redirect(`/${locale}/auth/login`);
  }

  try {
    requirePermission(roles, "viewAccount");
  } catch {
    redirect(`/${locale}/dashboard`);
  }

  return (
    <main className="min-h-screen bg-background p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-black text-foreground tracking-tighter">
          Account
        </h1>
        <p className="text-muted-foreground font-medium mt-2">
          Manage your profile, preferences, and security settings.
        </p>
        <div className="mt-8 bg-card border border-border rounded-xl p-8 text-center">
          <p className="text-muted-foreground">
            Account settings interface — coming soon.
          </p>
        </div>
      </div>
    </main>
  );
}
