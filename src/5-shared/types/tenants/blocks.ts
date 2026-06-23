export type BlockKind =
  | "hero"
  | "blog-feed"
  | "podcast-feed"
  | "awards"
  | "contact"
  | "image-gallery"
  | "text-content"
  | "cta-banner"
  | "map"
  | "footer";

// Shared type for image-gallery blocks
export interface GalleryImage {
  s3Key: string;
  url: string;
  meta: { width: number; height: number; [k: string]: any };
  i18n: Record<string, { alt: string; caption: string }>;
}
