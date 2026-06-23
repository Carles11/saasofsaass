import * as React from "react";
import { AwardsBlock } from "../blocks/AwardsBlock/ui/AwardsBlock";
import { BlogFeedBlock } from "../blocks/BlogFeedBlock/ui/BlogFeedBlock";
import { ContactBlock } from "../blocks/ContactBlock/ui/ContactBlock";
import { HeroBlock } from "../blocks/HeroBlock/ui/HeroBlock";
import { ImageGalleryBlock } from "../blocks/ImageGallery";
import { PodcastFeedBlock } from "../blocks/PodcastFeedBlock/ui/PodcastFeedBlock";
import { CtaBannerBlock } from "../blocks/CtaBannerBlock/ui/CtaBannerBlock";
import { TextContentBlock } from "../blocks/TextContentBlock/ui/TextContentBlock";
import { MapBlock } from "../blocks/MapBlock/ui/MapBlock";
import { FooterBlock } from "../blocks/FooterBlock/ui/FooterBlock";
import { TestimonialsBlock } from "../blocks/TestimonialsBlock/ui/TestimonialsBlock";
import type { BlockComponent, BlockProps, BlockRegistry } from "./types";

const adaptImageGalleryBlock: BlockComponent = function AdaptImageGalleryBlock(props: BlockProps) {
  return React.createElement(ImageGalleryBlock, {
    images: (props.config.images ?? []) as import("@/5-shared/types/tenants/blocks").GalleryImage[],
    lang: (props.config.lang as string) ?? props.locale,
    galleryName: props.config.galleryName as string | undefined,
    blockId: props.block.id,
  });
};

export const blockRegistry: BlockRegistry = {
  hero: {
    component: HeroBlock,
    includeInNav: false,
    defaultConfig: { layout: "centered", ctaUrl: "/", heroImage: null },
    fields: [
      { key: "title", label: "Title", inputType: "input" },
      { key: "subtitle", label: "Subtitle", inputType: "textarea" },
      { key: "ctaLabel", label: "CTA Button Label", inputType: "input" },
      { key: "heroImage", label: "Hero Image", inputType: "image" },
    ],
  },
  "blog-feed": {
    component: BlogFeedBlock,
    includeInNav: true,
    navLabel: "Blog",
    defaultConfig: { maxItems: 9 },
    fields: [], // collection blocks — managed via CollectionManager tab
  },
  "podcast-feed": {
    component: PodcastFeedBlock,
    includeInNav: true,
    navLabel: "Podcast",
    defaultConfig: { maxItems: 9 },
    fields: [], // collection blocks — managed via CollectionManager tab
  },
  awards: {
    component: AwardsBlock,
    includeInNav: true,
    navLabel: "Awards",
    defaultConfig: {},
    fields: [],
  },
  contact: {
    component: ContactBlock,
    includeInNav: true,
    navLabel: "Contact",
    defaultConfig: { email: "", phone: "", address: "" },
    fields: [
      { key: "title", label: "Title", inputType: "input" },
      { key: "description", label: "Description", inputType: "textarea" },
    ],
  },
  "cta-banner": {
    component: CtaBannerBlock,
    includeInNav: false,
    defaultConfig: { ctaUrl: "/" },
    fields: [
      { key: "heading", label: "Heading", inputType: "input" },
      { key: "subtitle", label: "Subtitle", inputType: "textarea" },
      { key: "ctaLabel", label: "CTA Button Label", inputType: "input" },
    ],
  },
  "text-content": {
    component: TextContentBlock,
    includeInNav: true,
    defaultConfig: {},
    fields: [
      { key: "heading", label: "Heading", inputType: "input" },
      { key: "body", label: "Body", inputType: "textarea" },
    ],
  },
  "image-gallery": {
    component: adaptImageGalleryBlock,
    includeInNav: false,
    defaultConfig: {
      images: [], // Will be managed via a gallery manager/editor
      lang: "en",
    },
    fields: [
      { key: "images", label: "Images", inputType: "input" }, // Placeholder, real editing via gallery UI
      { key: "lang", label: "Language", inputType: "input" },
    ],
  },
  map: {
    component: MapBlock,
    includeInNav: true,
    navLabel: "Location",
    defaultConfig: {},
    fields: [],
  },
  footer: {
    component: FooterBlock,
    includeInNav: false,
    defaultConfig: { showPoweredBy: true, socialLinks: [], email: "", phone: "" },
    fields: [],
  },
  testimonials: {
    component: TestimonialsBlock,
    includeInNav: true,
    navLabel: "Testimonials",
    defaultConfig: { maxItems: 12 },
    fields: [
      { key: "heading", label: "Section Heading", inputType: "input" },
      { key: "emptyState", label: "Empty State Text", inputType: "input" },
    ],
  },
};
