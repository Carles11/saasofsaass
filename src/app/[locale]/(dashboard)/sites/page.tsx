import { DashboardPage } from "@/1-pages/dashboard";

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <DashboardPage locale={locale} />;
}
