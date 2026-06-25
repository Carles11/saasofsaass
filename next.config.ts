import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/5-shared/lib/i18n/request.ts");

const nextConfig: NextConfig = {
  reactStrictMode: false,
  allowedDevOrigins: ["agora.localhost", "*.localhost", "*.lvh.me", "lvh.me"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "dxkr25c81be58.cloudfront.net",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
