"use client";

import { Image, Trash2, Upload } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "@/5-shared/lib/ui/toast";

interface LogoSectionProps {
  tenantId: string;
  slug: string;
  initialLogoUrl?: string | null;
  initialLogoS3Key?: string | null;
  initialLogoLinkUrl?: string | null;
}

export function LogoSection({
  tenantId,
  slug,
  initialLogoUrl,
  initialLogoS3Key,
  initialLogoLinkUrl,
}: LogoSectionProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(initialLogoUrl ?? null);
  const [logoS3Key, setLogoS3Key] = useState<string | null>(initialLogoS3Key ?? null);
  const [linkUrl, setLinkUrl] = useState<string>(initialLogoLinkUrl ?? "");
  const [isUploading, setIsUploading] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isDev = process.env.NODE_ENV === "development";
  const devPort = process.env.NEXT_PUBLIC_DEV_PORT || "3000";
  const prodRoot = (
    process.env.NEXT_PUBLIC_ROOT_DOMAIN || "saasofsaass.com"
  ).replace(/https?:\/\//, "").replace(/\/+$/, "");
  const defaultHost = isDev
    ? `http://${slug}.localhost:${devPort}`
    : `https://${slug}.${prodRoot}`;

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("linkUrl", linkUrl || defaultHost);
      form.append("tenantId", tenantId);

      const res = await fetch("/api/tenant/logo/upload", {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        const err = await res.json();
        toast({ title: err.error || "Upload failed", status: "error" });
        return;
      }

      const data = await res.json();
      setLogoUrl(data.logo.url);
      setLogoS3Key(data.logo.s3Key);
      toast({ title: "Logo uploaded", status: "success" });
    } catch {
      toast({ title: "Upload failed (network error)", status: "error" });
    } finally {
      setIsUploading(false);
    }
  }

  async function handleDelete() {
    if (!logoS3Key) return;

    startTransition(async () => {
      try {
        const res = await fetch(
          `/api/tenant/logo/delete?s3Key=${encodeURIComponent(logoS3Key)}&tenantId=${encodeURIComponent(tenantId)}`,
          { method: "DELETE" },
        );

        if (!res.ok) {
          const err = await res.json();
          toast({ title: err.error || "Delete failed", status: "error" });
          return;
        }

        setLogoUrl(null);
        setLogoS3Key(null);
        toast({ title: "Logo removed", status: "success" });
      } catch {
        toast({ title: "Delete failed (network error)", status: "error" });
      }
    });
  }

  return (
    <div className="mb-8">
      <h3 className="font-semibold mb-2">Site Logo</h3>
      <div className="rounded-lg border border-border bg-card p-4 space-y-4">
        {/* Preview */}
        {logoUrl ? (
          <div className="flex items-center gap-4">
            <img
              src={logoUrl}
              alt="Site logo"
              className="max-h-16 w-auto rounded"
            />
            <button
              type="button"
              disabled={isPending}
              onClick={handleDelete}
              className="inline-flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 transition-colors disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Remove
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-muted-foreground">
            <Image className="h-8 w-8" />
            <span className="text-sm">No logo uploaded</span>
          </div>
        )}

        {/* Upload */}
        <div>
          <label className="inline-flex items-center gap-1.5 cursor-pointer text-sm font-medium text-primary hover:text-primary/80 transition-colors">
            <Upload className="h-4 w-4" />
            {isUploading ? "Uploading..." : "Upload logo"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={isUploading}
              onChange={handleUpload}
            />
          </label>
          <p className="text-xs text-muted-foreground mt-1">
            PNG, JPG or WebP. Max 2MB. Will be resized to 2000px max.
          </p>
        </div>

        {/* Link URL */}
        <div className="flex flex-col gap-1">
          <label htmlFor="logo-link-url" className="text-sm font-medium">
            Logo link URL
          </label>
          <input
            id="logo-link-url"
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder={defaultHost}
            className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <p className="text-xs text-muted-foreground">
            Where the logo links to. Leave empty to link to your site homepage.
          </p>
        </div>
      </div>
    </div>
  );
}
