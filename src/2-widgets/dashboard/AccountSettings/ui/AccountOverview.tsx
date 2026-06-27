import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { resolveTranslation, type TranslationDict } from "@/5-shared/lib/translations/resolve";

interface MemberInfo {
  tenantId: string;
  role: "owner" | "webmaster" | "editor";
  tenantName: string;
}

interface AccountOverviewProps {
  profile: { role: string; createdAt: Date };
  memberInfo: MemberInfo[];
  translations?: TranslationDict;
}

export function AccountOverview({ profile, memberInfo, translations }: AccountOverviewProps) {
  const title = resolveTranslation(translations, "overview.title", "Account Overview");
  const roleLabel = resolveTranslation(translations, "overview.role", "Role");
  const memberSince = resolveTranslation(translations, "overview.member-since", "Member since");
  const tenantsTitle = resolveTranslation(translations, "overview.tenants-title", "Your Tenants");
  const ownerLabel = resolveTranslation(translations, "overview.role-owner", "Owner");
  const webmasterLabel = resolveTranslation(translations, "overview.role-webmaster", "Web-master");
  const editorLabel = resolveTranslation(translations, "overview.role-editor", "Editor");
  const noTenants = resolveTranslation(translations, "overview.no-tenants", "You don't belong to any tenants yet.");

  const displayRole = profile.role === "super_admin" ? "Super Admin" : "User";
  const joined = new Date(profile.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground">{roleLabel}</p>
            <p className="text-sm font-medium mt-0.5">{displayRole}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">{memberSince}</p>
            <p className="text-sm font-medium mt-0.5">{joined}</p>
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-muted-foreground mb-3">{tenantsTitle}</p>
          {memberInfo.length > 0 ? (
            <div className="space-y-2">
              {memberInfo.map((m) => (
                <div
                  key={m.tenantId}
                  className="flex items-center justify-between p-3 rounded-lg border border-border"
                >
                  <p className="text-sm font-medium">{m.tenantName}</p>
                  <Badge variant={m.role === "editor" ? "secondary" : "default"}>
                    {m.role === "owner"
                      ? ownerLabel
                      : m.role === "webmaster"
                        ? webmasterLabel
                        : editorLabel}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{noTenants}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
