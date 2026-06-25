"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { publishTenant, unpublishTenant } from "@/3-features/manage-tenants/actions/publishTenant";
import { Button } from "@/components/ui/button";

interface SitePublishToggleProps {
  tenantId: string;
  status: string;
  canManage: boolean;
}

export function SitePublishToggle({ tenantId, status, canManage }: SitePublishToggleProps) {
  const [current, setCurrent] = useState(status);
  const [isPending, startTransition] = useTransition();
  const published = current === "published";

  function toggle() {
    startTransition(async () => {
      try {
        if (published) {
          await unpublishTenant(tenantId);
          setCurrent("draft");
          toast.success("Site unpublished");
        } else {
          await publishTenant(tenantId);
          setCurrent("published");
          toast.success("Site published");
        }
      } catch (err: any) {
        toast.error(err?.message ?? "Action failed");
      }
    });
  }

  return (
    <div className="flex items-center gap-3">
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
          published
            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            : "bg-muted text-muted-foreground"
        }`}
      >
        <span className={`size-1.5 rounded-full ${published ? "bg-emerald-500" : "bg-muted-foreground"}`} />
        {published ? "Published" : "Draft"}
      </span>
      {canManage && (
        <Button
          variant={published ? "outline" : "default"}
          size="sm"
          disabled={isPending}
          onClick={toggle}
        >
          {isPending ? "…" : published ? "Unpublish" : "Publish"}
        </Button>
      )}
    </div>
  );
}
