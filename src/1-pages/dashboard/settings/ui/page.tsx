import { getSettingsPageData } from "../api/data";
import { WorkspaceInfoSection, PreferencesSection } from "@/2-widgets/dashboard/Settings";

interface SettingsPageProps {
  locale: string;
}

export async function SettingsPage({ locale }: SettingsPageProps) {
  const { profile, workspace, translations } = await getSettingsPageData(locale);

  return (
    <main className="min-h-screen bg-background p-6 md:p-12">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-black text-foreground tracking-tighter">
            Settings
          </h1>
          <p className="text-muted-foreground font-medium mt-2">
            Platform and workspace configuration.
          </p>
        </div>

        {profile ? (
          <>
            <WorkspaceInfoSection workspace={workspace} translations={translations} />
            <PreferencesSection translations={translations} />
          </>
        ) : (
          <p className="text-muted-foreground">Please sign in to manage settings.</p>
        )}
      </div>
    </main>
  );
}
