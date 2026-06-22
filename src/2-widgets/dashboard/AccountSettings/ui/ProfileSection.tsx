"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateProfile } from "@/3-features/manage-profile/actions/updateProfile";
import { resolveTranslation, type TranslationDict } from "@/5-shared/lib/translations/resolve";

interface ProfileSectionProps {
  profile: { id: string; name: string; email: string; avatarUrl: string | null };
  translations?: TranslationDict;
}

export function ProfileSection({ profile, translations }: ProfileSectionProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile.name);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const title = resolveTranslation(translations, "profile.title", "Profile");
  const nameLabel = resolveTranslation(translations, "profile.name-label", "Name");
  const emailLabel = resolveTranslation(translations, "profile.email-label", "Email");
  const editLabel = resolveTranslation(translations, "profile.edit", "Edit");
  const saveLabel = resolveTranslation(translations, "profile.save", "Save");
  const cancelLabel = resolveTranslation(translations, "profile.cancel", "Cancel");
  const savingLabel = resolveTranslation(translations, "profile.saving", "Saving...");
  const updatedMsg = resolveTranslation(translations, "profile.updated", "Profile updated successfully.");
  const errorMsg = resolveTranslation(translations, "profile.error", "Failed to update profile.");

  async function handleSave() {
    if (!name.trim()) return;
    startTransition(async () => {
      try {
        await updateProfile({ name: name.trim() });
        setMessage(updatedMsg);
        setEditing(false);
      } catch {
        setMessage(errorMsg);
      }
    });
  }

  function handleCancel() {
    setName(profile.name);
    setEditing(false);
    setMessage(null);
  }

  const initials = (profile.name || profile.email).slice(0, 2).toUpperCase();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        {!editing && (
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            {editLabel}
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <Avatar size="lg">
            {profile.avatarUrl ? (
              <AvatarImage src={profile.avatarUrl} alt={profile.name} />
            ) : null}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">{nameLabel}</label>
              {editing ? (
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isPending}
                  className="mt-1"
                />
              ) : (
                <p className="text-sm font-medium mt-0.5">{profile.name || "—"}</p>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">{emailLabel}</label>
              <p className="text-sm font-medium mt-0.5">{profile.email}</p>
            </div>
          </div>
        </div>

        {editing && (
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handleSave} disabled={isPending || !name.trim()}>
              {isPending ? savingLabel : saveLabel}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleCancel} disabled={isPending}>
              {cancelLabel}
            </Button>
          </div>
        )}

        {message && (
          <p className="text-sm text-muted-foreground">{message}</p>
        )}
      </CardContent>
    </Card>
  );
}
