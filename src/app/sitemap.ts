import type { MetadataRoute } from "next";
import { getAllListings } from "@/lib/mock-listings";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://linkle-steel.vercel.app";
  const now = new Date();

  // 固定ページ
  const entries: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${base}/listings/new`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
  ];

  // 募集詳細（モックから生成）
  try {
    const all = getAllListings();
    for (const l of all) {
      entries.push({
        url: `${base}/listings/${l.id}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  } catch {
    // 失敗しても固定ページだけ出せばOK
  }

  return entries;
}