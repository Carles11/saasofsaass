"use client";

import { addBlock } from "@/3-features/manage-site-blocks";
import { CATEGORY_BLOCKS } from "@/5-shared/config/category-blocks";
import type { Block } from "@/5-shared/lib/db/schema";
import type { BlockKind } from "@/5-shared/types/tenants/blocks";
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
import { useState } from "react";
import { BlockCard } from "./BlockCard";

interface BlockListProps {
  blocks: Block[];
  tenantId: string;
  category: TenantCategory;
  onEdit: (blockId: string) => void;
  setActiveTab?: (tab: string) => void;
  userRole?: "owner" | "editor" | null;
}

export function BlockList({ blocks, tenantId, category, onEdit, setActiveTab, userRole }: BlockListProps) {
  const availableKinds = CATEGORY_BLOCKS[category] ?? [];
  const [newKind, setNewKind] = useState<BlockKind>(availableKinds[0] ?? "hero");

  return (
    <div className="flex flex-col gap-3">
      {blocks.map((block, i) => (
        <BlockCard
          key={block.id}
          block={block}
          tenantId={tenantId}
          isFirst={i === 0}
          isLast={i === blocks.length - 1}
          onEdit={onEdit}
          setActiveTab={setActiveTab}
          userRole={userRole}
        />
      ))}

      {blocks.length === 0 && (
        <p className="text-sm text-zinc-400 text-center py-8">
          No blocks yet. Add your first block below.
        </p>
      )}

      {userRole === "owner" && (
        <Dialog>
          <DialogTrigger asChild>
            <Button tenantVariant="outline" className="mt-2">
              + Add Block
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add a New Block</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 pt-2">
              <Select value={newKind} onValueChange={(v) => setNewKind(v as BlockKind)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select block type" />
                </SelectTrigger>
                <SelectContent>
                  {availableKinds.map((kind) => (
                    <SelectItem key={kind} value={kind}>
                      {kind}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <DialogClose asChild>
                <Button onClick={() => addBlock(tenantId, newKind)} className="w-full">
                  Add &ldquo;{newKind}&rdquo;
                </Button>
              </DialogClose>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
