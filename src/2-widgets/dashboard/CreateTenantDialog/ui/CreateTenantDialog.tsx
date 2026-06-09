"use client";

import { createTenant } from "@/3-features/manage-tenants";
import { CATEGORY_LABELS } from "@/5-shared/config/category-labels";
import type { TenantCategory } from "@/5-shared/types/tenants/categories";
import { Button } from "@/components/tenant/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 63);
}

export function CreateTenantDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [category, setCategory] = useState<TenantCategory>("social-work");
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
        const result = await createTenant({ name, slug, category });
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
    [name, slug, category, router]
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button tenantVariant="default" className="shrink-0">
          + Create Site
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a New Site</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
          {/* Name */}
          <div className="flex flex-col gap-1">
            <label htmlFor="create-site-name" className="text-sm font-medium text-zinc-700">
              Site Name
            </label>
            <input
              id="create-site-name"
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Àgora Association"
              className="rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
              required
              maxLength={100}
            />
          </div>

          {/* Slug */}
          <div className="flex flex-col gap-1">
            <label htmlFor="create-site-slug" className="text-sm font-medium text-zinc-700">
              Subdomain
            </label>
            <div className="flex items-center rounded-lg border border-zinc-200 px-3 py-2 text-sm focus-within:ring-2 focus-within:ring-zinc-900">
              <input
                id="create-site-slug"
                type="text"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
                  setSlugEdited(true);
                }}
                placeholder="agora"
                className="flex-1 focus:outline-none"
                required
                pattern="^[a-z0-9]([a-z0-9-]{1,61})[a-z0-9]$"
                title="3-63 characters, only lowercase letters, numbers, and hyphens. Must start and end with a letter or number."
              />
              <span className="text-xs text-zinc-400 ml-2 shrink-0">
                .{typeof window !== "undefined" && window.location.hostname.includes("localhost") ? "lvh.me:3000" : "saasofsaass.com"}
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Lowercase letters, numbers, and hyphens only (3-63 chars).
            </p>
          </div>

          {/* Category */}
          <div className="flex flex-col gap-1">
            <label htmlFor="create-site-category" className="text-sm font-medium text-zinc-700">
              Category
            </label>
            <Select
              value={category}
              onValueChange={(v) => setCategory(v as TenantCategory)}
            >
              <SelectTrigger id="create-site-category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CATEGORY_LABELS).map(
                  ([key, val]) => (
                    <SelectItem key={key} value={key}>
                      {val.label} — {val.description}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <DialogClose asChild>
              <Button type="button" tenantVariant="outline" disabled={pending}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" tenantVariant="default" disabled={pending}>
              {pending ? "Creating…" : "Create Site"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
