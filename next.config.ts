// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // 念のため domains も明示
    domains: ["placehold.co"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
        pathname: "/**",
      },
    ],
    // AVIF 変換が 500 の原因になることがあるので一旦 WebP のみに
    formats: ["image/webp"],
  },
};

export default nextConfig;