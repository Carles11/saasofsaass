import type { TenantCategory } from "@/5-shared/types/tenants/categories";

export const CATEGORY_LABELS: Record<TenantCategory, { label: string; description: string }> = {
  "social-work": {
    label: "Social Work",
    description: "NGOs, associations, and social impact organizations",
  },
  wedding: {
    label: "Wedding",
    description: "Wedding planners, photographers, and venues",
  },
};
