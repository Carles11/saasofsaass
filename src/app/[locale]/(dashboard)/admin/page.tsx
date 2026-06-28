import { resolveRoles } from "@/5-shared/config/permissions/roles";
import { requirePermission } from "@/5-shared/config/permissions";
import { redirect } from "next/navigation";
import { AdminDashboardPage } from "@/1-pages/dashboard/admin";

export const dynamic = "force-dynamic";

export default async function AdminPage({
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
    requirePermission(roles, "accessAdminPanel");
  } catch {
    redirect(`/${locale}/dashboard`);
  }

  return <AdminDashboardPage locale={locale} />;
}
