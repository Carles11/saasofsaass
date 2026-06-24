/**
 * FSD PUBLIC API: Tenants Slice
 * This barrel file ensures that external layers only see what is explicitly exported.
 */

export { TenantPage } from "./ui/page";
export { BlogListPage, generateBlogListMetadata } from "./ui/blog/BlogListPage";
export { BlogDetailPage, generateBlogDetailMetadata } from "./ui/blog/BlogDetailPage";
export { PodcastListPage, generatePodcastListMetadata } from "./ui/podcast/PodcastListPage";
export { PodcastDetailPage, generatePodcastDetailMetadata } from "./ui/podcast/PodcastDetailPage";
