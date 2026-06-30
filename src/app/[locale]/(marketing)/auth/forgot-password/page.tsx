import { getLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { appAuthUrl } from "@/5-shared/lib/auth/auth-urls";
import { redirectIfAuthenticated } from "@/5-shared/lib/auth/auth-guards";
import { AuthViewClient } from "../_components/AuthViewClient";

// Auth pages should never appear in search results.
export const metadata = {
  robots: { index: false, follow: false },
};

export default async function ForgotPasswordPage() {
  const locale = await getLocale();
  const host = (await headers()).get("host") ?? "";
  const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN ?? "app.localhost";

  if (!host.startsWith(appDomain)) {
    redirect(appAuthUrl("sign-in", locale));
  }

  // Already signed in → no reason to recover a password; send to the dashboard.
  await redirectIfAuthenticated(locale);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <AuthViewClient pathname="forgot-password" />
      </div>
    </div>
  );
}
