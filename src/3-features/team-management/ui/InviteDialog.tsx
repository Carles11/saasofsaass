"use client";

import { createInvitation } from "@/3-features/team-management/actions/invitations";
import { resolveTranslation } from "@/5-shared/lib/translations/resolve";
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { useRouter } from "next/navigation";
import { useState, useTransition, type ReactNode } from "react";
import { toast } from "sonner";

type Role = "webmaster" | "editor";
type Scope = "all" | "specific";

interface InviteDialogProps {
  workspaceId: string;
  locale: string;
  callerRole: "owner" | "webmaster";
  sites: { id: string; name: string }[];
  translations?: Record<string, string>;
  /** "constrained" locks role=editor, scope=specific to a single site (builder panel). */
  mode?: "full" | "constrained";
  lockedTenantId?: string;
  trigger?: ReactNode;
}

export function InviteDialog({
  workspaceId,
  locale,
  callerRole,
  sites,
  translations,
  mode = "full",
  lockedTenantId,
  trigger,
}: InviteDialogProps) {
  const router = useRouter();
  const constrained = mode === "constrained";
  const roleOptions: Role[] =
    callerRole === "owner" ? ["webmaster", "editor"] : ["editor"];
  const scopeOptions: Scope[] =
    callerRole === "owner" ? ["all", "specific"] : ["specific"];

  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<Role>(roleOptions[0]);
  const [scope, setScope] = useState<Scope>(scopeOptions[0]);
  const [selectedSites, setSelectedSites] = useState<Set<string>>(
    new Set(lockedTenantId ? [lockedTenantId] : []),
  );

  const tr = (k: string, fb: string) => resolveTranslation(translations, k, fb);

  function toggleSite(id: string) {
    setSelectedSites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function reset() {
    setEmail("");
    setName("");
    setRole(roleOptions[0]);
    setScope(scopeOptions[0]);
    setSelectedSites(new Set(lockedTenantId ? [lockedTenantId] : []));
  }

  function submit() {
    const finalRole: Role = constrained ? "editor" : role;
    const finalScope: Scope = constrained ? "specific" : scope;
    const siteIds =
      finalScope === "specific"
        ? constrained && lockedTenantId
          ? [lockedTenantId]
          : [...selectedSites]
        : [];

    if (!email.trim()) {
      toast.error(tr("error.email", "Enter an email address"));
      return;
    }
    if (finalScope === "specific" && siteIds.length === 0) {
      toast.error(tr("error.sites", "Select at least one site"));
      return;
    }

    startTransition(async () => {
      try {
        await createInvitation({
          workspaceId,
          email: email.trim(),
          invitedName: name.trim() || undefined,
          role: finalRole,
          siteScope: finalScope,
          siteIds,
          locale,
        });
        toast.success(tr("toast.invited", "Invitation sent"));
        reset();
        setOpen(false);
        router.refresh();
      } catch (e) {
        toast.error(
          e instanceof Error
            ? e.message
            : tr("invite.error", "Could not send invitation"),
        );
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? <Button>{tr("invite", "Invite")}</Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {constrained
              ? tr("invite.title-collab", "Add a collaborator")
              : tr("invite.title", "Invite to your team")}
          </DialogTitle>
          <DialogDescription>
            {tr("invite.desc", "They'll get an email to accept and join.")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>{tr("label.email", "Email")}</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@example.com"
            />
          </div>
          <div className="space-y-1.5">
            <Label>{tr("label.name", "Name (optional)")}</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={tr("placeholder.name", "Their name")}
            />
          </div>

          {!constrained && (
            <>
              <div className="space-y-1.5">
                <Label>{tr("label.role", "Role")}</Label>
                <Select value={role} onValueChange={(v) => setRole(v as Role)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r === "webmaster"
                          ? tr("role.webmaster", "Web-master")
                          : tr("role.editor", "Editor")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>{tr("label.scope", "Sites")}</Label>
                <Select
                  value={scope}
                  onValueChange={(v) => setScope(v as Scope)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {scopeOptions.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s === "all"
                          ? tr("scope.all", "All sites (incl. future)")
                          : tr("scope.specific", "Specific sites")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {scope === "specific" && (
                <div className="space-y-1.5">
                  <Label>{tr("label.select-sites", "Select sites")}</Label>
                  {sites.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      {tr("invite.no-sites", "You have no sites yet.")}
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {sites.map((s) => (
                        <Badge
                          key={s.id}
                          variant={
                            selectedSites.has(s.id) ? "default" : "secondary"
                          }
                          className="cursor-pointer select-none"
                          onClick={() => toggleSite(s.id)}
                        >
                          {s.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button onClick={submit} disabled={pending}>
            {pending
              ? tr("sending", "Sending…")
              : tr("send-invite", "Send invitation")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
