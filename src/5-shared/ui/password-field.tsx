"use client";

import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/5-shared/lib/utils";

function PasswordField({
  className,
  enableToggle = true,
  onChange,
  ...props
}: React.ComponentProps<typeof Input> & { enableToggle?: boolean }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);

  return (
    <div className="relative">
      <Input
        className={cn(enableToggle && "pr-10", className)}
        type={isVisible && enableToggle ? "text" : "password"}
        onChange={(e) => {
          setIsEmpty(!e.target.value);
          onChange?.(e);
        }}
        {...props}
      />

      {enableToggle && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute top-0 right-0 !bg-transparent"
          disabled={isEmpty}
          onClick={() => setIsVisible((v) => !v)}
          aria-label={isVisible ? "Hide password" : "Show password"}
        >
          {isVisible ? <EyeOffIcon /> : <EyeIcon />}
        </Button>
      )}
    </div>
  );
}

export { PasswordField };
