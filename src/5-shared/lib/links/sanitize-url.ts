export function sanitizeCtaUrl(url?: string): string | undefined {
  if (!url) return undefined;
  const isSafe =
    url.startsWith("/") ||
    url.startsWith("www.") ||
    url.startsWith("https://") ||
    url.startsWith("http://");
  return isSafe ? url : undefined;
}
