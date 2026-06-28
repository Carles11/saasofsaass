import { getAccountPageData } from "../api/data";
import { ProfileSection, AccountOverview } from "@/2-widgets/dashboard/AccountSettings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PLAN_LABELS, type PlanId } from "@/5-shared/lib/billing/plans";

interface AccountPageProps {
  locale: string;
}

export async function AccountPage({ locale }: AccountPageProps) {
  const { profile, workspaceSummary, memberInfo, translations } = await getAccountPageData(locale);

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

            {workspaceSummary && (
              <Card>
                <CardHeader>
                  <CardTitle>Workspace</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{workspaceSummary.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        You are the owner of this workspace.
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {PLAN_LABELS[workspaceSummary.plan as PlanId] || workspaceSummary.plan}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            <AccountOverview profile={profile} memberInfo={memberInfo} translations={translations} />
          </>
        ) : (
          <p className="text-muted-foreground">Please sign in to view your account.</p>
        )}
      </div>
    </main>
  );
}
