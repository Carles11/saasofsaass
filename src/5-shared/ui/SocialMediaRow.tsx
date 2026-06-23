function detectNetwork(url: string): "facebook" | "x" | "linkedin" | "tiktok" | "custom" {
  const host = url.replace(/^https?:\/\//, "").replace(/^www\./, "").toLowerCase();
  if (host.startsWith("facebook") || host.includes("facebook")) return "facebook";
  if (host.startsWith("x.com") || host.startsWith("twitter")) return "x";
  if (host.startsWith("linkedin") || host.includes("linkedin")) return "linkedin";
  if (host.startsWith("tiktok") || host.includes("tiktok")) return "tiktok";
  return "custom";
}

const ICONS: Record<string, React.ReactNode> = {
  facebook: (
    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M17 2.5h-2.5A4.5 4.5 0 0 0 10 7v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1H17V2.5Z" />
    </svg>
  ),
  x: (
    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 3l18 18M21 3L3 21" />
    </svg>
  ),
  linkedin: (
    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="2" />
      <path d="M7 10v7M7 7v.01M12 17v-4a2 2 0 0 1 4 0v4" />
    </svg>
  ),
  tiktok: (
    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 17a4 4 0 1 1 0-8v8Zm0 0V7m6 0v10a4 4 0 1 0 4-4" />
    </svg>
  ),
  custom: (
    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="5" />
      <path d="M12 1v4M12 19v4M1 12h4M19 12h4" />
    </svg>
  ),
};

interface SocialMediaRowProps {
  links: Array<{ label: string; url: string }>;
}

export function SocialMediaRow({ links }: SocialMediaRowProps) {
  if (links.length === 0) return null;

  return (
    <nav aria-label="Social profiles" className="flex flex-wrap gap-4 items-center">
      {links.map((link, i) => {
        const network = detectNetwork(link.url);
        return (
          <a
            key={i}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={link.label || network}
            title={link.label || network}
            className="hover:opacity-80 focus-visible:ring-2 rounded-full p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {ICONS[network]}
          </a>
        );
      })}
    </nav>
  );
}
