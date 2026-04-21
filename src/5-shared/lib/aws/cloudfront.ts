// CloudFront utilities for signed URLs, if needed in the future

const CLOUDFRONT_URL = process.env.AWS_CLOUDFRONT_URL;

export function getCloudFrontUrl(key: string) {
  if (!CLOUDFRONT_URL) throw new Error("CLOUDFRONT_URL not set");
  return `${CLOUDFRONT_URL.replace(/\/$/, "")}/${key}`;
}

// Optionally, add signed URL logic here if you want to support expiring links
// For now, all image access is proxied via /api/image, so this is not used directly
