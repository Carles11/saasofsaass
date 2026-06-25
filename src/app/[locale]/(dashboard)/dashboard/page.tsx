import { DashboardOverview } from "@/1-pages/dashboard/ui/overview";

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <DashboardOverview locale={locale} />;
}
