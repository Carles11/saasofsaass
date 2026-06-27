import { getAccessibleSites } from "@/4-entities/tenant";
import { getCurrentProfile } from "@/5-shared/lib/auth/authorization";
import { getWorkspaceByProfileId } from "@/3-features/manage-billing/actions/billingHelpers";
import { getPlatformTranslationsByNamespaces } from "@/5-shared/lib/db/platform-translations";

export async function getAccountPageData(locale: string) {
  const profile = await getCurrentProfile();
  if (!profile) return { profile: null, memberInfo: [] };

  const workspace = await getWorkspaceByProfileId(profile.id);

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
    workspace,
    memberInfo,
    translations: namespaced["dashboard.account"],
  };
}
