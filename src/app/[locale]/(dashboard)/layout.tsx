import { LanguageSwitcher } from "@/5-shared/i18n/LanguageSwitcher";
import { DashboardSidebar } from "@/2-widgets/dashboard/ui/sidebar/DashboardSidebar";
import { MobileBottomNav } from "@/2-widgets/dashboard/ui/sidebar/MobileBottomNav";
import { TranslationProgressBar } from "@/3-features/translations/ui/translationProgressBar";
import { ThemeToggle } from "@/5-shared/theme/ThemeToggle";
import { PaletteSwitcher } from "@/5-shared/theme/PaletteSwitcher";
import { authServer } from "@/5-shared/lib/auth/server";
import { syncProfile } from "@/5-shared/lib/auth/sync-profile";
import { ensureWorkspace } from "@/5-shared/lib/billing/workspace";
import { resolveRoles } from "@/5-shared/config/permissions/roles";
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
    const sessionResult = await authServer.getSession();
    session = sessionResult.data;
  } catch (error) {
    console.error("Auth session fallback in layout:", error);
    redirect(`/${locale}/auth/sign-in`);
  }

  if (!session?.user) {
    redirect(`/${locale}/auth/sign-in`);
  }

  const profile = await syncProfile(session);
  if (profile) {
    await ensureWorkspace(profile.id, profile.name);
  }

  const resolvedRoles = await resolveRoles(session);

  if (!resolvedRoles) {
    redirect(`/${locale}/auth/sign-in`);
  }

  return (
    <div className="flex min-h-screen bg-background">
      <TranslationProgressBar />
      <DashboardSidebar session={session} resolvedRoles={resolvedRoles} />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden pb-16 md:pb-0">
        <div className="flex items-center justify-end gap-2 px-6 pt-4">
          <LanguageSwitcher />
          <ThemeToggle />
          <PaletteSwitcher />
        </div>
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
      <MobileBottomNav resolvedRoles={resolvedRoles} />
    </div>
  );
}
