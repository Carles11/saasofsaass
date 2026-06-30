"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  parsePublishCapError,
  publishTenant,
  unpublishTenant,
  type PublishCapInfo,
} from "@/3-features/manage-tenants/actions/publishTenant";
import { EXTRA_SITE } from "@/5-shared/lib/billing/plans";
import { Button } from "@/components/ui/button";
import { PublishCapDialog } from "@/2-widgets/dashboard/Billing/ui/PublishCapDialog";

interface SitePublishToggleProps {
  tenantId: string;
  status: string;
  canManage: boolean;
}

export function SitePublishToggle({ tenantId, status, canManage }: SitePublishToggleProps) {
  const router = useRouter();
  const [current, setCurrent] = useState(status);
  const [isPending, startTransition] = useTransition();
  const [capInfo, setCapInfo] = useState<PublishCapInfo | null>(null);
  const published = current === "published";

  const attemptPublish = () => {
    startTransition(async () => {
      try {
        await publishTenant(tenantId);
        setCurrent("published");
        toast.success("Site published");
      } catch (err: unknown) {
        const cap = parsePublishCapError(err);
        if (cap) {
          setCapInfo(cap);
          return;
        }
        toast.error(err instanceof Error ? err.message : "Action failed");
      }
    });
  };

  function toggle() {
    if (published) {
      startTransition(async () => {
        try {
          await unpublishTenant(tenantId);
          setCurrent("draft");
          toast.success("Site unpublished");
        } catch (err: unknown) {
          toast.error(err instanceof Error ? err.message : "Action failed");
        }
      });
    } else {
      attemptPublish();
    }
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
      {capInfo && (
        <PublishCapDialog
          open={capInfo !== null}
          onOpenChange={(open) => !open && setCapInfo(null)}
          plan={capInfo.plan}
          addonSites={capInfo.addonSites}
          softCap={EXTRA_SITE.softCap}
          onExtraSiteAdded={() => {
            router.refresh();
            attemptPublish();
          }}
        />
      )}
    </div>
  );
}
