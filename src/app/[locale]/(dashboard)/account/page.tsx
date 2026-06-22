import { AccountPage } from "@/1-pages/dashboard/account";

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <AccountPage locale={locale} />;
}
