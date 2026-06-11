import * as React from "react";
import { AwardsBlock } from "../blocks/AwardsBlock/ui/AwardsBlock";
import { BlogFeedBlock } from "../blocks/BlogFeedBlock/ui/BlogFeedBlock";
import { ContactBlock } from "../blocks/ContactBlock/ui/ContactBlock";
import { HeroBlock } from "../blocks/HeroBlock/ui/HeroBlock";
import { ImageGalleryBlock } from "../blocks/ImageGallery";
import { NavbarBlock } from "../blocks/NavbarBlock/ui/NavbarBlock";
import { PodcastFeedBlock } from "../blocks/PodcastFeedBlock/ui/PodcastFeedBlock";
import type { BlockComponent, BlockProps, BlockRegistry } from "./types";

const adaptImageGalleryBlock: BlockComponent = function AdaptImageGalleryBlock(props: BlockProps) {
  return React.createElement(ImageGalleryBlock, {
    images: props.config.images ?? [],
    lang: props.config.lang ?? props.locale,
  });
};

export const blockRegistry: BlockRegistry = {
  navbar: {
    component: NavbarBlock,
    defaultConfig: { links: [] },
    fields: [{ key: "siteTitle", label: "Site Title", inputType: "input" }],
  },
  hero: {
    component: HeroBlock,
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
    defaultConfig: { maxItems: 9 },
    fields: [], // collection blocks — managed via CollectionManager tab
  },
  "podcast-feed": {
    component: PodcastFeedBlock,
    defaultConfig: { maxItems: 9 },
    fields: [], // collection blocks — managed via CollectionManager tab
  },
  awards: {
    component: AwardsBlock,
    defaultConfig: {},
    fields: [],
  },
  contact: {
    component: ContactBlock,
    defaultConfig: { email: "", phone: "", address: "" },
    fields: [
      { key: "title", label: "Title", inputType: "input" },
      { key: "description", label: "Description", inputType: "textarea" },
    ],
  },
  "image-gallery": {
    component: adaptImageGalleryBlock,
    defaultConfig: {
      images: [], // Will be managed via a gallery manager/editor
      lang: "en",
    },
    fields: [
      { key: "images", label: "Images", inputType: "input" }, // Placeholder, real editing via gallery UI
      { key: "lang", label: "Language", inputType: "input" },
    ],
  },
};
