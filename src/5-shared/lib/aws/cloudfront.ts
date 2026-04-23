// CloudFront utilities for signed URLs, if needed in the future

const CLOUDFRONT_URL = process.env.NEXT_PUBLIC_AWS_CLOUDFRONT_URL;

export function getCloudFrontUrl(key: string) {
  if (!CLOUDFRONT_URL) throw new Error("CLOUDFRONT_URL not set");
  return `${CLOUDFRONT_URL.replace(/\/$/, "")}/${key}`;
}
