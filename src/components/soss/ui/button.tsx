import * as React from "react";
import { Button as BaseButton, buttonVariants } from "@/components/ui/button";
import { cn } from "@/5-shared/lib/utils";

export interface SossButtonProps extends React.ComponentProps<typeof BaseButton> {
  sossVariant?: "dashboard" | "marketing";
}

export const Button = React.forwardRef<HTMLButtonElement, SossButtonProps>(
  ({ sossVariant = "dashboard", className, ...props }, ref) => {
    // You can add more logic here for different SoSS variants
    return (
      <BaseButton
        ref={ref}
        className={cn(
          sossVariant === "dashboard" && "bg-emerald-600 text-white font-bold",
          sossVariant === "marketing" && "bg-linear-to-r from-emerald-400 to-green-600 text-white font-extrabold tracking-wide shadow-lg",
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "SossButton";
