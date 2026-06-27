import { getCurrentProfile } from "@/5-shared/lib/auth/authorization";
import { getActiveTeamWorkspace } from "@/3-features/team-management/lib/teamAccess";
import { listTeam } from "@/3-features/team-management/queries/teamQueries";
import { getPlatformTranslations } from "@/5-shared/lib/db/platform-translations";
import { resolveTranslation } from "@/5-shared/lib/translations/resolve";
import { TeamManagerView } from "@/2-widgets/dashboard/TeamManager";

interface TeamPageProps {
  locale: string;
}

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-background p-6 md:p-12">
      <div className="max-w-6xl mx-auto">{children}</div>
    </main>
  );
}

export async function TeamPage({ locale }: TeamPageProps) {
  const translations = await getPlatformTranslations("dashboard.team", locale || "en");
  const tr = (k: string, fb: string) => resolveTranslation(translations, k, fb);

  const profile = await getCurrentProfile();
  if (!profile) {
    return (
      <Wrapper>
        <p className="text-muted-foreground">{tr("sign-in-required", "Please sign in.")}</p>
      </Wrapper>
    );
  }

  const active = await getActiveTeamWorkspace(profile);
  if (!active) {
    return (
      <Wrapper>
        <h1 className="text-4xl font-black text-foreground tracking-tighter mb-2">
          {tr("title", "Team")}
        </h1>
        <p className="text-muted-foreground font-medium">
          {tr(
            "no-access",
            "You don't manage a team yet. Ask your workspace owner for access.",
          )}
        </p>
      </Wrapper>
    );
  }

  const team = await listTeam(active.workspaceId);

  return (
    <Wrapper>
      <TeamManagerView
        workspaceId={active.workspaceId}
        callerRole={team.callerRole}
        plan={active.plan}
        owner={team.owner}
        members={team.members}
        pending={team.pending}
        sites={team.sites}
        currentProfileId={profile.id}
        locale={locale}
        translations={translations}
      />
    </Wrapper>
  );
}
