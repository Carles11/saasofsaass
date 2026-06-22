import { db } from "@/5-shared/lib/db";
import { tenants } from "@/5-shared/lib/db/schema";
import { tenantMemberships } from "@/5-shared/lib/db/schema/auth";
import { eq, inArray } from "drizzle-orm";
import { getCurrentProfile } from "@/5-shared/lib/auth/authorization";
import { getWorkspaceByProfileId } from "@/3-features/manage-billing/actions/billingHelpers";
import { getPlatformTranslationsByNamespaces } from "@/5-shared/lib/db/platform-translations";

export async function getAccountPageData(locale: string) {
  const profile = await getCurrentProfile();
  if (!profile) return { profile: null, memberInfo: [] };

  const workspace = await getWorkspaceByProfileId(profile.id);

  const memberships = await db
    .select()
    .from(tenantMemberships)
    .where(eq(tenantMemberships.profileId, profile.id));

  const tenantIds = memberships.map((m) => m.tenantId);
  const userTenants = tenantIds.length > 0
    ? await db.select().from(tenants).where(inArray(tenants.id, tenantIds))
    : [];

  const memberInfo = memberships.map((m) => ({
    tenantId: m.tenantId,
    role: m.role as "owner" | "editor",
    tenantName: userTenants.find((t) => t.id === m.tenantId)?.name ?? "",
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
