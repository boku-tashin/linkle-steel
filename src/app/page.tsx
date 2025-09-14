// src/app/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import Image from "next/image";
import React, { useMemo, useState } from "react";
import Link from "next/link";
import AuthModal from "@/components/AuthModal";
import { getAllListings, type Listing } from "@/lib/mock-listings";


// ▼ グローバルShell（TopNav / SiteFooter）を使うときは true
const USE_GLOBAL_SHELL = true;

// ---------- 定数 ----------
const RISING_TAGS = ["バレーボール","ボードゲーム", "英会話", "フットサル", "ランニング", "写真"];
const CATEGORIES = ["スポーツ", "学習", "趣味"] as const;
type Category = (typeof CATEGORIES)[number];

// ▼ 47都道府県
const PREFS = [
  "北海道","青森県","岩手県","宮城県","秋田県","山形県","福島県",
  "茨城県","栃木県","群馬県","埼玉県","千葉県","東京都","神奈川県",
  "新潟県","富山県","石川県","福井県","山梨県","長野県",
  "岐阜県","静岡県","愛知県","三重県",
  "滋賀県","京都府","大阪府","兵庫県","奈良県","和歌山県",
  "鳥取県","島根県","岡山県","広島県","山口県",
  "徳島県","香川県","愛媛県","高知県",
  "福岡県","佐賀県","長崎県","熊本県","大分県","宮崎県","鹿児島県","沖縄県"
];

// ---------- noteブログ（モック） ----------
type BlogPost = {
  id: string;
  title: string;
  url: string;
  date: string; // yyyy-mm-dd
  tags?: string[];
  coverUrl?: string | null;
  excerpt?: string;
};

// ▼ ご自身のnoteプロフィールURLに変更
const NOTE_PROFILE_URL = "https://note.com/your_note_id";

// ▼ 表示用のモック（後でRSSやAPIに差し替えやすい形）
const BLOG_POSTS: BlogPost[] = [
  {
    id: "n1",
    title: "イベント募集を伸ばす書き方3選（タイトル・サムネ・募集文）",
    url: "https://note.com/your_note_id/n/xxxxxxxx",
    date: "2025-08-20",
    tags: ["運用ノウハウ","募集のコツ"],
    coverUrl: "/sample/blog1.jpg",
    excerpt: "クリック率を上げる基本と、参加率を落とさないための注意点をまとめました。"
  },
  {
    id: "n2",
    title: "コミュニティ運営のKPI入門：継続率・アクティブ率の見方",
    url: "https://note.com/your_note_id/n/yyyyyyyy",
    date: "2025-08-05",
    tags: ["コミュニティ","データ"],
    coverUrl: "/sample/blog2.jpg",
    excerpt: "数字の追い方をやさしく解説。スモールスタートの指標づくり。"
  },
  {
    id: "n3",
    title: "【事例】平日夜ランニング会が人気になった理由",
    url: "https://note.com/your_note_id/n/zzzzzzzz",
    date: "2025-07-28",
    tags: ["事例","スポーツ"],
    coverUrl: null,
    excerpt: "参加者の声と運営の工夫をインタビュー形式でご紹介。"
  },
];

// ---------- ページ ----------
export default function Page() {
  // 認証状態（MVPはローカルstate）
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  // 検索 & フィルタ状態
  const [keyword, setKeyword] = useState("");
  const [activeCat, setActiveCat] = useState<Category | "ALL">("ALL");
  // ▼ 文言変更：「地域」「料金」「開催日」
  const [area, setArea] = useState("地域");
  const [fee, setFee] = useState<"料金" | "無料" | "有料">("料金");
  const [dateFilter, setDateFilter] =
    useState<"開催日" | "今日" | "今週末" | "日付指定">("開催日");
  const [datePick, setDatePick] = useState<string>("");
  const [sort, setSort] = useState<"新着順" | "開催日順">("新着順");
  const [filterOpen, setFilterOpen] = useState(false);

  // URLの ?q= を読み取って検索キーワードに反映
  const searchParams = useSearchParams();
  React.useEffect(() => {
    const q = searchParams.get("q") ?? "";
    setKeyword(q);
  }, [searchParams]);

  // 共有モックDBから一覧を取得（常に最新の配列を参照）
  const ALL: Listing[] = getAllListings();

  // 絞り込み処理
  const listings = useMemo(() => {
    const today = new Date();
    const isWeekend = (d: Date) => [0, 6].includes(d.getDay());
    let result = [...ALL];

    if (activeCat !== "ALL") {
      result = result.filter((l) => l.category === activeCat);
    }
    if (keyword.trim()) {
      const k = keyword.trim().toLowerCase();
      result = result.filter(
        (l) =>
          l.title.toLowerCase().includes(k) ||
          l.place.toLowerCase().includes(k) ||
          l.category.toLowerCase().includes(k)
      );
    }
    if (area !== "地域") result = result.filter((l) => l.place.includes(area));
    if (fee !== "料金") result = result.filter((l) => l.feeType === fee);

    if (dateFilter === "今日") {
      const y = today.toISOString().slice(0, 10);
      result = result.filter((l) => l.date === y);
    } else if (dateFilter === "今週末") {
      result = result.filter((l) => isWeekend(new Date(l.date)));
    } else if (dateFilter === "日付指定" && datePick) {
      result = result.filter((l) => l.date === datePick);
    }

    if (sort === "新着順") result.sort((a, b) => (a.id < b.id ? 1 : -1));
    else result.sort((a, b) => (a.date > b.date ? 1 : -1));

    return result;
  }, [ALL, activeCat, keyword, area, fee, dateFilter, datePick, sort]);

  // 人気ランキング（閲覧数降順トップ5）
  const ranking = [...ALL].sort((a, b) => b.views - a.views).slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50 text-[#111827]">
      {/* 1. ヘッダー（重複防止のため、グローバルShell使用時は非表示） */}
      {!USE_GLOBAL_SHELL && (
        <header className="sticky top-0 z-30 bg-white shadow-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            {/* ロゴ／サービス名 */}
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-md bg-blue-600" />
              <span className="font-bold text-lg tracking-tight">Linkle</span>
            </div>

            {/* 検索バー（PC） */}
            <div className="hidden md:block flex-1 max-w-xl mx-6">
              <div className="relative">
                <input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  type="text"
                  placeholder="キーワードで探す（例：フットサル 渋谷）"
                  className="w-full rounded-full border px-4 py-2 text-sm shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                />
                <button className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full px-4 py-1.5 text-sm bg-blue-600 text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 active:translate-y-px">
                  検索
                </button>
              </div>
            </div>

            {/* 右側ボタン */}
            <div className="flex items-center gap-3">
              {isLoggedIn ? (
                <>
                  <Link
                    href="/listings/new"
                    className="hidden sm:inline-flex px-3 py-2 rounded-full bg-blue-600 text-white text-sm transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 active:translate-y-px"
                  >
                    募集作成
                  </Link>
                  <button className="p-2 rounded-full hover:bg-blue-50 text-gray-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300" aria-label="通知">
                    <svg width="20" height="20" viewBox="0 0 24 24" className="text-gray-600">
                      <path fill="currentColor" d="M12 22a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2m6-6V11a6 6 0 1 0-12 0v5l-2 2v1h16v-1z" />
                    </svg>
                  </button>
                  <div className="h-8 w-8 rounded-full bg-gray-300" />
                </>
              ) : (
                <>
                  <button
                    className="px-3 py-2 rounded-full bg-blue-600 text-white text-sm transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 active:translate-y-px"
                    onClick={() => setAuthOpen(true)}
                  >
                    ログイン
                  </button>
                  <button
                    className="px-3 py-2 rounded-full border text-sm hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 active:translate-y-px"
                    onClick={() => setAuthOpen(true)}
                  >
                    新規登録
                  </button>
                </>
              )}
            </div>
          </div>

          {/* モバイル検索バー ＋ 絞り込み */}
          <div className="md:hidden px-4 pb-3 bg-white space-y-2">
            <div className="relative">
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                type="text"
                placeholder="キーワードで探す"
                className="w-full rounded-full border px-4 py-2 text-sm shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
              <button className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full px-4 py-1.5 text-sm bg-blue-600 text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 active:translate-y-px">
                検索
              </button>
            </div>
            <button
              onClick={() => setFilterOpen(true)}
              className="w-full rounded-full border px-4 py-2 text-sm shadow-sm bg-white transition-colors hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 active:translate-y-px"
            >
              絞り込み
            </button>
          </div>
        </header>
      )}

      {/* お知らせバー */}
<div className="bg-blue-50 border-b border-blue-200">
  <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
    <p className="text-sm text-blue-800 font-medium text-center">
      🎉 趣味も学びも「Linkle」でつながる。オープンしました！
    </p>
  </div>
</div>

      {/* 2. メインコンテンツ */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-9">
          {/* (1) カテゴリタブ：境界は影、hoverで薄い水色 */}
          <nav className="flex flex-wrap items-center gap-2 bg-white shadow-sm p-3 rounded-xl">
            <Tab label="すべて" active={activeCat === "ALL"} onClick={() => setActiveCat("ALL")} />
            {CATEGORIES.map((c) => (
              <Tab key={c} label={c} active={activeCat === c} onClick={() => setActiveCat(c)} />
            ))}
          </nav>

          {/* (2) フィルタ（PC表示）：枠線→影、文言＆選択肢更新 */}
          <div className="mt-4 hidden md:flex flex-wrap items-center gap-3 bg-white shadow-sm p-3 rounded-xl">
            <select
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="rounded-full px-4 py-2 text-sm bg-white shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
            >
              <option>地域</option>
              {PREFS.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>

            <select
              value={dateFilter}
              onChange={(e) =>
                setDateFilter(e.target.value as "開催日" | "今日" | "今週末" | "日付指定")
              }
              className="rounded-full px-4 py-2 text-sm bg-white shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
            >
              <option>開催日</option>
              <option>今日</option>
              <option>今週末</option>
              <option>日付指定</option>
            </select>
            {dateFilter === "日付指定" && (
              <input
                type="date"
                value={datePick}
                onChange={(e) => setDatePick(e.target.value)}
                className="rounded-full px-4 py-2 text-sm bg-white shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
            )}

            <select
              value={fee}
              onChange={(e) => setFee(e.target.value as "料金" | "無料" | "有料")}
              className="rounded-full px-4 py-2 text-sm bg-white shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
            >
              <option>料金</option>
              <option>無料</option>
              <option>有料</option>
            </select>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as "新着順" | "開催日順")}
              className="rounded-full px-4 py-2 text-sm bg-white shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
            >
              <option>新着順</option>
              <option>開催日順</option>
            </select>
          </div>

          {/* (3) 0件の空状態（ボーダー→影に統一） */}
          {listings.length === 0 && (
            <div className="mt-6 rounded-2xl bg-white p-8 text-center shadow-sm">
              <div className="mx-auto h-14 w-14 rounded-2xl bg-blue-50 flex items-center justify-center">
                <svg width="26" height="26" viewBox="0 0 24 24" className="text-blue-600">
                  <path
                    fill="currentColor"
                    d="M9.5 3A6.5 6.5 0 0 1 16 9.5c0 1.61-.57 3.09-1.52 4.24l4.89 4.89l-1.41 1.41l-4.89-4.89A6.47 6.47 0 0 1 9.5 16A6.5 6.5 0 1 1 9.5 3m0 2A4.5 4.5 0 1 0 14 9.5A4.5 4.5 0 0 0 9.5 5Z"
                  />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold">募集が見つかりませんでした</h3>
              <p className="mt-1 text-sm text-gray-600">
                キーワードや条件を少しゆるめて、もう一度お試しください。
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                {RISING_TAGS.slice(0, 5).map((t) => (
                  <button
                    key={t}
                    onClick={() => setKeyword(t)}
                    className="px-3 py-1.5 rounded-full bg-white shadow-sm text-sm hover:bg-blue-50"
                  >
                    #{t}
                  </button>
                ))}
                <button
                  onClick={() => {
                    setKeyword("");
                    setActiveCat("ALL");
                    setArea("地域");
                    setFee("料金");
                    setDateFilter("開催日");
                    setDatePick("");
                    setSort("新着順");
                  }}
                  className="px-3 py-1.5 rounded-full bg-blue-600 text-white text-sm hover:bg-blue-700"
                >
                  条件をリセット
                </button>
              </div>
            </div>
          )}

          {/* (4) 募集カード一覧：枠線を廃止→影、hoverで薄い水色 */}
          {listings.length > 0 && (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {listings.map((l) => (
                <Link
                  key={l.id}
                  href={`/listings/${l.id}`}
                  className="rounded-2xl bg-white shadow-sm hover:bg-blue-50 transition-colors flex flex-col"
                >
                  {/* 画像エリア（3:2） */}
<div className="relative w-full aspect-[3/2] rounded-t-2xl overflow-hidden">
<CardThumb
src={l.imageUrl}
alt={l.title}
className="h-full w-full"       // ← 高さ幅を親のアスペクト比に合わせて確保
/>

  {/* カテゴリバッジ */}
  <div className="absolute left-2 top-2">
    <span className="inline-flex items-center rounded-full bg-white/95 px-2 py-0.5 text-[11px] font-medium text-gray-700 shadow">
      {l.category}
    </span>
  </div>
</div>

                  {/* 本文 */}
                  <div className="p-4 flex-1 flex flex-col">
                    <h2 className="font-semibold text-[15px] leading-snug mb-1 text-[#111827] line-clamp-2 min-h-[40px]">
                      {l.title}
                    </h2>

                    <div className="space-y-1.5 text-[13px] text-gray-600">
                      <p className="flex items-center gap-1.5">
                        <svg width="16" height="16" viewBox="0 0 24 24" className="text-gray-500 shrink-0">
                          <path
                            fill="currentColor"
                            d="M7 2v2H5a2 2 0 0 0-2 2v2h18V6a2 2 0 0 0-2-2h-2V2h-2v2H9V2zM3 10v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V10zm4 3h4v4H7z"
                          />
                        </svg>
                        <span className="truncate">{fmtDate(l.date)} ・ {l.place}</span>
                      </p>

                      <div className="flex flex-wrap items-center gap-1">
                        <span className="inline-flex items-center rounded-full bg-blue-50 text-blue-700 px-2 py-0.5 text-[11px] font-medium">
                          残り{l.capacityLeft}人
                        </span>
                        <span
                          className={[
                            "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
                            l.feeType === "無料"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700",
                          ].join(" ")}
                        >
                          {l.feeType}
                        </span>
                      </div>
                    </div>

<div className="mt-3 flex items-center justify-between gap-3">
  <div className="flex items-center gap-2 min-w-0 max-w-[70%]">
    {l.host.avatarUrl ? (
      <img
  src={l.host.avatarUrl}
  alt={l.host.name}
  className="h-8 w-8 rounded-full object-cover shrink-0"
  onError={(e) => {
    const img = e.currentTarget;
    img.onerror = null;
    img.src = genInitialAvatar(l.host.name);
  }}
/>
    ) : (
      <div className="h-8 w-8 rounded-full bg-gray-300 shrink-0" />
    )}
    <span className="text-sm text-gray-700 truncate">{l.host.name}</span>
  </div>
  <span className="shrink-0 px-3 py-1.5 rounded-full bg-blue-600 text-white text-sm hover:bg-blue-700">
    詳細を見る
  </span>
</div>
                     
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* 3. サイドコンテンツ：境界は影に統一 */}
        <aside className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="font-semibold mb-3">人気募集ランキング</h3>
            <ol className="divide-y divide-gray-100">
  {ranking.map((r, i) => (
    <li
      key={r.id}
      className="flex items-center gap-3 py-2 px-1 rounded-lg hover:bg-blue-50/40 transition-colors"
    >
      <span className="w-6 text-center text-sm font-semibold text-blue-600 tabular-nums shrink-0">
        {i + 1}
      </span>
      <CardThumb
        src={r.imageUrl}
        alt={r.title}
        className="h-12 w-20 rounded-md shrink-0"
      />
      <div className="min-w-0 leading-tight">
        <p className="text-sm font-medium truncate">{r.title}</p>
        <p className="text-xs text-gray-500 truncate">
          {fmtDate(r.date)} ・ {r.place}
        </p>
      </div>
    </li>
  ))}
</ol>
</div>

          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="font-semibold mb-3">急上昇ワード</h3>
            <div className="flex flex-wrap gap-2">
              {RISING_TAGS.map((t) => (
                <button
                  key={t}
                  onClick={() => setKeyword(t)}
                  className="px-3 py-1.5 rounded-full bg-white shadow-sm hover:bg-blue-50 text-sm"
                >
                  #{t}
                </button>
              ))}
            </div>
          </div>
        </aside>
      </main>

      {/* 2.5 最新のブログ（note） */}
<section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-10">
  <div className="bg-white rounded-2xl shadow-sm p-5 sm:p-6">
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-lg sm:text-xl font-semibold">最新のブログ</h2>
      <Link
        href={NOTE_PROFILE_URL}
        className="text-sm text-blue-700 hover:text-blue-800"
        target="_blank"
      >
        もっと見る →
      </Link>
    </div>

    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
      {BLOG_POSTS.map((b) => (
        <a
          key={b.id}
          href={b.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/40 transition-colors overflow-hidden bg-white"
        >
          {/* カバー */}
          <div className="relative w-full aspect-[16/9] bg-gray-100">
            {/* 既存の CardThumb を流用（NO IMAGE対応あり） */}
            <CardThumb src={b.coverUrl ?? undefined} alt={b.title} className="w-full h-full" />
          </div>

          {/* 本文 */}
          <div className="p-4">
            <h3 className="font-medium text-[15px] leading-snug line-clamp-2 group-hover:text-blue-700">
              {b.title}
            </h3>

            <p className="mt-1 text-xs text-gray-500">
              {new Date(b.date).toLocaleDateString("ja-JP", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>

            {b.excerpt && (
              <p className="mt-2 text-sm text-gray-600 line-clamp-2">{b.excerpt}</p>
            )}

            {b.tags && b.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {b.tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center rounded-full bg-blue-50 text-blue-700 px-2 py-0.5 text-[11px] font-medium"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </a>
      ))}
    </div>
  </div>
</section>

      {/* ▼ SPフィルタ：ボトムシート（モバイル専用） */}
      {filterOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden"
          role="dialog"
          aria-modal="true"
          onClick={() => setFilterOpen(false)}
        >
          <div className="absolute inset-0 bg-black/40" aria-hidden="true" />
          <div
            className="absolute left-0 right-0 bottom-0 bg-white rounded-t-2xl p-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto max-w-md">
              <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-4" />
              <h4 className="font-semibold text-center">絞り込み</h4>

              <div className="mt-4 space-y-3">
                <label className="block text-sm text-gray-600">エリア</label>
                <select
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full rounded-xl px-4 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-400 focus:outline-none"
                >
                  <option>地域</option>
                  {PREFS.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>

                <label className="block text-sm text-gray-600">開催日</label>
                <select
                  value={dateFilter}
                  onChange={(e) =>
                    setDateFilter(e.target.value as "開催日" | "今日" | "今週末" | "日付指定")
                  }
                  className="w-full rounded-xl px-4 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-400 focus:outline-none"
                >
                  <option>開催日</option>
                  <option>今日</option>
                  <option>今週末</option>
                  <option>日付指定</option>
                </select>
                {dateFilter === "日付指定" && (
                  <input
                    type="date"
                    value={datePick}
                    onChange={(e) => setDatePick(e.target.value)}
                    className="w-full rounded-xl px-4 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  />
                )}

                <label className="block text-sm text-gray-600">料金</label>
                <select
                  value={fee}
                  onChange={(e) => setFee(e.target.value as "料金" | "無料" | "有料")}
                  className="w-full rounded-xl px-4 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-400 focus:outline-none"
                >
                  <option>料金</option>
                  <option>無料</option>
                  <option>有料</option>
                </select>

                <label className="block text-sm text-gray-600">並び替え</label>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as "新着順" | "開催日順")}
                  className="w-full rounded-xl px-4 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-400 focus:outline-none"
                >
                  <option>新着順</option>
                  <option>開催日順</option>
                </select>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={() => setFilterOpen(false)}
                  className="flex-1 px-4 py-2 rounded-full bg-blue-600 text-white text-sm transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 active:translate-y-px"
                >
                  適用する
                </button>
                <button
                  onClick={() => {
                    setKeyword("");
                    setActiveCat("ALL");
                    setArea("地域");
                    setDateFilter("開催日");
                    setDatePick("");
                    setFee("料金");
                    setSort("新着順");
                    setFilterOpen(false);
                  }}
                  className="px-4 py-2 rounded-full bg-white shadow-sm text-sm hover:bg-blue-50"
                >
                  リセット
                </button>
              </div>

              <div className="h-[env(safe-area-inset-bottom)]" />
            </div>
          </div>
        </div>
      )}

      {/* 認証モーダル（TopNav に統合しているため、グローバルShell使用時は非表示） */}
      {!USE_GLOBAL_SHELL && (
        <AuthModal
          open={authOpen}
          onClose={() => setAuthOpen(false)}
          onLoginSuccess={() => {
            setIsLoggedIn(true);
            setAuthOpen(false);
          }}
        />
      )}

      {/* 4. フッター（重複防止） */}
      {!USE_GLOBAL_SHELL && (
        <footer className="bg-white border-t">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 text-sm text-gray-600">
            <div className="flex flex-wrap gap-4">
              <a href="#" className="hover:text-blue-600">
                利用規約
              </a>
              <a href="#" className="hover:text-blue-600">
                プライバシーポリシー
              </a>
              <a href="#" className="hover:text-blue-600">
                ガイドライン
              </a>
              <a href="#" className="hover:text-blue-600">
                お問い合わせ
              </a>
              {/* ▼ ここを追加 */}
              <a
                href="mailto:info@linkle.example?subject=【お問い合わせ】Linkle事務局宛"
                className="hover:text-blue-600"
              >
                事務局へのお問い合わせ
              </a>
            </div>
            <p className="mt-3">© 2025 Linkle</p>
          </div>
        </footer>
      )}
    </div>
  );
}

// ---------- 小物 ----------
function Tab({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "px-4 py-2 rounded-full text-sm transition border",
        active
          ? "bg-blue-600 text-white border-blue-600 shadow-sm"
          : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50",
      ].join(" ")}
      aria-pressed={active}
    >
      {label}
    </button>
  );
}

function hasImage(src?: string | null) {
const v = (src ?? "").trim().toLowerCase();
if (!v) return false;
return !["undefined","null","noimage","no-image","/sample/new.svg"].includes(v);
}

function CardThumb({ src, alt, className = "" }: { src?: string | null; alt: string; className?: string }) {
  const [broken, setBroken] = React.useState(false);
  const showImage = hasImage(src) && !broken;

  return (
    <div className={`relative ${className} bg-gray-100 overflow-hidden`}>
      {showImage ? (
        <Image
  src={src as string}
  alt={alt}
  fill
  className="object-cover"
  sizes="(min-width:1280px) 33vw, (min-width:640px) 50vw, 100vw"
  onError={() => setBroken(true)}
/>
      ) : (
        <div className="absolute inset-0 grid place-items-center bg-gray-100">
          <span className="text-gray-500 font-semibold tracking-wide text-[10px]">NO IMAGE</span>
        </div>
      )}
    </div>
  );
}

function fmtDate(yyyyMMdd: string) {
  const d = new Date(yyyyMMdd);
  const w = ["日", "月", "火", "水", "木", "金", "土"][d.getDay()];
  return `${d.getMonth() + 1}/${d.getDate()}(${w})`;
}

// === 追加: 頭文字SVGを返す関数（ページ側用） ===
function genInitialAvatar(name: string) {
  const ch = (name?.trim()?.[0] ?? "U");
  const svg = encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96">
      <rect width="100%" height="100%" rx="48" fill="#e5e7eb"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
        font-family="system-ui,-apple-system,Segoe UI,Roboto,Helvetica Neue,Arial"
        font-size="44" fill="#6b7280">${ch}</text>
    </svg>`
  );
  return `data:image/svg+xml;charset=utf-8,${svg}`;
}