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

export function SignInForm() {
  const {
    authClient,
    basePath,
    credentials,
    localization,
    viewPaths,
    toast,
    Link,
  } = useContext(AuthUIContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const forgotPasswordEnabled = credentials?.forgotPassword;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await authClient.signIn.email({
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
        <CardTitle>{localization.SIGN_IN}</CardTitle>
        <CardDescription>{localization.SIGN_IN_DESCRIPTION}</CardDescription>
      </CardHeader>

      <CardContent>
        {error && (
          <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid w-full gap-6">
          <div className="grid gap-2">
            <Label htmlFor="sign-in-email">{localization.EMAIL}</Label>
            <Input
              id="sign-in-email"
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
            <div className="flex items-center justify-between">
              <Label htmlFor="sign-in-password">{localization.PASSWORD}</Label>

              {forgotPasswordEnabled && (
                <Link
                  className="text-sm hover:underline"
                  href={`${basePath}/${viewPaths.FORGOT_PASSWORD}`}
                >
                  {localization.FORGOT_PASSWORD_LINK}
                </Link>
              )}
            </div>

            <PasswordField
              id="sign-in-password"
              autoComplete="current-password"
              placeholder={localization.PASSWORD_PLACEHOLDER}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              enableToggle
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full cursor-pointer"
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              localization.SIGN_IN_ACTION
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          {localization.DONT_HAVE_AN_ACCOUNT}{" "}
          <Link
            className="font-medium text-primary hover:underline"
            href={`${basePath}/${viewPaths.SIGN_UP}`}
          >
            {localization.SIGN_UP}
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
