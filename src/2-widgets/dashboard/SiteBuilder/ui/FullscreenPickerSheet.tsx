"use client";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { XIcon } from "lucide-react";
import type { ReactNode } from "react";

interface FullscreenPickerSheetProps {
  /** Controlled open state. Omit to use trigger-based uncontrolled mode. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Optional trigger element (rendered via SheetTrigger asChild). */
  trigger?: ReactNode;
  title: string;
  /** Optional description shown under the title. */
  description?: string;
  /** Optional toolbar row under the header (e.g. category pills). */
  toolbar?: ReactNode;
  /** Sticky bottom action bar. */
  footer?: ReactNode;
  /** Scrollable body. */
  children: ReactNode;
}

/**
 * Full-screen bottom-sheet shell shared by the block picker and the template
 * gallery. Owns the sizing chrome (100dvh sheet, header with close button,
 * scrollable body, sticky footer) so both pickers stay visually consistent.
 * The body content is fully owned by each caller.
 */
export function FullscreenPickerSheet({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  toolbar,
  footer,
  children,
}: FullscreenPickerSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
      <SheetContent
        side="bottom"
        className="min-h-[100dvh] max-h-[100dvh] overflow-hidden p-0 flex flex-col"
        showCloseButton={false}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-2 shrink-0">
          <div className="min-w-0">
            <SheetTitle className="text-xl font-bold text-foreground">
              {title}
            </SheetTitle>
            {description && (
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          <SheetClose asChild>
            <button
              type="button"
              aria-label="Close"
              className="h-8 w-8 shrink-0 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              <XIcon className="h-5 w-5" />
            </button>
          </SheetClose>
        </div>

        {toolbar && <div className="px-6 pb-4 shrink-0">{toolbar}</div>}

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 pb-4">{children}</div>

        {footer && (
          <div className="shrink-0 border-t border-border bg-popover px-6 py-4">
            {footer}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
