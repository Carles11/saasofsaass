import { SocialMediaRow } from "@/5-shared/ui/SocialMediaRow";
import { getPlatformTranslations, resolveTranslation } from "@/5-shared/lib/db/platform-translations";
import Image from "next/image";
import type { BlockProps } from "../../../config/types";

function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://"))
    return trimmed;
  return `https://${trimmed}`;
}

export async function FooterBlock({ t, config, blockId, tenant, locale }: BlockProps) {
  const rawSocialLinks =
    (config.socialLinks as Array<{ label: string; url: string }>) ?? [];
  const socialLinks = rawSocialLinks.map((l) => ({
    ...l,
    url: normalizeUrl(l.url),
  }));
  const description = t.description;
  const copyright = `${tenant.name} © ${new Date().getFullYear()}`;
  const email = (config.email as string) ?? "";
  const phone = (config.phone as string) ?? "";

  const blocksT = await getPlatformTranslations("tenant.blocks", locale);
  const contactLabel = resolveTranslation(blocksT, "footer.contact", "Contact");
  const socialLabel = resolveTranslation(blocksT, "footer.social", "Social");
  const comingSoonLabel = resolveTranslation(blocksT, "footer.coming-soon", "Coming soon");
  const noLinksYetLabel = resolveTranslation(blocksT, "footer.no-links-yet", "No links yet");

  const branding = (tenant.branding ?? {}) as Record<string, unknown>;
  const logoData = branding.logo as
    | { url?: string; s3Key?: string; linkUrl?: string }
    | undefined;
  const tenantLogoUrl = logoData?.url ?? null;
  const tenantLogoLinkUrl = logoData?.linkUrl ?? null;

  const homeUrl =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN || "saasofsaass.com"}`;
  const logoLinkHref = tenantLogoLinkUrl || homeUrl;

  return (
    <footer id={blockId} className="border-t border-border bg-secondary/20 py-16 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* ── Left column: Brand ───────────────────────────────────────── */}
        <div className="flex flex-col items-start gap-4">
          <a
            href={logoLinkHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2"
          >
            {tenantLogoUrl ? (
              <>
                <Image
                  src={tenantLogoUrl}
                  alt={`${tenant.name} logo`}
                  width={160}
                  height={60}
                  className="max-h-12 w-auto"
                  unoptimized
                />
                <span className="text-sm font-semibold text-foreground">
                  {tenant.name}
                </span>
              </>
            ) : (
              <span className="text-sm font-semibold text-foreground">
                {tenant.name}
              </span>
            )}
          </a>
          {description && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>
          )}
          <p className="text-xs text-muted-foreground">{copyright}</p>
        </div>

        {/* ── Center column: Contact ──────────────────────────────────── */}
        <div className="flex flex-col items-start gap-4">
          <h3 className="text-sm font-semibold text-foreground">{contactLabel}</h3>
          {email && (
            <a
              href={`mailto:${email}`}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {email}
            </a>
          )}
          {phone && (
            <a
              href={`tel:${phone}`}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {phone}
            </a>
          )}
          {!email && !phone && (
            <p className="text-sm text-muted-foreground italic">{comingSoonLabel}</p>
          )}
        </div>

        {/* ── Right column: Social links ──────────────────────────────── */}
        <div className="flex flex-col items-start gap-4">
          <h3 className="text-sm font-semibold text-foreground">{socialLabel}</h3>
          {socialLinks.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">{noLinksYetLabel}</p>
          ) : (
            <SocialMediaRow links={socialLinks} />
          )}
        </div>
      </div>
    </footer>
  );
}
