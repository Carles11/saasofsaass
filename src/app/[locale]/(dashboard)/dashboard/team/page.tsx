import { TeamPage } from "@/1-pages/dashboard/team";

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <TeamPage locale={locale} />;
}
