"use client";

import { Loader2 } from "lucide-react";
import { useContext, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthUIContext } from "@neondatabase/auth-ui";

import { PasswordField } from "@/5-shared/ui/password-field";

export function SignUpForm() {
  const {
    authClient,
    basePath,
    credentials,
    localization,
    viewPaths,
    navigate,
    toast,
    Link,
  } = useContext(AuthUIContext);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const confirmPasswordEnabled = credentials?.confirmPassword;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (confirmPasswordEnabled && password !== confirmPassword) {
      setError(localization.PASSWORDS_DO_NOT_MATCH);
      setLoading(false);
      return;
    }

    try {
      await authClient.signUp.email({
        name,
        email,
        password,
        fetchOptions: { throw: true },
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : localization.REQUEST_FAILED;
      setError(message);
      toast({ variant: "error", message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{localization.SIGN_UP}</CardTitle>
        <CardDescription>{localization.SIGN_UP_DESCRIPTION}</CardDescription>
      </CardHeader>

      <CardContent>
        {error && (
          <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid w-full gap-6">
          <div className="grid gap-2">
            <Label htmlFor="sign-up-name">{localization.NAME}</Label>
            <Input
              id="sign-up-name"
              type="text"
              autoComplete="name"
              placeholder={localization.NAME_PLACEHOLDER}
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="sign-up-email">{localization.EMAIL}</Label>
            <Input
              id="sign-up-email"
              type="email"
              autoComplete="email"
              placeholder={localization.EMAIL_PLACEHOLDER}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="sign-up-password">{localization.PASSWORD}</Label>
            <PasswordField
              id="sign-up-password"
              autoComplete="new-password"
              placeholder={localization.PASSWORD_PLACEHOLDER}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              enableToggle
              required
            />
          </div>

          {confirmPasswordEnabled && (
            <div className="grid gap-2">
              <Label htmlFor="sign-up-confirm-password">
                {localization.CONFIRM_PASSWORD}
              </Label>
              <PasswordField
                id="sign-up-confirm-password"
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

          <Button
            type="submit"
            disabled={loading}
            className="w-full cursor-pointer"
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              localization.SIGN_UP_ACTION
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          {localization.ALREADY_HAVE_AN_ACCOUNT}{" "}
          <Link
            className="font-medium text-primary hover:underline"
            href={`${basePath}/${viewPaths.SIGN_IN}`}
          >
            {localization.SIGN_IN}
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
