import { TenantPage } from "@/1-pages/tenants";
import { getTenantByDomain } from "@/4-entities/tenant";
import { getServerParams, Params, SearchParams } from "@/5-shared/lib/next/params.server";
import { getLocale } from "next-intl/server";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string }>;
}): Promise<Metadata> {
  const { domain } = await params;
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "saasofsaass.com";
  const isSubdomain =
    (domain.endsWith(`.${rootDomain}`) && domain !== rootDomain) ||
    /^[a-z0-9][a-z0-9-]*\.localhost$/.test(domain);
  const tenantKey = isSubdomain ? domain.split(".")[0] : domain;
  const locale = await getLocale();

  const tenant = await getTenantByDomain({
    tenant: tenantKey,
    domain,
    isSubdomain,
  });

  const baseUrl = `https://${domain}`;

  if (!tenant) {
    return {
      title: "Site Not Found",
      robots: { index: false, follow: false },
    };
  }

  const heroTranslations = (tenant.branding as Record<string, unknown>) ?? {};
  const description =
    typeof heroTranslations.description === "string"
      ? heroTranslations.description
      : `${tenant.name} — Professional website`;

  return {
    title: {
      default: tenant.name,
      template: `%s | ${tenant.name}`,
    },
    description,
    alternates: {
      canonical: `${baseUrl}/${locale}`,
      languages: {
        ...Object.fromEntries(
          (tenant.locales ?? ["en"]).map((l: string) => [l, `${baseUrl}/${l}`])
        ),
        'x-default': `${baseUrl}/${(tenant.defaultLocale as string) ?? 'en'}`,
      },
    },
    openGraph: {
      title: tenant.name,
      description,
      url: `${baseUrl}/${locale}`,
      siteName: tenant.name,
      locale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: tenant.name,
      description,
    },
    robots: {
      index: tenant.seoEnabled !== false,
      follow: tenant.seoEnabled !== false,
    },
  };
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Params;
  searchParams?: SearchParams;
}) {
  const context = await getServerParams(params, searchParams);
  return <TenantPage context={context} />;
}
