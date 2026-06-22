import { SettingsPage } from "@/1-pages/dashboard/settings";

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <SettingsPage locale={locale} />;
}
