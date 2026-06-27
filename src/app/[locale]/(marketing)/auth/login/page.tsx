import { getLocale } from "next-intl/server";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const locale = await getLocale();
  redirect(`/${locale}/auth/sign-in`);
}
