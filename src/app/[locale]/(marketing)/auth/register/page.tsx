import { getLocale } from "next-intl/server";
import { redirect } from "next/navigation";

export default async function RegisterPage() {
  const locale = await getLocale();
  redirect(`/${locale}/auth/sign-up`);
}
