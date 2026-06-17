"use client";

import { cn } from "@/5-shared/lib/utils";

interface BlockExpandedAreaProps {
  isExpanded: boolean;
  children: React.ReactNode;
}

export function BlockExpandedArea({ isExpanded, children }: BlockExpandedAreaProps) {
  return (
    <div
      className={cn(
        "grid transition-all duration-300 ease-in-out",
        isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
      )}
    >
      <div className="overflow-hidden min-h-0">
        {children}
      </div>
    </div>
  );
}
