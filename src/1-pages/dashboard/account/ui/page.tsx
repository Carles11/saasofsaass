import { getAccountPageData } from "../api/data";
import { ProfileSection, AccountOverview } from "@/2-widgets/dashboard/AccountSettings";

interface AccountPageProps {
  locale: string;
}

export async function AccountPage({ locale }: AccountPageProps) {
  const { profile, memberInfo, translations } = await getAccountPageData(locale);

  return (
    <main className="min-h-screen bg-background p-6 md:p-12">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-black text-foreground tracking-tighter">
            Account
          </h1>
          <p className="text-muted-foreground font-medium mt-2">
            Manage your profile, preferences, and security settings.
          </p>
        </div>

        {profile ? (
          <>
            <ProfileSection profile={profile} translations={translations} />
            <AccountOverview profile={profile} memberInfo={memberInfo} translations={translations} />
          </>
        ) : (
          <p className="text-muted-foreground">Please sign in to view your account.</p>
        )}
      </div>
    </main>
  );
}
