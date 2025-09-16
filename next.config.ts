// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },

  images: {
    // ✅ sharp 経由の最適化を停止（クラッシュ回避 & 開発安定）
    unoptimized: true,

    // ✅ 外部画像ドメイン
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co", pathname: "/**" },
      { protocol: "https", hostname: "lh3.googleusercontent.com", pathname: "/**" },
      { protocol: "https", hostname: "pbs.twimg.com", pathname: "/**" },

      // ▼ 追加：note の画像ドメイン
      { protocol: "https", hostname: "assets.st-note.com", pathname: "/**" },
      { protocol: "https", hostname: "d2l930y2yx77uc.cloudfront.net", pathname: "/**" },
    ],

    formats: ["image/webp"],
  },
};

export default nextConfig;