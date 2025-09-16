import { NextResponse } from "next/server";
import Parser from "rss-parser";

type NoteItem = {
  id: string;
  title: string;
  link: string;
  pubDate: string;
  contentSnippet: string;
  enclosure?: { url: string };
  "media:thumbnail"?: { $: { url: string } };
};

export async function GET() {
  const feedUrl = process.env.NOTE_FEED_URL;
  if (!feedUrl) {
    return NextResponse.json({ error: "NOTE_FEED_URL not set" }, { status: 500 });
  }

  try {
    const parser = new Parser<{}, NoteItem>();
    const feed = await parser.parseURL(feedUrl);

    const posts = feed.items.slice(0, 3).map((item, i) => {
      let coverUrl: string | null = null;

      // enclosure に画像がある場合
      if (item.enclosure?.url) {
        coverUrl = item.enclosure.url;
      }

      // media:thumbnail がある場合
      if (!coverUrl && item["media:thumbnail"]?.$?.url) {
        coverUrl = item["media:thumbnail"].$.url;
      }

      return {
        id: item.id || item.link || `post-${i}`,
        title: item.title,
        url: item.link,
        date: item.pubDate,
        coverUrl,
        excerpt: item.contentSnippet,
        tags: [],
      };
    });

    return NextResponse.json(posts);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}