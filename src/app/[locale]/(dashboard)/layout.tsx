import { LanguageSwitcher } from "@/5-shared/i18n/LanguageSwitcher";
import { DashboardSidebar } from "@/2-widgets/dashboard/ui/sidebar/DashboardSidebar";
import { MobileBottomNav } from "@/2-widgets/dashboard/ui/sidebar/MobileBottomNav";
import { TranslationProgressBar } from "@/3-features/translations/ui/translationProgressBar";
import { ThemeToggle } from "@/5-shared/theme/ThemeToggle";
import { PaletteSwitcher } from "@/5-shared/theme/PaletteSwitcher";
import { getSession } from "@/5-shared/lib/auth/authorization";
import { syncProfile } from "@/5-shared/lib/auth/sync-profile";
import { getOwnWorkspaceForDashboard } from "@/5-shared/lib/billing/workspace";
import { resolveRoles } from "@/5-shared/config/permissions/roles";
import { getPlatformTranslations } from "@/5-shared/lib/db/platform-translations";
import { UpgradeModalProvider } from "@/2-widgets/dashboard/UpgradeModal";
import { PendingInviteConsumer } from "@/3-features/team-management/ui/PendingInviteConsumer";
import { PLANS } from "@/5-shared/lib/billing/plans";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

// The dashboard is auth-gated, but make it explicit: never index any dashboard
// route (account, billing, site-builder, team, etc.).
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

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
    session = await getSession();
  } catch (error) {
    console.error("Auth session fallback in layout:", error);
    redirect(`/${locale}/auth/sign-in`);
  }

  if (!session?.user) {
    redirect(`/${locale}/auth/sign-in`);
  }

  const profile = await syncProfile(session);
  // Collaborators (members of someone else's workspace) don't get a stray
  // workspace or plan badge; fresh builders still get one so they can onboard.
  let planLabel: string | null = null;
  if (profile) {
    const workspace = await getOwnWorkspaceForDashboard(profile.id, profile.name);
    planLabel = workspace
      ? PLANS[workspace.plan as keyof typeof PLANS]?.label ?? "Free"
      : null;
  }

  const resolvedRoles = await resolveRoles(session);

  if (!resolvedRoles) {
    redirect(`/${locale}/auth/sign-in`);
  }

  const upgradeTranslations = await getPlatformTranslations("upgrade", locale);
  const sidebarTranslations = await getPlatformTranslations("dashboard.sidebar", locale);

  return (
    <div className="flex min-h-screen bg-background">
      <PendingInviteConsumer locale={locale} />
      <TranslationProgressBar />
      <DashboardSidebar session={session} resolvedRoles={resolvedRoles} planLabel={planLabel} translations={sidebarTranslations} />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden pb-16 md:pb-0">
        <div className="flex items-center justify-end gap-2 px-6 pt-4">
          <LanguageSwitcher />
          <ThemeToggle />
          <PaletteSwitcher />
        </div>
        <div className="flex-1 overflow-y-auto">
          <UpgradeModalProvider translations={upgradeTranslations}>
            {children}
          </UpgradeModalProvider>
        </div>
      </main>
      <MobileBottomNav resolvedRoles={resolvedRoles} translations={sidebarTranslations} />
    </div>
  );
}
