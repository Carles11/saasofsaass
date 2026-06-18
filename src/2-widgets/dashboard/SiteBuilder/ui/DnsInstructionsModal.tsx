"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ExternalLink, MailQuestion } from "lucide-react";
import { parseDnsColumn } from "@/5-shared/lib/utils/dnsRecords";
import { DnsRecordCard } from "./DnsRecordCard";
import { buildDelegateEmailLink } from "./buildDelegateEmailLink";

interface DnsInstructionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  domain: string;
  dnsInstructions: string | null;
  txt: Record<string, string>;
}

export function DnsInstructionsModal({
  open,
  onOpenChange,
  domain,
  dnsInstructions,
  txt,
}: DnsInstructionsModalProps) {
  const { txt: instructionsTxt, records } =
    parseDnsColumn(dnsInstructions);

  function handleDelegate() {
    const href = buildDelegateEmailLink(
      domain,
      records,
      txt["settings.domain.delegate.subject"],
      txt["settings.domain.delegate.body"],
    );
    window.location.href = href;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {txt["settings.domain.dns-modal.title"] ?? "DNS Configuration"}
          </DialogTitle>
          <DialogDescription>
            {txt["settings.domain.dns-modal.description"] ??
              "Add these DNS records at your domain registrar to connect your domain."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Section 1: DNS records */}
          {records.length > 0 ? (
            <div className="space-y-3">
              {records.map((record, i) => (
                <DnsRecordCard
                  key={`${record.type}-${record.name}-${i}`}
                  step={i + 1}
                  record={record}
                  stepLabel={
                    txt["settings.domain.dns-modal.step-label"] ?? "Step {step}"
                  }
                  typeLabel={
                    txt["settings.domain.dns-modal.type-label"] ??
                    "{type} Record"
                  }
                  nameLabel={
                    txt["settings.domain.dns-modal.name-label"] ?? "Name / Host"
                  }
                  valueLabel={
                    txt["settings.domain.dns-modal.value-label"] ??
                    "Points to / Value"
                  }
                  copyLabel={
                    txt["settings.domain.dns-modal.copy"] ?? "Copy"
                  }
                  copiedLabel={
                    txt["settings.domain.dns-modal.copied"] ?? "Copied!"
                  }
                />
              ))}
            </div>
          ) : (
            /* Fallback: raw instructions text or generic message */
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <p className="text-sm font-medium text-foreground">
                {instructionsTxt || (
                  <>
                    Add an{" "}
                    <strong>A record</strong> pointing to{" "}
                    <code>76.76.21.21</code> or a{" "}
                    <strong>CNAME</strong> to{" "}
                    <code>cname.vercel-dns.com</code> at
                    your domain registrar, then check status again.
                  </>
                )}
              </p>
            </div>
          )}

          {/* Outbound documentation links */}
          <div className="flex flex-col gap-2 text-sm">
            <a
              href="https://vercel.com/docs/domains/working-with-domains/add-a-domain#step-2--add-your-domain-to-vercel"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground underline underline-offset-2"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              {txt["settings.domain.dns-modal.guide-link"] ??
                "Open Vercel's custom domain setup guide"}
            </a>
            <a
              href="https://pressific.com/articles/how-to-update-your-dns-records-on/#2-namecheap"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground underline underline-offset-2"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              {txt["settings.domain.dns-modal.registrar-link"] ??
                "DNS instructions for common registrars"}
            </a>
          </div>

          {/* Section 2: Forward to a friend */}
          <div className="rounded-lg border-2 border-dashed border-border bg-muted/30 p-4">
            <div className="mb-3 flex items-center gap-2">
              <MailQuestion className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">
                {txt["settings.domain.dns-modal.no-dns-heading"] ??
                  "No idea what DNS is about?"}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelegate}
              className="w-full"
            >
              {txt["settings.domain.dns-modal.delegate-button"] ??
                "Forward to a tech-savvy friend"}
            </Button>
          </div>
        </div>

        <DialogClose asChild>
          <Button variant="outline" className="mt-2 w-full">
            Close
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
