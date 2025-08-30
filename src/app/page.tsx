// src/app/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import Image from "next/image";
import React, { useMemo, useState } from "react";
import Link from "next/link";
import AuthModal from "@/components/AuthModal";
import { getAllListings, type Listing } from "@/lib/mock-listings";

// ▼ 追加：グローバルShell（TopNav / SiteFooter）を使うときは true
const USE_GLOBAL_SHELL = true;

// ---------- 定数 ----------
const RISING_TAGS = ["ボードゲーム", "英会話", "フットサル", "ランニング", "写真"];
const CATEGORIES = ["スポーツ", "学習", "趣味"] as const;
type Category = (typeof CATEGORIES)[number];

// ---------- ページ ----------
export default function Page() {
  // 認証状態（MVPはローカルstate）
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  // 検索 & フィルタ状態
  const [keyword, setKeyword] = useState("");
  const [activeCat, setActiveCat] = useState<Category | "ALL">("ALL");
  const [area, setArea] = useState("すべて");
  const [fee, setFee] = useState<"すべて" | "無料" | "有料">("すべて");
  const [dateFilter, setDateFilter] =
    useState<"すべて" | "今日" | "今週末" | "日付指定">("すべて");
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
    if (area !== "すべて") result = result.filter((l) => l.place.includes(area));
    if (fee !== "すべて") result = result.filter((l) => l.feeType === fee);

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

      {/* 2. メインコンテンツ */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-9">
          {/* (1) カテゴリタブ */}
          <nav className="flex flex-wrap items-center gap-2 border-b bg-white p-3 rounded-xl">
            <Tab label="すべて" active={activeCat === "ALL"} onClick={() => setActiveCat("ALL")} />
            {CATEGORIES.map((c) => (
              <Tab key={c} label={c} active={activeCat === c} onClick={() => setActiveCat(c)} />
            ))}
          </nav>

          {/* (2) フィルタ（PC表示） */}
          <div className="mt-4 hidden md:flex flex-wrap items-center gap-3 bg-gray-100 p-3 rounded-xl">
            <select
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="border rounded-full px-4 py-2 text-sm bg-white shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none hover:border-blue-300 transition-colors"
            >
              <option>すべて</option>
              <option>東京都 渋谷区</option>
              <option>東京都 新宿区</option>
              <option>東京都 世田谷区</option>
              <option>神奈川県 横浜市</option>
              <option>千葉県 千葉市</option>
            </select>
            <select
              value={dateFilter}
              onChange={(e) =>
                setDateFilter(e.target.value as "すべて" | "今日" | "今週末" | "日付指定")
              }
              className="border rounded-full px-4 py-2 text-sm bg-white shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none hover:border-blue-300 transition-colors"
            >
              <option>すべて</option>
              <option>今日</option>
              <option>今週末</option>
              <option>日付指定</option>
            </select>
            {dateFilter === "日付指定" && (
              <input
                type="date"
                value={datePick}
                onChange={(e) => setDatePick(e.target.value)}
                className="border rounded-full px-4 py-2 text-sm bg-white shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none hover:border-blue-300 transition-colors"
              />
            )}
            <select
              value={fee}
              onChange={(e) => setFee(e.target.value as "すべて" | "無料" | "有料")}
              className="border rounded-full px-4 py-2 text-sm bg-white shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none hover:border-blue-300 transition-colors"
            >
              <option>すべて</option>
              <option>無料</option>
              <option>有料</option>
            </select>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as "新着順" | "開催日順")}
              className="border rounded-full px-4 py-2 text-sm bg-white shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none hover:border-blue-300 transition-colors"
            >
              <option>新着順</option>
              <option>開催日順</option>
            </select>
          </div>

          {/* (3) 募集カード一覧 */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {listings.map((l) => (
              <Link
                key={l.id}
                href={`/listings/${l.id}`}
                className="border rounded-2xl p-4 bg-white shadow-sm transition-all hover:shadow-md hover:border-blue-200 block"
              >
                {/* 画像エリア（3:2） */}
                <div className="relative w-full aspect-[3/2] mb-3">
                  <Image
                    src={l.imageUrl}
                    alt="募集サムネイル"
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="rounded-xl object-cover"
                    priority={false}
                  />
                </div>

                <h2 className="font-semibold text-lg mb-1 text-[#111827] line-clamp-2">
                  {l.title}
                </h2>

                <div className="text-sm text-gray-600">
                  <p className="flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" className="text-gray-500">
                      <path
                        fill="currentColor"
                        d="M7 2v2H5a2 2 0 0 0-2 2v2h18V6a2 2 0 0 0-2-2h-2V2h-2v2H9V2zM3 10v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V10zm4 3h4v4H7z"
                      />
                    </svg>
                    {fmtDate(l.date)} ・ {l.place}
                  </p>
                  <p className="mt-1">残り{l.capacityLeft}人 ・ {l.feeType}</p>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-gray-300" />
                    <span className="text-sm text-gray-700">{l.host.name}</span>
                  </div>
                  <span className="px-3 py-1.5 rounded-full bg-blue-600 text-white text-sm transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300">
                    詳細を見る
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 3. サイドコンテンツ */}
        <aside className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-xl border p-4 shadow-sm">
            <h3 className="font-semibold mb-3">人気募集ランキング</h3>

            {/* ▼ ここを全面調整：flex行 + divide で均一 */}
            <ol className="divide-y divide-gray-100">
              {ranking.map((r, i) => (
                <li
                  key={r.id}
                  className="flex items-center gap-3 py-2 px-1 rounded-lg hover:bg-blue-50/40 transition-colors"
                >
                  {/* 順位（幅固定・縮まない） */}
                  <span className="w-6 text-center text-sm font-semibold text-blue-600 tabular-nums shrink-0">
                    {i + 1}
                  </span>

                  {/* サムネ（小）幅・高さ固定／縮小禁止 */}
                  <div className="relative h-12 w-20 overflow-hidden rounded-md bg-gray-100 border border-gray-200 shrink-0">
                    <Image
                      src={r.imageUrl}
                      alt={r.title}
                      fill
                      sizes="80px"
                      className="object-cover block"
                      priority={false}
                    />
                  </div>

                  {/* テキスト（折返しは1行で省略、行間詰め） */}
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

          <div className="bg-white rounded-xl border p-4 shadow-sm">
            <h3 className="font-semibold mb-3">急上昇ワード</h3>
            <div className="flex flex-wrap gap-2">
              {RISING_TAGS.map((t) => (
                <button
                  key={t}
                  onClick={() => setKeyword(t)}
                  className="px-3 py-1.5 rounded-full border text-sm hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 active:translate-y-px"
                >
                  #{t}
                </button>
              ))}
            </div>
          </div>
        </aside>
      </main>

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
                  className="w-full border rounded-xl px-4 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-400 focus:outline-none hover:border-blue-300 transition-colors"
                >
                  <option>すべて</option>
                  <option>東京都 渋谷区</option>
                  <option>東京都 新宿区</option>
                  <option>東京都 世田谷区</option>
                  <option>神奈川県 横浜市</option>
                  <option>千葉県 千葉市</option>
                </select>

                <label className="block text-sm text-gray-600">開催日</label>
                <select
                  value={dateFilter}
                  onChange={(e) =>
                    setDateFilter(e.target.value as "すべて" | "今日" | "今週末" | "日付指定")
                  }
                  className="w-full border rounded-xl px-4 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-400 focus:outline-none hover:border-blue-300 transition-colors"
                >
                  <option>すべて</option>
                  <option>今日</option>
                  <option>今週末</option>
                  <option>日付指定</option>
                </select>
                {dateFilter === "日付指定" && (
                  <input
                    type="date"
                    value={datePick}
                    onChange={(e) => setDatePick(e.target.value)}
                    className="w-full border rounded-xl px-4 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-400 focus:outline-none hover:border-blue-300 transition-colors"
                  />
                )}

                <label className="block text-sm text-gray-600">費用</label>
                <select
                  value={fee}
                  onChange={(e) => setFee(e.target.value as "すべて" | "無料" | "有料")}
                  className="w-full border rounded-xl px-4 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-400 focus:outline-none hover:border-blue-300 transition-colors"
                >
                  <option>すべて</option>
                  <option>無料</option>
                  <option>有料</option>
                </select>

                <label className="block text-sm text-gray-600">並び替え</label>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as "新着順" | "開催日順")}
                  className="w-full border rounded-xl px-4 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-400 focus:outline-none hover:border-blue-300 transition-colors"
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
                    setArea("すべて");
                    setDateFilter("すべて");
                    setDatePick("");
                    setFee("すべて");
                    setSort("新着順");
                    setFilterOpen(false);
                  }}
                  className="px-4 py-2 rounded-full border text-sm hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 active:translate-y-px"
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
        "px-4 py-2 rounded-full text-sm border transition",
        active
          ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-300"
          : "bg-white text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 focus-visible:ring-2 focus-visible:ring-blue-300",
      ].join(" ")}
      aria-pressed={active}
    >
      {label}
    </button>
  );
}

function fmtDate(yyyyMMdd: string) {
  const d = new Date(yyyyMMdd);
  const w = ["日", "月", "火", "水", "木", "金", "土"][d.getDay()];
  return `${d.getMonth() + 1}/${d.getDate()}(${w})`;
}