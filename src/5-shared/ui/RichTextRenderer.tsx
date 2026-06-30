import DOMPurify from "isomorphic-dompurify";

/** Tags/attrs we allow in tenant rich-text content. Keep this tight. */
const SANITIZE_CONFIG = {
  ALLOWED_TAGS: [
    "p", "br", "strong", "em", "u", "s", "h2", "h3", "h4",
    "ul", "ol", "li", "blockquote", "a", "code", "pre", "hr",
  ],
  ALLOWED_ATTR: ["href", "target", "rel"],
  ALLOW_DATA_ATTR: false,
};

/**
 * Render sanitized rich-text HTML (produced by RichTextEditor) on tenant pages.
 * Server component — sanitization runs server-side. Styled via the `prose`-like
 * utility classes so it inherits the active template's tokens.
 */
export function RichTextRenderer({
  html,
  className = "",
}: {
  html?: string | null;
  className?: string;
}) {
  if (!html || !html.trim()) return null;
  const clean = DOMPurify.sanitize(html, SANITIZE_CONFIG);
  if (!clean.trim()) return null;

  return (
    <div
      className={`rich-text max-w-none leading-relaxed text-foreground [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-3 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-2 [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_li]:mb-1 [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 [&_blockquote]:border-l-4 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground [&_blockquote]:my-4 [&_code]:rounded [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-sm [&_hr]:my-8 [&_hr]:border-border ${className}`}
      style={{ fontFamily: "var(--font-body)" }}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
