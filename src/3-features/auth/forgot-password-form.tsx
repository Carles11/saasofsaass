"use client";

import { ArrowLeftIcon, Loader2 } from "lucide-react";
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

export function ForgotPasswordForm() {
  const { authClient, basePath, localization, viewPaths, navigate, toast } =
    useContext(AuthUIContext);

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await authClient.requestPasswordReset({
        email,
        redirectTo: `${basePath}/${viewPaths.RESET_PASSWORD}`,
        fetchOptions: { throw: true },
      });

      toast({
        variant: "success",
        message: localization.FORGOT_PASSWORD_EMAIL,
      });

      navigate(`${basePath}/${viewPaths.SIGN_IN}${window.location.search}`);
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
        <CardTitle>{localization.FORGOT_PASSWORD}</CardTitle>
        <CardDescription>
          {localization.FORGOT_PASSWORD_DESCRIPTION}
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
            <Label htmlFor="forgot-email">{localization.EMAIL}</Label>
            <Input
              id="forgot-email"
              type="email"
              autoComplete="email"
              placeholder={localization.EMAIL_PLACEHOLDER}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
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
              localization.FORGOT_PASSWORD_ACTION
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="justify-center gap-1.5 text-muted-foreground text-sm">
        <ArrowLeftIcon className="size-3" />
        <Button
          variant="link"
          size="sm"
          className="px-0 text-foreground underline cursor-pointer"
          onClick={() => window.history.back()}
        >
          {localization.GO_BACK}
        </Button>
      </CardFooter>
    </Card>
  );
}
