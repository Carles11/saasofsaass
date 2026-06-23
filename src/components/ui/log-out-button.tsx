"use client";

import { authClient } from "@/5-shared/lib/auth/client";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface LogOutButtonProps {
  label?: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "destructive" | "link";
  size?: "default" | "xs" | "sm" | "lg" | "icon" | "icon-xs" | "icon-sm" | "icon-lg";
  className?: string;
}

export function LogOutButton({
  label = "Sign Out",
  variant = "ghost",
  size = "sm",
  className,
}: LogOutButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);
    await authClient.signOut();
    router.refresh();
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      disabled={loading}
      onClick={handleSignOut}
    >
      <LogOut className="h-4 w-4 mr-1.5" />
      {loading ? "..." : label}
    </Button>
  );
}
