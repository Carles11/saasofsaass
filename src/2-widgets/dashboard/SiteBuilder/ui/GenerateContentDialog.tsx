"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/tenant/ui/button";

interface GenerateContentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  defaultLocale: string;
  isPending: boolean;
}

export function GenerateContentDialog({
  open,
  onOpenChange,
  onConfirm,
  defaultLocale,
  isPending,
}: GenerateContentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>No Content Found</DialogTitle>
          <DialogDescription>
            No content exists for this block. Generate placeholder content in{" "}
            <strong className="uppercase">{defaultLocale}</strong> and translate to all
            enabled languages?
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-2 justify-end">
          <DialogClose asChild>
            <Button tenantVariant="outline" disabled={isPending}>
              Cancel
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button
              tenantVariant="default"
              disabled={isPending}
              onClick={onConfirm}
            >
              {isPending ? "Generating…" : "Generate & Translate"}
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
