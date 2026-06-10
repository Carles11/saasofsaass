"use client";

import { createTenant } from "@/3-features/manage-tenants";
import { Button } from "@/components/tenant/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { resolveTranslation, type TranslationDict } from "@/5-shared/lib/translations/resolve";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 63);
}

interface CreateTenantDialogProps {
  translations?: TranslationDict;
}

export function CreateTenantDialog({ translations }: CreateTenantDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const handleNameChange = useCallback(
    (value: string) => {
      setName(value);
      if (!slugEdited) {
        setSlug(slugify(value));
      }
    },
    [slugEdited]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setPending(true);

      try {
        const result = await createTenant({ name, slug });
        setOpen(false);
        setName("");
        setSlug("");
        setSlugEdited(false);
        router.push(`/en/dashboard/site-builder/${result.id}`);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to create tenant.");
      } finally {
        setPending(false);
      }
    },
    [name, slug, router]
  );

  const triggerLabel = resolveTranslation(translations, "trigger", "+ Create Site");
  const dialogTitle = resolveTranslation(translations, "dialog.title", "Create a New Site");
  const nameLabel = resolveTranslation(translations, "label.name", "Site Name");
  const namePlaceholder = resolveTranslation(
    translations,
    "placeholder.name",
    "e.g. Àgora Association",
  );
  const slugLabel = resolveTranslation(translations, "label.slug", "Subdomain");
  const slugPlaceholder = resolveTranslation(translations, "placeholder.slug", "agora");
  const slugHint = resolveTranslation(
    translations,
    "slug-hint",
    "Lowercase letters, numbers, and hyphens only (3-63 chars).",
  );
  const creatingLabel = resolveTranslation(translations, "creating", "Creating...");
  const submitLabel = resolveTranslation(translations, "submit", "Create Site");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button tenantVariant="default" className="shrink-0">
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
          {/* Name */}
          <div className="flex flex-col gap-1">
            <label htmlFor="create-site-name" className="text-sm font-medium text-foreground">
              {nameLabel}
            </label>
            <input
              id="create-site-name"
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder={namePlaceholder}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              required
              maxLength={100}
            />
          </div>

          {/* Slug */}
          <div className="flex flex-col gap-1">
            <label htmlFor="create-site-slug" className="text-sm font-medium text-foreground">
              {slugLabel}
            </label>
            <div className="flex items-center rounded-lg border border-border bg-background px-3 py-2 text-sm focus-within:ring-2 focus-within:ring-ring">
              <input
                id="create-site-slug"
                type="text"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
                  setSlugEdited(true);
                }}
                placeholder={slugPlaceholder}
                className="flex-1 focus:outline-none"
                required
                pattern="^[a-z0-9]([a-z0-9-]{1,61})[a-z0-9]$"
                title="3-63 characters, only lowercase letters, numbers, and hyphens. Must start and end with a letter or number."
              />
              <span className="text-xs text-muted-foreground ml-2 shrink-0">
                .{typeof window !== "undefined" && window.location.hostname.includes("localhost") ? "lvh.me:3000" : "saasofsaass.com"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {slugHint}
            </p>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <DialogClose asChild>
              <Button type="button" tenantVariant="outline" disabled={pending}>
                {resolveTranslation(translations, "cancel", "Cancel")}
              </Button>
            </DialogClose>
            <Button type="submit" tenantVariant="default" disabled={pending}>
              {pending ? creatingLabel : submitLabel}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
