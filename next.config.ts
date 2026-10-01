import type { NextConfig } from "next";
import { imageRemotePatterns } from "./lib/image-assets";

// Next loads config in multiple build processes; all inherit the same timestamp.
const buildTime = process.env.NEXT_PUBLIC_BLOG_BUILD_TIME ?? new Date().toISOString();
process.env.NEXT_PUBLIC_BLOG_BUILD_TIME = buildTime;

const nextConfig: NextConfig = {
  poweredByHeader: false,
  devIndicators: false,
  turbopack: { root: process.cwd() },
  // Inlined into the build; page refreshes and server restarts do not reset it.
  env: { NEXT_PUBLIC_BLOG_BUILD_TIME: buildTime },
  images: {
    // Keep browser image URLs on OSS, including “Copy image address”.
    unoptimized: true,
    remotePatterns: imageRemotePatterns(),
    maximumRedirects: 0,
  },
};

export default nextConfig;
