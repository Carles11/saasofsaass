import { DashboardSidebar } from "@/2-widgets/dashboard/ui/sidebar/DashboardSidebar";
import { TranslationProgressBar } from "@/3-features/translations/ui/translationProgressBar";
import { ThemeToggle } from "@/5-shared/theme/ThemeToggle";
import { PaletteSwitcher } from "@/5-shared/theme/PaletteSwitcher";
import { authServer } from "@/5-shared/lib/auth/server";
import { syncProfile } from "@/5-shared/lib/auth/sync-profile";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  let session = null;

try {
  const sessionResult = await authServer.getSession()
  session = sessionResult.data
} catch (error) {
  console.error("Auth session fallback in layout:", error)
  redirect(`/${locale}/auth/login`)
}

if (!session?.user) {
  redirect(`/${locale}/auth/login`)
}

  if (!session?.user) {
    redirect(`/${locale}/auth/login`)
  }

  // Sync Neon Auth user with local profiles table
  await syncProfile(session);

  return (
    <div className="flex min-h-screen bg-background">
      <TranslationProgressBar />
      <DashboardSidebar session={session} />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex items-center justify-end gap-2 px-6 pt-4">
          <ThemeToggle />
          <PaletteSwitcher />
        </div>
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}