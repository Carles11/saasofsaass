import { cn } from "@/5-shared/lib/utils";
import { Button as BaseButton } from "@/components/ui/button";
import * as React from "react";

export interface TenantButtonProps extends React.ComponentProps<typeof BaseButton> {
  tenantVariant?: string; // for future per-tenant or template variants
}

export const Button = React.forwardRef<HTMLButtonElement, TenantButtonProps>(
  ({ tenantVariant = "default", className, ...props }, ref) => {
    // You can add logic for tenant-specific or template-specific variants here
    return (
      <BaseButton
        ref={ref}
        className={cn(
          tenantVariant === "default" &&
            "bg-primary text-primary-foreground cursor-pointer hover:bg-primary/90",
          tenantVariant !== "default" &&
            `tenant-${tenantVariant}  cursor-pointer hover:bg-primary/90`,
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "TenantButton";
