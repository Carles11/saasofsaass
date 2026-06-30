export type BlockKind =
  | "hero"
  | "blog-feed"
  | "podcast-feed"
  | "awards"
  | "contact"
  | "image-gallery"
  | "text-content"
  | "rich-content"
  | "cta-banner"
  | "cta-banner-image"
  | "map"
  | "footer"
  | "testimonials"
  | "donations"
  | "sponsors";

// Shared type for image-gallery blocks
export interface GalleryImage {
  s3Key: string;
  url: string;
  meta: { width: number; height: number; [k: string]: any };
  i18n: Record<string, { alt: string; caption: string }>;
}
