import { getAccessibleSites } from "@/4-entities/tenant";
import { getCurrentProfile } from "@/5-shared/lib/auth/authorization";
import { getWorkspaceByProfileId } from "@/3-features/manage-billing/actions/billingHelpers";
import { getPlatformTranslationsByNamespaces } from "@/5-shared/lib/db/platform-translations";

interface WorkspaceSummary {
  id: string;
  name: string;
  plan: string;
}

export async function getAccountPageData(locale: string) {
  const profile = await getCurrentProfile();
  if (!profile) return { profile: null, memberInfo: [], workspaceSummary: null };

  const workspace = await getWorkspaceByProfileId(profile.id);
  const workspaceName = profile.name
    ? `${profile.name}'s Workspace`
    : "My Workspace";
  const workspaceSummary: WorkspaceSummary | null = workspace
    ? { id: workspace.id, name: workspaceName, plan: workspace.plan }
    : null;

  const accessible = await getAccessibleSites(profile.id);
  const memberInfo = accessible.map((a) => ({
    tenantId: a.tenant.id,
    role: a.role,
    tenantName: a.tenant.name,
  }));

  const namespaced = await getPlatformTranslationsByNamespaces(
    ["dashboard.account"],
    locale,
  );

  return {
    profile,
    workspaceSummary,
    memberInfo,
    translations: namespaced["dashboard.account"],
  };
}
