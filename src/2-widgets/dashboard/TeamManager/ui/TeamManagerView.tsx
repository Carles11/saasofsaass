"use client";

import {
  resendInvitation,
  revokeInvitation,
} from "@/3-features/team-management/actions/invitations";
import {
  removeMember,
  updateMemberRole,
} from "@/3-features/team-management/actions/members";
import type {
  TeamMemberView,
  TeamPendingInvite,
  TeamPerson,
} from "@/3-features/team-management/queries/teamQueries";
import { resolveTranslation } from "@/5-shared/lib/translations/resolve";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useTransition } from "react";
import { toast } from "sonner";
import { InviteDialog } from "@/3-features/team-management/ui/InviteDialog";

interface TeamManagerViewProps {
  workspaceId: string;
  callerRole: "owner" | "webmaster";
  plan: string;
  owner: TeamPerson | null;
  members: TeamMemberView[];
  pending: TeamPendingInvite[];
  sites: { id: string; name: string }[];
  currentProfileId: string;
  locale: string;
  translations?: Record<string, string>;
}

function initials(name: string, email: string): string {
  const base = name?.trim() || email;
  return base.slice(0, 2).toUpperCase();
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
      <p className="text-xs font-medium text-muted-foreground tracking-wide uppercase">
        {label}
      </p>
      <p className="text-3xl font-black text-foreground tracking-tighter mt-1">
        {value}
      </p>
    </div>
  );
}

export function TeamManagerView({
  workspaceId,
  callerRole,
  owner,
  members,
  pending,
  sites,
  currentProfileId,
  locale,
  translations,
}: TeamManagerViewProps) {
  const router = useRouter();
  const [pendingTx, startTransition] = useTransition();
  const tr = (k: string, fb: string) => resolveTranslation(translations, k, fb);

  const siteNames = useMemo(
    () => new Map(sites.map((s) => [s.id, s.name])),
    [sites],
  );

  const roleLabel = (role: string) =>
    role === "owner"
      ? tr("role.owner", "Owner")
      : role === "webmaster"
        ? tr("role.webmaster", "Web-master")
        : tr("role.editor", "Editor");

  const sitesText = (scope: "all" | "specific", ids: string[]) =>
    scope === "all"
      ? tr("all-sites", "All sites")
      : ids.map((id) => siteNames.get(id) ?? "—").join(", ") ||
        tr("no-sites", "—");

  const counts = useMemo(() => {
    const webmasters = members.filter((m) => m.role === "webmaster").length;
    const editors = members.filter((m) => m.role === "editor").length;
    return {
      members: members.length + (owner ? 1 : 0),
      webmasters,
      editors,
      pending: pending.length,
    };
  }, [members, owner, pending]);

  function run(
    action: () => Promise<void>,
    successKey: string,
    successFb: string,
  ) {
    startTransition(async () => {
      try {
        await action();
        toast.success(tr(successKey, successFb));
        router.refresh();
      } catch (e) {
        toast.error(
          e instanceof Error
            ? e.message
            : tr("error.generic", "Something went wrong"),
        );
      }
    });
  }

  function onRoleChange(membershipId: string, newRole: "webmaster" | "editor") {
    run(
      () => updateMemberRole(membershipId, newRole),
      "toast.role-updated",
      "Role updated",
    );
  }
  function onRemove(membershipId: string) {
    run(() => removeMember(membershipId), "toast.removed", "Member removed");
  }
  function onResend(id: string) {
    run(
      () => resendInvitation(id, locale),
      "toast.resent",
      "Invitation resent",
    );
  }
  function onRevoke(id: string) {
    run(() => revokeInvitation(id), "toast.revoked", "Invitation revoked");
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-foreground tracking-tighter">
            {tr("title", "Team")}
          </h1>
          <p className="text-muted-foreground font-medium mt-1">
            {tr("subtitle", "Invite and manage who can work on your sites.")}
          </p>
        </div>
        <InviteDialog
          workspaceId={workspaceId}
          locale={locale}
          callerRole={callerRole}
          sites={sites}
          translations={translations}
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label={tr("stat.members", "Members")}
          value={counts.members}
        />
        <StatCard
          label={tr("stat.webmasters", "Web-masters")}
          value={counts.webmasters}
        />
        <StatCard
          label={tr("stat.editors", "Editors")}
          value={counts.editors}
        />
        <StatCard
          label={tr("stat.pending", "Pending")}
          value={counts.pending}
        />
      </div>

      {/* Members */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h2 className="text-sm font-semibold text-card-foreground">
            {tr("members.title", "Members")}
          </h2>
        </div>
        <ul>
          {owner && (
            <li className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-0">
              <Avatar className="h-9 w-9">
                {owner.avatarUrl && (
                  <AvatarImage src={owner.avatarUrl} alt={owner.name} />
                )}
                <AvatarFallback>
                  {initials(owner.name, owner.email)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-card-foreground truncate">
                  {owner.name || owner.email}
                  {owner.profileId === currentProfileId && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      {tr("you", "(you)")}
                    </span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {owner.email}
                </p>
              </div>
              <span className="text-xs text-muted-foreground hidden sm:block">
                {tr("all-sites", "All sites")}
              </span>
              <Badge
                variant="default"
                className="text-[10px] uppercase tracking-wider"
              >
                {roleLabel("owner")}
              </Badge>
            </li>
          )}

          {members.map((m) => {
            const canRemove =
              callerRole === "owner" ||
              (callerRole === "webmaster" && m.role === "editor");
            return (
              <li
                key={m.membershipId}
                className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-0"
              >
                <Avatar className="h-9 w-9">
                  {m.avatarUrl && (
                    <AvatarImage src={m.avatarUrl} alt={m.name} />
                  )}
                  <AvatarFallback>{initials(m.name, m.email)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-card-foreground truncate">
                    {m.name || m.email}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {m.email}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground hidden sm:block max-w-[12rem] truncate">
                  {sitesText(m.siteScope, m.siteIds)}
                </span>
                {callerRole === "owner" ? (
                  <Select
                    value={m.role}
                    onValueChange={(v) =>
                      onRoleChange(m.membershipId, v as "webmaster" | "editor")
                    }
                  >
                    <SelectTrigger
                      className="h-7 w-32 text-xs"
                      disabled={pendingTx}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="webmaster">
                        {roleLabel("webmaster")}
                      </SelectItem>
                      <SelectItem value="editor">
                        {roleLabel("editor")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge
                    variant={m.role === "editor" ? "secondary" : "default"}
                    className="text-[10px] uppercase tracking-wider"
                  >
                    {roleLabel(m.role)}
                  </Badge>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="size-8"
                      disabled={!canRemove}
                    >
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem
                      disabled={!canRemove || pendingTx}
                      onSelect={() => onRemove(m.membershipId)}
                    >
                      {tr("remove", "Remove")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </li>
            );
          })}

          {!owner && members.length === 0 && (
            <li className="px-4 py-6 text-sm text-muted-foreground text-center">
              {tr("members.empty", "No team members yet.")}
            </li>
          )}
        </ul>
      </div>

      {/* Pending invitations */}
      {pending.length > 0 && (
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="text-sm font-semibold text-card-foreground">
              {tr("pending.title", "Pending invitations")}
            </h2>
          </div>
          <ul>
            {pending.map((p) => (
              <li
                key={p.id}
                className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-0"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-card-foreground truncate">
                    {p.invitedName || p.email}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {p.email} · {sitesText(p.siteScope, p.siteIds)}
                  </p>
                </div>
                <Badge
                  variant={p.role === "editor" ? "secondary" : "default"}
                  className="text-[10px] uppercase tracking-wider"
                >
                  {roleLabel(p.role)}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon-xs" className="size-8">
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem
                      disabled={pendingTx}
                      onSelect={() => onResend(p.id)}
                    >
                      {tr("resend", "Resend")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      disabled={pendingTx}
                      onSelect={() => onRevoke(p.id)}
                    >
                      {tr("revoke", "Revoke")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
