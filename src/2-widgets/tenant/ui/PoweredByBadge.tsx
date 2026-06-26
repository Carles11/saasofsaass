// Platform branding for tenant sites. Both marks are dofollow links (no
// rel="nofollow") to the marketing site — that's the intended backlink. Rendered
// at the tenant layout level so they're guaranteed regardless of which blocks exist.

interface PoweredByProps {
  href: string;
  /** Localized "Powered by" prefix. */
  label: string;
}

/** Discreet fixed corner pill (Free + Pro). */
export function PoweredByBadge({ href, label }: PoweredByProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      className="fixed bottom-4 right-4 z-40 inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-background/85 px-3 py-1.5 text-[11px] font-medium text-muted-foreground shadow-md backdrop-blur-sm transition-colors hover:text-foreground"
    >
      <span>{label}</span>
      <span className="font-serif text-sm leading-none tracking-wide text-foreground">
        S<em className="italic text-primary">of</em>S
        <em className="italic text-primary">.</em>
      </span>
    </a>
  );
}

/** Larger "Powered by" strip below the page content (Free only). */
export function PoweredByStrip({ href, label }: PoweredByProps) {
  return (
    <div className="border-t border-border/50 py-6 text-center">
      <a
        href={href}
        target="_blank"
        rel="noopener"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        {label}
        <span className="font-serif text-xl leading-none tracking-wide text-foreground">
          SaaS<em className="italic text-primary">of</em>SaaSs
          <em className="italic text-primary">.com</em>
        </span>
      </a>
    </div>
  );
}
