"use client";

import { Avatar, AvatarFallback, AvatarImage, Badge, Button } from "@/components/ui";
import { resolveTranslation } from "@/5-shared/lib/translations/resolve";
import { InviteDialog } from "@/3-features/team-management/ui/InviteDialog";
import type {
  SiteCollaborator,
  TeamPerson,
} from "@/3-features/team-management/queries/teamQueries";

interface SiteCollaboratorsProps {
  tenantId: string;
  workspaceId: string;
  callerRole: "owner" | "webmaster";
  owner: TeamPerson | null;
  collaborators: SiteCollaborator[];
  locale: string;
  translations?: Record<string, string>;
}

function initials(name: string, email: string): string {
  return (name?.trim() || email).slice(0, 2).toUpperCase();
}

export function SiteCollaborators({
  tenantId,
  workspaceId,
  callerRole,
  owner,
  collaborators,
  locale,
  translations,
}: SiteCollaboratorsProps) {
  const tr = (k: string, fb: string) => resolveTranslation(translations, k, fb);
  const roleLabel = (role: string) =>
    role === "owner"
      ? tr("role.owner", "Owner")
      : role === "webmaster"
        ? tr("role.webmaster", "Web-master")
        : tr("role.editor", "Editor");

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">{tr("collab.title", "Collaborators")}</h3>
        <InviteDialog
          workspaceId={workspaceId}
          locale={locale}
          callerRole={callerRole}
          sites={[]}
          translations={translations}
          mode="constrained"
          lockedTenantId={tenantId}
          trigger={
            <Button variant="outline" size="sm">
              {tr("collab.add", "Add editor")}
            </Button>
          }
        />
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        {tr("collab.hint", "People who can work on this site. Manage everyone on the Team page.")}
      </p>

      <ul className="border border-border rounded-xl divide-y divide-border">
        {owner && (
          <li className="flex items-center gap-3 px-4 py-3">
            <Avatar className="h-8 w-8">
              {owner.avatarUrl && <AvatarImage src={owner.avatarUrl} alt={owner.name} />}
              <AvatarFallback>{initials(owner.name, owner.email)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-card-foreground truncate">
                {owner.name || owner.email}
              </p>
              <p className="text-xs text-muted-foreground truncate">{owner.email}</p>
            </div>
            <Badge variant="default" className="text-[10px] uppercase tracking-wider">
              {roleLabel("owner")}
            </Badge>
          </li>
        )}

        {collaborators.map((c) => (
          <li key={c.membershipId ?? c.profileId} className="flex items-center gap-3 px-4 py-3">
            <Avatar className="h-8 w-8">
              {c.avatarUrl && <AvatarImage src={c.avatarUrl} alt={c.name} />}
              <AvatarFallback>{initials(c.name, c.email)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-card-foreground truncate">
                {c.name || c.email}
              </p>
              <p className="text-xs text-muted-foreground truncate">{c.email}</p>
            </div>
            <Badge
              variant={c.role === "editor" ? "secondary" : "default"}
              className="text-[10px] uppercase tracking-wider"
            >
              {roleLabel(c.role)}
            </Badge>
          </li>
        ))}

        {!owner && collaborators.length === 0 && (
          <li className="px-4 py-4 text-sm text-muted-foreground">
            {tr("collab.empty", "No collaborators yet.")}
          </li>
        )}
      </ul>
    </div>
  );
}
