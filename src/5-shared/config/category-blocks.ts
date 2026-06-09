import type { BlockKind } from "@/5-shared/types/tenants/blocks";
import type { TenantCategory } from "@/5-shared/types/tenants/categories";

export const CATEGORY_BLOCKS: Record<TenantCategory, BlockKind[]> = {
  "social-work": [
    "navbar",
    "hero",
    "blog-feed",
    "awards",
    "podcast-feed",
    "contact",
    "image-gallery",
  ],
  wedding: [
    "navbar",
    "hero",
    "blog-feed",
    "image-gallery",
    "contact",
  ],
};
