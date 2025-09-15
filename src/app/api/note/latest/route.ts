// src/app/api/note/latest/route.ts
import type { NextRequest } from "next/server";

const NOTE_USERNAME = process.env.NOTE_USERNAME || "your_note_id"; // ← あなたのnote ID
const NOTE_FEED = `https://note.com/${NOTE_USERNAME}/rss`;

export const revalidate = 60 * 10; // 10分キャッシュ（ISR）

export async function GET(_req: NextRequest) {
  try {
    // RSSを取得（サーバー側）
    const res = await fetch(NOTE_FEED, { next: { revalidate } });
    if (!res.ok) throw new Error(`RSS fetch failed: ${res.status}`);
    const xml = await res.text();

    // 超簡易パース（必要なところだけ）
    const items = Array.from(xml.matchAll(/<item>([\s\S]*?)<\/item>/g)).slice(0, 6);
    const posts = items.map((m) => {
      const block = m[1];
      const get = (tag: string) =>
        (block.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`))?.[1] || "")
          .replace(/<!\[CDATA\[|\]\]>/g, "")
          .trim();

      const link = get("link");
      const title = get("title");
      const pubDate = get("pubDate"); // e.g. Tue, 10 Sep 2024 12:34:56 +0900
      const iso = pubDate ? new Date(pubDate).toISOString().slice(0, 10) : "";

      // サムネっぽいURLをdescription内から拾う（無ければnull）
      const desc = get("description");
      const img = desc.match(/https?:\/\/[^"' ]+\.(?:png|jpe?g|gif|webp)/i)?.[0] ?? null;

      return {
        id: link || title,
        title,
        url: link,
        date: iso,          // ページ側で new Date(...).toLocaleDateString できます
        coverUrl: img,      // CardThumb が NO IMAGE フォールバックします
        excerpt: "",        // 必要なら description から整形して入れてもOK
        tags: [],           // note RSSにタグが無ければ空で
      };
    });

    return Response.json(posts);
  } catch (e: any) {
    // 落ちたら空配列返却（ページ側はモックにフォールバック）
    return Response.json([], { status: 200 });
  }
}