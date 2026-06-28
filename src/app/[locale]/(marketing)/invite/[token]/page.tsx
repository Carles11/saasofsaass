import { getSession } from "@/5-shared/lib/auth/authorization";
import { getInvitationForDisplay } from "@/3-features/team-management/queries/teamQueries";
import { getPlatformTranslations } from "@/5-shared/lib/db/platform-translations";
import { resolveTranslation } from "@/5-shared/lib/translations/resolve";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AcceptInviteForm } from "./AcceptInviteForm";
import { RememberInvite } from "@/3-features/team-management/ui/RememberInvite";

export const dynamic = "force-dynamic";

function fill(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Card>{children}</Card>
      </div>
    </main>
  );
}

export default async function InvitePage({
  params,
}: {
  params: Promise<{ locale: string; token: string }>;
}) {
  const { locale, token } = await params;
  const [inv, t] = await Promise.all([
    getInvitationForDisplay(token),
    getPlatformTranslations("invite", locale),
  ]);
  const tr = (k: string, fb: string) => resolveTranslation(t, k, fb);

  if (!inv || inv.status !== "pending") {
    const message = !inv
      ? tr("invalid", "This invitation link is invalid or no longer exists.")
      : inv.status === "accepted"
        ? tr("already-accepted", "This invitation has already been accepted.")
        : inv.status === "revoked"
          ? tr("revoked", "This invitation has been revoked.")
          : tr("expired", "This invitation has expired. Ask for a new one.");
    return (
      <Shell>
        <CardHeader>
          <CardTitle>{tr("invalid-title", "Team invitation")}</CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
      </Shell>
    );
  }

  const session = await getSession();
  const signedInEmail = session?.user?.email?.toLowerCase() ?? null;
  const matches = signedInEmail !== null && signedInEmail === inv.email.toLowerCase();

  const roleLabel =
    inv.role === "webmaster"
      ? tr("role.webmaster", "web-master")
      : tr("role.editor", "editor");
  const sitesText =
    inv.siteScope === "all"
      ? tr("scope.all", "all sites")
      : inv.siteNames.length > 0
        ? inv.siteNames.join(", ")
        : tr("scope.specific", "selected sites");

  const intro = inv.inviterName
    ? fill(tr("body", "{inviter} invited you to join their team as {role} for {sites}."), {
        inviter: inv.inviterName,
        role: roleLabel,
        sites: sitesText,
      })
    : fill(tr("body-no-inviter", "You've been invited to join a team as {role} for {sites}."), {
        role: roleLabel,
        sites: sitesText,
      });

  return (
    <Shell>
      <CardHeader>
        <CardTitle>{tr("title", "You've been invited")}</CardTitle>
        <CardDescription>{intro}</CardDescription>
      </CardHeader>
      <CardContent>
        {signedInEmail === null ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {fill(
                tr("sign-in-prompt", "Sign in or create an account with {email} to accept."),
                { email: inv.email },
              )}
            </p>
            <Button asChild className="w-full">
              <Link href={`/${locale}/auth/sign-up`}>
                {tr("create-account", "Create account")}
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href={`/${locale}/auth/sign-in`}>{tr("sign-in", "Sign in")}</Link>
            </Button>
            <RememberInvite token={token} />
          </div>
        ) : matches ? (
          <AcceptInviteForm
            token={token}
            locale={locale}
            acceptLabel={tr("accept", "Accept invitation")}
            workingLabel={tr("accepting", "Accepting…")}
            errorLabel={tr("accept-error", "Could not accept the invitation. Please try again.")}
          />
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {fill(
                tr(
                  "mismatch",
                  "This invitation is for {invited}, but you're signed in as {current}.",
                ),
                { invited: inv.email, current: signedInEmail ?? "" },
              )}
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href={`/${locale}/auth/sign-in`}>
                {tr("switch-account", "Sign in with a different account")}
              </Link>
            </Button>
            <RememberInvite token={token} />
          </div>
        )}
      </CardContent>
    </Shell>
  );
}
