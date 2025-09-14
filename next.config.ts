// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ✅ Vercel/本番ビルド時に ESLint エラーで落とさない
  eslint: {
    ignoreDuringBuilds: true,
  },

  images: {
    // ✅ sharp 経由の最適化を停止（クラッシュ回避 & 開発安定）
    unoptimized: true,

    // ✅ 外部画像ドメインは remotePatterns に寄せる
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co", pathname: "/**" },
      { protocol: "https", hostname: "lh3.googleusercontent.com", pathname: "/**" },
      { protocol: "https", hostname: "pbs.twimg.com", pathname: "/**" },
    ],

    // 任意：AVIFを外し WebP のみに
    formats: ["image/webp"],
  },
};

export default nextConfig;