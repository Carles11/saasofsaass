/**
 * Client-safe block metadata catalog — single source of truth.
 * NEVER import block components here. Only types + lucide icons.
 */
import type { LucideIcon } from "lucide-react";
import {
  ArrowRightCircle,
  Copyright,
  FileText,
  Images,
  Mail,
  MapPin,
  Mic2,
  Newspaper,
  Sparkles,
  Star,
  Trophy,
} from "lucide-react";
import type { BlockKind } from "@/5-shared/types/tenants/blocks";

export type BlockCategory = "structure" | "content" | "media" | "interactive";

export type FieldDef = {
  key: string;
  label: string;
  inputType: "input" | "textarea" | "image";
  placeholder?: string;
};

export interface BlockMeta {
  icon: LucideIcon;
  category: BlockCategory;
  includeInNav: boolean;
  navLabel?: string;
  archivePath?: string;
  defaultConfig: Record<string, unknown>;
  fields: FieldDef[];
  name: string;
  description: string;
}

export const BLOCK_CATALOG: Record<BlockKind, BlockMeta> = {
  hero: {
    icon: Sparkles,
    category: "structure",
    includeInNav: false,
    defaultConfig: { layout: "centered", ctaUrl: "/", heroImage: null },
    fields: [
      { key: "title", label: "Title", inputType: "input" },
      { key: "subtitle", label: "Subtitle", inputType: "textarea" },
      { key: "ctaLabel", label: "CTA Button Label", inputType: "input" },
      { key: "heroImage", label: "Hero Image", inputType: "image" },
    ],
    name: "Hero Section",
    description: "Headline, subtitle, and primary call-to-action",
  },
  "blog-feed": {
    icon: Newspaper,
    category: "content",
    includeInNav: true,
    navLabel: "Blog",
    archivePath: "/blog",
    defaultConfig: { maxItems: 9, archivePath: "/blog" },
    fields: [],
    name: "Blog Feed",
    description: "Blog posts displayed in a grid layout",
  },
  "podcast-feed": {
    icon: Mic2,
    category: "content",
    includeInNav: true,
    navLabel: "Podcast",
    archivePath: "/podcast",
    defaultConfig: { maxItems: 9, archivePath: "/podcast" },
    fields: [],
    name: "Podcast Feed",
    description: "Podcast episodes with cover art and descriptions",
  },
  awards: {
    icon: Trophy,
    category: "content",
    includeInNav: true,
    navLabel: "Awards",
    defaultConfig: {},
    fields: [],
    name: "Awards",
    description: "Awards, certifications, or recognitions",
  },
  contact: {
    icon: Mail,
    category: "interactive",
    includeInNav: true,
    navLabel: "Contact",
    defaultConfig: { email: "", phone: "", address: "" },
    fields: [
      { key: "title", label: "Title", inputType: "input" },
      { key: "description", label: "Description", inputType: "textarea" },
    ],
    name: "Contact Section",
    description: "Email, phone, address, and optional contact form",
  },
  "cta-banner": {
    icon: ArrowRightCircle,
    category: "interactive",
    includeInNav: false,
    defaultConfig: { ctaUrl: "/" },
    fields: [
      { key: "heading", label: "Heading", inputType: "input" },
      { key: "subtitle", label: "Subtitle", inputType: "textarea" },
      { key: "ctaLabel", label: "CTA Button Label", inputType: "input" },
    ],
    name: "CTA Banner",
    description: "Call-to-action with heading, text, and button",
  },
  "text-content": {
    icon: FileText,
    category: "content",
    includeInNav: true,
    defaultConfig: {},
    fields: [
      { key: "heading", label: "Heading", inputType: "input" },
      { key: "body", label: "Body", inputType: "textarea" },
    ],
    name: "Text Content",
    description: "Freeform prose — about us, policies, or text-only",
  },
  "image-gallery": {
    icon: Images,
    category: "media",
    includeInNav: false,
    defaultConfig: { images: [], lang: "en" },
    fields: [
      { key: "images", label: "Images", inputType: "input" },
      { key: "lang", label: "Language", inputType: "input" },
    ],
    name: "Image Gallery",
    description: "Visual image gallery with lightbox viewing",
  },
  map: {
    icon: MapPin,
    category: "interactive",
    includeInNav: true,
    navLabel: "Location",
    defaultConfig: {},
    fields: [
      { key: "heading", label: "Heading", inputType: "input" },
      { key: "address", label: "Address / Location", inputType: "textarea" },
    ],
    name: "Location",
    description: "Map with address and embedded Google Maps view",
  },
  footer: {
    icon: Copyright,
    category: "structure",
    includeInNav: false,
    defaultConfig: { showPoweredBy: true, socialLinks: [], email: "", phone: "" },
    fields: [
      { key: "description", label: "Slogan", inputType: "textarea", placeholder: "A short tagline describing what your site is about" },
    ],
    name: "Footer",
    description: "Copyright, social links, and powered-by branding",
  },
  testimonials: {
    icon: Star,
    category: "content",
    includeInNav: true,
    navLabel: "Testimonials",
    defaultConfig: { maxItems: 12 },
    fields: [
      { key: "heading", label: "Section Heading", inputType: "input" },
      { key: "emptyState", label: "Empty State Text", inputType: "input" },
    ],
    name: "Testimonials",
    description: "Customer/client testimonials with quotes, ratings, and author info",
  },
};

export const BLOCK_ORDER: BlockKind[] = [
  "hero",
  "blog-feed",
  "podcast-feed",
  "awards",
  "testimonials",
  "contact",
  "cta-banner",
  "text-content",
  "image-gallery",
  "map",
  "footer",
];
