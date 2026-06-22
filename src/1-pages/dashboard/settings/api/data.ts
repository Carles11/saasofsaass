import { getCurrentProfile } from "@/5-shared/lib/auth/authorization";
import { getWorkspaceByProfileId, countActiveTenants } from "@/3-features/manage-billing/actions/billingHelpers";
import { getPlatformTranslationsByNamespaces } from "@/5-shared/lib/db/platform-translations";

export async function getSettingsPageData(locale: string) {
  const profile = await getCurrentProfile();
  if (!profile) return { profile: null, workspace: null };

  const workspaceRow = await getWorkspaceByProfileId(profile.id);
  const currentSites = workspaceRow ? await countActiveTenants(workspaceRow.id) : 0;

  const workspace = workspaceRow
    ? { ...workspaceRow, currentSites }
    : null;

  const namespaced = await getPlatformTranslationsByNamespaces(
    ["dashboard.settings"],
    locale,
  );

  return {
    profile,
    workspace,
    translations: namespaced["dashboard.settings"],
  };
}
