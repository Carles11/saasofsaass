import { BillingPage } from "@/1-pages/dashboard/billing";
import { resolveRoles } from "@/5-shared/config/permissions/roles";
import { requirePermission } from "@/5-shared/config/permissions";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const roles = await resolveRoles();
  if (!roles) redirect(`/${locale}/auth/sign-in`);
  try {
    requirePermission(roles, "manageBilling");
  } catch {
    redirect(`/${locale}/dashboard`);
  }
  return <BillingPage locale={locale} />;
}
