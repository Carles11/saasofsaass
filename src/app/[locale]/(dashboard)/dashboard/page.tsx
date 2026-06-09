import { DashboardPage } from "@/1-pages/dashboard";

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <DashboardPage locale={locale} />;
}
