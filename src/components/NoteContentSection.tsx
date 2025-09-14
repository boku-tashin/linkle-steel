// src/components/NoteContentSection.tsx
import React from "react";
import Image from "next/image";

export type NoteItem = {
  title: string;
  excerpt?: string;
  coverImage?: string;
  href: string;            // note記事URL
  tag?: string;            // 任意: タグ/カテゴリ
  date?: string;           // 任意: 表示用の日付文字列
};

export default function NoteContentSection({
  heading = "読みもの",
  subtitle = "イベントの裏側やヒントを、noteで公開しています。",
  profileUrl,              // noteのプロフィール/マガジンURL
  items = [],
}: {
  heading?: string;
  subtitle?: string;
  profileUrl: string;
  items: NoteItem[];
}) {
  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 my-10">
      <div className="flex items-end justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{heading}</h2>
          {subtitle ? (
            <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
          ) : null}
        </div>
        {profileUrl && (
          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm text-blue-700 hover:text-white hover:bg-blue-700 border border-blue-200 shadow-sm transition-colors"
          >
            noteでもっと見る
            <svg width="16" height="16" viewBox="0 0 24 24" className="opacity-90">
              <path d="M14 3h7v7h-2V6.41l-9.29 9.3-1.42-1.42 9.3-9.29H14V3z" fill="currentColor"/>
            </svg>
          </a>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((it, idx) => (
          <a
            key={idx}
            href={it.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden border border-gray-100"
          >
            <div className="relative aspect-[16/9] bg-gray-100">
              {it.coverImage ? (
                <Image
                  src={it.coverImage}
                  alt={it.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  unoptimized
                />
              ) : (
                <div className="absolute inset-0 grid place-items-center text-gray-400 text-sm">
                  NO IMAGE
                </div>
              )}
              {/* noteロゴ風ピル（簡易） */}
              <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[11px] bg-emerald-50 text-emerald-700 shadow">
                note
              </span>
            </div>

            <div className="p-3 space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                {it.tag && <span className="px-2 py-0.5 rounded-full bg-gray-50">{it.tag}</span>}
                {it.date && <span>{it.date}</span>}
              </div>
              <h3 className="text-sm font-semibold leading-snug text-gray-900 line-clamp-2 group-hover:text-blue-700">
                {it.title}
              </h3>
              {it.excerpt && (
                <p className="text-sm text-gray-600 line-clamp-2">{it.excerpt}</p>
              )}
            </div>

            <div className="px-3 pb-3">
              <span className="inline-flex items-center gap-1 text-xs text-blue-700 group-hover:gap-1.5 transition-all">
                記事を読む
                <svg width="14" height="14" viewBox="0 0 24 24">
                  <path d="M14 3h7v7h-2V6.41l-9.29 9.3-1.42-1.42 9.3-9.29H14V3z" fill="currentColor"/>
                </svg>
              </span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}