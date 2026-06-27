"use client";

import { ArrowLeftIcon, Loader2 } from "lucide-react";
import { useContext, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { AuthUIContext } from "@neondatabase/auth-ui";

import { PasswordField } from "@/5-shared/ui/password-field";

export function ResetPasswordForm() {
  const {
    authClient,
    basePath,
    credentials,
    localization,
    viewPaths,
    navigate,
    toast,
  } = useContext(AuthUIContext);

  const tokenChecked = useRef(false);
  const [token, setToken] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const confirmPasswordEnabled = credentials?.confirmPassword;

  useEffect(() => {
    if (tokenChecked.current) return;
    tokenChecked.current = true;

    const searchParams = new URLSearchParams(window.location.search);
    const t = searchParams.get("token");

    if (!t || t === "INVALID_TOKEN") {
      navigate(
        `${basePath}/${viewPaths.SIGN_IN}${window.location.search}`,
      );
      toast({ variant: "error", message: localization.INVALID_TOKEN });
      return;
    }

    setToken(t);
  }, [basePath, navigate, toast, viewPaths, localization]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!newPassword) {
      setError(localization.NEW_PASSWORD_REQUIRED);
      return;
    }

    if (confirmPasswordEnabled && newPassword !== confirmPassword) {
      setError(localization.PASSWORDS_DO_NOT_MATCH);
      return;
    }

    setLoading(true);

    try {
      await authClient.resetPassword({
        newPassword,
        token: token!,
        fetchOptions: { throw: true },
      });

      toast({
        variant: "success",
        message: localization.RESET_PASSWORD_SUCCESS,
      });

      navigate(
        `${basePath}/${viewPaths.SIGN_IN}${window.location.search}`,
      );
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : localization.REQUEST_FAILED;
      setError(message);
      toast({ variant: "error", message });
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{localization.RESET_PASSWORD}</CardTitle>
        <CardDescription>
          {localization.RESET_PASSWORD_DESCRIPTION}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {error && (
          <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid w-full gap-6">
          <div className="grid gap-2">
            <Label htmlFor="reset-new-password">
              {localization.NEW_PASSWORD}
            </Label>
            <PasswordField
              id="reset-new-password"
              autoComplete="new-password"
              placeholder={localization.NEW_PASSWORD_PLACEHOLDER}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={loading}
              enableToggle
              required
            />
          </div>

          {confirmPasswordEnabled && (
            <div className="grid gap-2">
              <Label htmlFor="reset-confirm-password">
                {localization.CONFIRM_PASSWORD}
              </Label>
              <PasswordField
                id="reset-confirm-password"
                autoComplete="new-password"
                placeholder={localization.CONFIRM_PASSWORD_PLACEHOLDER}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                enableToggle
                required
              />
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              localization.RESET_PASSWORD_ACTION
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="justify-center gap-1.5 text-muted-foreground text-sm">
        <ArrowLeftIcon className="size-3" />
        <Button
          variant="link"
          size="sm"
          className="px-0 text-foreground underline"
          onClick={() => window.history.back()}
        >
          {localization.GO_BACK}
        </Button>
      </CardFooter>
    </Card>
  );
}
