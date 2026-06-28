import { resolveRoles } from "@/5-shared/config/permissions/roles";
import { requirePermission } from "@/5-shared/config/permissions";
import { redirect, notFound } from "next/navigation";
import { getAdminWorkspaceDetail } from "@/3-features/admin/queries/adminWorkspaces";
import { AdminWorkspaceDetailPage } from "@/1-pages/dashboard/admin";

export const dynamic = "force-dynamic";

export default async function AdminWorkspacePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const roles = await resolveRoles();

  if (!roles) {
    redirect(`/${locale}/auth/sign-in`);
  }

  try {
    requirePermission(roles, "accessAdminPanel");
  } catch {
    redirect(`/${locale}/dashboard`);
  }

  const detail = await getAdminWorkspaceDetail(id);

  if (!detail) {
    notFound();
  }

  return <AdminWorkspaceDetailPage detail={detail} locale={locale} />;
}
