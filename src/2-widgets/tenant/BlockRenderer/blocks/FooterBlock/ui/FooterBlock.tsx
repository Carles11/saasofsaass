import type { LucideIcon } from "lucide-react";
import {
  Briefcase,
  Camera,
  Code2,
  Globe,
  ImageIcon,
  MessageCircle,
  Music,
  Video,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { BlockProps } from "../../../config/types";

const SOCIAL_ICON_MAP: Record<string, LucideIcon> = {
  facebook: MessageCircle,
  fb: MessageCircle,
  twitter: MessageCircle,
  x: MessageCircle,
  instagram: Camera,
  linkedin: Briefcase,
  youtube: Video,
  tiktok: Music,
  github: Code2,
  gitlab: Code2,
  pinterest: ImageIcon,
  snapchat: Camera,
  threads: MessageCircle,
};

function detectSocialIcon(url: string): LucideIcon {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "").toLowerCase();
    for (const [key, icon] of Object.entries(SOCIAL_ICON_MAP)) {
      if (host.includes(key) || host.startsWith(key)) return icon;
    }
  } catch {
    // fall through
  }
  return Globe;
}

function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://"))
    return trimmed;
  return `https://${trimmed}`;
}

export function FooterBlock({ t, config, blockId, tenant }: BlockProps) {
  const rawSocialLinks =
    (config.socialLinks as Array<{ label: string; url: string }>) ?? [];
  const socialLinks = rawSocialLinks.map((l) => ({
    ...l,
    url: normalizeUrl(l.url),
  }));
  const showPoweredBy = (config.showPoweredBy as boolean) ?? true;
  const description = t.description;
  const copyright =
    t.copyright || `${tenant.name} © ${new Date().getFullYear()}`;
  const email = (config.email as string) ?? "";
  const phone = (config.phone as string) ?? "";

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
    <footer id={blockId} className="border-t border-border py-16 px-6">
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
              <Image
                src={tenantLogoUrl}
                alt={`${tenant.name} logo`}
                width={160}
                height={60}
                className="max-h-12 w-auto"
                unoptimized
              />
            ) : (
              <Image
                src="/logos/saasofsaass-official-logo.webp"
                alt="SoSS"
                width={32}
                height={32}
                className="h-8 w-auto"
                unoptimized
              />
            )}
            <span className="text-sm font-semibold text-foreground">
              {tenant.name}
            </span>
          </a>
          {description && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>
          )}
          <p className="text-xs text-muted-foreground">{copyright}</p>
          {showPoweredBy && (
            <a
              href={homeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors mt-2"
            >
              <Image
                src="/logos/saasofsaass-short-logo.webp"
                alt="SoSS"
                width={250}
                height={250}
                className="h-11 w-auto"
                unoptimized
              />
              Powered by SofS
            </a>
          )}
        </div>

        {/* ── Center column: Contact + Legal ──────────────────────────── */}
        <div className="flex flex-col items-start gap-4">
          <h3 className="text-sm font-semibold text-foreground">Contact</h3>
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
            <p className="text-sm text-muted-foreground italic">Coming soon</p>
          )}

          <div className="mt-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Legal
            </h4>
            <div className="flex flex-col gap-1.5">
              <Link
                href="/legal/terms-of-service"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href="/legal/privacy-policy"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>

        {/* ── Right column: Social links ──────────────────────────────── */}
        <div className="flex flex-col items-start gap-4">
          <h3 className="text-sm font-semibold text-foreground">Social</h3>
          {socialLinks.length === 0 && (
            <p className="text-sm text-muted-foreground italic">No links yet</p>
          )}
          <div className="flex flex-col gap-3">
            {socialLinks.map((link, i) => {
              const Icon = detectSocialIcon(link.url);
              return (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors group"
                >
                  <span className="p-2 rounded-full bg-muted group-hover:bg-primary/10 transition-colors">
                    <Icon className="h-4 w-4" />
                  </span>
                  {link.label || link.url}
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}
