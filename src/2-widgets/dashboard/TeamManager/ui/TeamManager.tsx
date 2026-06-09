"use client";

import { useState, useTransition } from "react";
import { inviteMember, removeMember, getTeamMembers } from "@/3-features/team-management/actions/teamActions";
import { Button } from "@/components/tenant/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Tenant } from "@/5-shared/lib/db/schema";

interface TeamMember {
  membership: { id: string; tenantId: string; profileId: string; role: string };
  profile: { id: string; email: string; name: string };
}

interface TeamManagerProps {
  tenant: Tenant;
  initialMembers: TeamMember[];
}

export function TeamManager({ tenant, initialMembers }: TeamManagerProps) {
  const [members, setMembers] = useState<TeamMember[]>(initialMembers);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"owner" | "editor">("editor");
  const [isPending, startTransition] = useTransition();

  async function handleInvite() {
    if (!email.trim()) return;
    startTransition(async () => {
      await inviteMember(tenant.id, email.trim(), role);
      const updated = await getTeamMembers(tenant.id);
      setMembers(updated);
      setEmail("");
    });
  }

  async function handleRemove(membershipId: string) {
    startTransition(async () => {
      await removeMember(tenant.id, membershipId);
      const updated = await getTeamMembers(tenant.id);
      setMembers(updated);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team &mdash; {tenant.name}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Current members */}
        <div className="space-y-2 mb-6">
          {members.map((m) => (
            <div
              key={m.membership.id}
              className="flex items-center justify-between p-3 rounded-lg border border-zinc-200"
            >
              <div>
                <p className="font-medium text-sm">{m.profile.name || m.profile.email}</p>
                <p className="text-xs text-zinc-500">{m.profile.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={m.membership.role === "owner" ? "default" : "secondary"}>
                  {m.membership.role}
                </Badge>
                {m.membership.role !== "owner" && (
                  <Button
                    tenantVariant="destructive"
                    size="sm"
                    disabled={isPending}
                    onClick={() => handleRemove(m.membership.id)}
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>
          ))}
          {members.length === 0 && (
            <p className="text-sm text-zinc-400 text-center py-4">No team members yet.</p>
          )}
        </div>

        {/* Invite form */}
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <label className="text-xs font-medium text-zinc-500 mb-1 block">Email</label>
            <Input
              type="email"
              placeholder="colleague@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="w-32">
            <label className="text-xs font-medium text-zinc-500 mb-1 block">Role</label>
            <Select value={role} onValueChange={(v) => setRole(v as "owner" | "editor")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="owner">Owner</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleInvite} disabled={isPending || !email.trim()}>
            Invite
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
