import { SiteUnavailablePage } from "@/1-pages/site-status";
import { getLocale } from "next-intl/server";
import type { Metadata } from "next";

// Status pages must never be indexed.
export const metadata: Metadata = {
  title: "Site unavailable",
  robots: { index: false, follow: false },
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string; slug?: string }>;
}) {
  const { reason, slug } = await searchParams;
  const locale = await getLocale();
  const resolvedReason = reason === "draft" ? "draft" : "missing";

  return (
    <SiteUnavailablePage
      reason={resolvedReason}
      slug={slug ?? ""}
      locale={locale}
    />
  );
}
