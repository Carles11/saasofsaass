import { getLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { appAuthUrl } from "@/5-shared/lib/auth/auth-urls";
import { AuthViewClient } from "../_components/AuthViewClient";

export default async function SignInPage() {
  const locale = await getLocale();
  const host = (await headers()).get("host") ?? "";
  const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN ?? "app.localhost";

  if (!host.startsWith(appDomain)) {
    redirect(appAuthUrl("sign-in", locale));
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <AuthViewClient pathname="sign-in" />
      </div>
    </div>
  );
}
