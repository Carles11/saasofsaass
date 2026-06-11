import { getPlatformTranslations } from "@/5-shared/lib/db/platform-translations";
import { getLocale } from "next-intl/server";
import { AuthViewClient } from "../_components/AuthViewClient";
import type { Metadata } from 'next'

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
}

export default async function ForgotPasswordPage() {
  const locale = await getLocale();
  const t = await getPlatformTranslations("marketing.auth", locale);
  const title = t["forgot-password.title"] ?? "Reset Password";

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-6 text-foreground">{title}</h1>
        <AuthViewClient pathname="forgot-password" />
      </div>
    </div>
  );
}
