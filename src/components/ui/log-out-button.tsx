"use client";

import { authClient } from "@/5-shared/lib/auth/client";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
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
  const params = useParams();
  const locale = (params?.locale as string) ?? "en";
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);
    await authClient.signOut();
    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "localhost";
    const isDev = process.env.NODE_ENV === "development";
    const base = isDev ? `http://${rootDomain}:3000` : `https://${rootDomain}`;
    window.location.href = `${base}/${locale}`;
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
