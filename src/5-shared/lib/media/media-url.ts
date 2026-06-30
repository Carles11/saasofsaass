/**
 * Parse a media URL (podcast/video) into an embeddable form + thumbnail.
 * Supports YouTube and Vimeo embeds, direct audio files, and a generic
 * external fallback.
 */
export type MediaKind = "youtube" | "vimeo" | "audio" | "external";

export interface ParsedMedia {
  kind: MediaKind;
  /** iframe src for video embeds. */
  embedUrl?: string;
  /** poster/thumbnail image when derivable (YouTube only, reliably). */
  thumbnailUrl?: string;
  /** original url (for audio <source> / external link). */
  url: string;
}

export function parseMediaUrl(raw?: string | null): ParsedMedia | null {
  if (!raw) return null;
  const url = raw.trim();
  if (!url) return null;

  // YouTube: watch?v=, youtu.be/, /embed/, /shorts/
  const yt = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/,
  );
  if (yt) {
    const id = yt[1];
    return {
      kind: "youtube",
      embedUrl: `https://www.youtube.com/embed/${id}`,
      thumbnailUrl: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
      url,
    };
  }

  // Vimeo: vimeo.com/{id}
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vm) {
    return { kind: "vimeo", embedUrl: `https://player.vimeo.com/video/${vm[1]}`, url };
  }

  // Direct audio file
  if (/\.(mp3|wav|ogg|m4a|aac)(\?.*)?$/i.test(url)) {
    return { kind: "audio", url };
  }

  return { kind: "external", url };
}

/** Convenience: best preview image for a podcast item (explicit cover wins). */
export function podcastPreviewImage(
  coverImageUrl?: string | null,
  mediaUrl?: string | null,
): string | null {
  if (coverImageUrl) return coverImageUrl;
  return parseMediaUrl(mediaUrl)?.thumbnailUrl ?? null;
}
