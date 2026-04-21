export type BlockKind =
  | "navbar"
  | "hero"
  | "blog-feed"
  | "podcast-feed"
  | "awards"
  | "contact"
  | "image-gallery";

// Shared type for image-gallery blocks
export interface GalleryImage {
  s3Key: string;
  meta: { width: number; height: number; [k: string]: any };
  i18n: Record<string, { alt: string; caption: string }>;
}
