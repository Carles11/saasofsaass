import * as React from "react";
import { Button as BaseButton, buttonVariants } from "@/components/ui/button";
import { cn } from "@/5-shared/lib/utils";

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
          tenantVariant === "default" && "bg-primary text-primary-foreground",
          tenantVariant !== "default" && `tenant-${tenantVariant}`,
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "TenantButton";
