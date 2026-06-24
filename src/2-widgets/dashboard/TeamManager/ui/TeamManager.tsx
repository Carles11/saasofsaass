"use client";

import { useState, useTransition } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { inviteMember, removeMember, changeMemberRole, getTeamMembers } from "@/3-features/team-management/actions/teamActions";
import { Button } from "@/components/tenant/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Tenant } from "@/5-shared/lib/db/schema";
import { resolveTranslation, type TranslationDict } from "@/5-shared/lib/translations/resolve";

interface TeamMember {
  membership: { id: string; tenantId: string; profileId: string; role: string };
  profile: { id: string; email: string; name: string };
}

interface TeamManagerProps {
  tenant: Tenant;
  initialMembers: TeamMember[];
  currentProfileId: string;
  translations?: TranslationDict;
}

export function TeamManager({ tenant, initialMembers, currentProfileId, translations }: TeamManagerProps) {
  const params = useParams();
  const locale = (params?.locale as string) ?? "en";
  const [members, setMembers] = useState<TeamMember[]>(initialMembers);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"owner" | "editor">("owner");
  const [isPending, startTransition] = useTransition();

  async function refresh() {
    const updated = await getTeamMembers(tenant.id);
    setMembers(updated);
  }

  async function handleInvite() {
    if (!email.trim()) return;
    startTransition(async () => {
      try {
        await inviteMember(tenant.id, email.trim(), role, locale);
        await refresh();
        setEmail("");
        toast.success(resolveTranslation(translations, "toast.invited", "Member invited successfully"));
      } catch (err: any) {
        toast.error(err?.message ?? "Failed to invite member");
      }
    });
  }

  async function handleRemove(membershipId: string) {
    startTransition(async () => {
      try {
        await removeMember(tenant.id, membershipId);
        await refresh();
        toast.success(resolveTranslation(translations, "toast.removed", "Member removed"));
      } catch (err: any) {
        toast.error(err?.message ?? "Failed to remove member");
      }
    });
  }

  async function handleRoleChange(membershipId: string, newRole: "owner" | "editor") {
    startTransition(async () => {
      try {
        await changeMemberRole(tenant.id, membershipId, newRole);
        await refresh();
        toast.success(resolveTranslation(translations, "toast.role-updated", "Role updated"));
      } catch (err: any) {
        toast.error(err?.message ?? "Failed to update role");
      }
    });
  }

  const title = resolveTranslation(translations, "title", "Team — {name}", { name: tenant.name });
  const removeLabel = resolveTranslation(translations, "remove", "Remove");
  const emptyLabel = resolveTranslation(translations, "empty", "No team members yet.");
  const emailLabel = resolveTranslation(translations, "label.email", "Email");
  const roleLabel = resolveTranslation(translations, "label.role", "Role");
  const emailPlaceholder = resolveTranslation(translations, "placeholder.email", "colleague@example.com");
  const roleEditor = resolveTranslation(translations, "role.editor", "Editor");
  const roleOwner = resolveTranslation(translations, "role.owner", "Owner");
  const inviteLabel = resolveTranslation(translations, "invite", "Invite");

  const ownerCount = members.filter((m) => m.membership.role === "owner").length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Current members */}
        <div className="space-y-2 mb-6">
          {members.map((m) => {
            const isCurrentUser = m.profile.id === currentProfileId;
            const isLastOwner = m.membership.role === "owner" && ownerCount <= 1;
            const canChangeRole = !isCurrentUser && !isLastOwner;
            const canRemove = m.membership.role !== "owner" && !isCurrentUser;

            return (
              <div
                key={m.membership.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border"
              >
                <div>
                  <p className="font-medium text-sm">{m.profile.name || m.profile.email}</p>
                  <p className="text-xs text-muted-foreground">{m.profile.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  {canChangeRole ? (
                    <Select
                      value={m.membership.role}
                      onValueChange={(v) => handleRoleChange(m.membership.id, v as "owner" | "editor")}
                      disabled={isPending}
                    >
                      <SelectTrigger className="w-28 h-7 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="owner">{roleOwner}</SelectItem>
                        <SelectItem value="editor">{roleEditor}</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge variant={m.membership.role === "owner" ? "default" : "secondary"}>
                      {m.membership.role === "owner" ? roleOwner : roleEditor}
                    </Badge>
                  )}
                  {canRemove && (
                    <Button
                      tenantVariant="destructive"
                      size="sm"
                      disabled={isPending}
                      onClick={() => handleRemove(m.membership.id)}
                    >
                      {removeLabel}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
          {members.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">{emptyLabel}</p>
          )}
        </div>

        {/* Invite form */}
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <label className="text-xs font-medium text-muted-foreground mb-1 block">{emailLabel}</label>
            <Input
              type="email"
              placeholder={emailPlaceholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleInvite()}
            />
          </div>
          <div className="w-32">
            <label className="text-xs font-medium text-muted-foreground mb-1 block">{roleLabel}</label>
            <Select value={role} onValueChange={(v) => setRole(v as "owner" | "editor")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="owner">{roleOwner}</SelectItem>
                <SelectItem value="editor">{roleEditor}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleInvite} disabled={isPending || !email.trim()}>
            {inviteLabel}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
