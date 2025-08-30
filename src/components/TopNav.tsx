// src/components/TopNav.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import AuthModal from "@/components/AuthModal";
// ▼ 追加：ロゴ画像を使うため
import Image from "next/image";

export default function TopNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  // 認証UI
  const [authOpen, setAuthOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 画面遷移でドロワーを閉じる
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // 検索（フォーム送信/クリック両対応）
  const onSearch = (e?: React.FormEvent | React.MouseEvent) => {
    if (e?.preventDefault) e.preventDefault();
    const url = q.trim() ? `/?q=${encodeURIComponent(q.trim())}` : "/";
    router.push(url);
  };

  // 既存のナビ配列（互換用・モバイルで使用）
  const items = useMemo(
    () => [
      { href: "/", label: "募集を探す" },
      { href: "/listings/new", label: "募集を作成" },
    ],
    []
  );

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b">
      <div className="mx-auto max-w-7xl h-14 px-3 sm:px-6 lg:px-8">
        <div className="h-full flex items-center gap-3">
          {/* ロゴ */}
          <Link href="/" className="flex items-center gap-2 shrink-0 group">
            {/* ▼ 追加：ロゴ画像（public 配下に logo.png を置いてください） */}
            <Image
              src="/logo.png"
              alt="Linkle ロゴ"
              width={120}
              height={30}
              priority
              className="h-6 w-auto sm:h-7"
            />
            {/* ▼ 元の四角ロゴは残す（非表示）※削除しない */}
            <div className="h-7 w-7 rounded-md bg-gradient-to-br from-blue-600 to-indigo-500 group-hover:scale-[1.03] transition-transform hidden" />
          </Link>

          {/* 検索（md〜） */}
          <form onSubmit={onSearch} className="hidden md:block flex-1">
            <div className="relative max-w-xl mx-4">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                type="text"
                placeholder="キーワードで探す（例：フットサル 渋谷）"
                className="w-full rounded-full border px-4 py-2 text-sm shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none
                           text-gray-900 placeholder:text-gray-500"
                aria-label="サイト内検索"
              />
              <button
                type="submit"
                onClick={onSearch}
                className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full px-4 py-1.5 text-sm bg-blue-600 text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
                aria-label="検索"
              >
                検索
              </button>
            </div>
          </form>

          {/* 右エリア（PC） */}
          <nav className="ml-auto hidden sm:flex items-center gap-3">
            {/* 機能グループ：募集一覧・募集する */}
            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="px-3 py-2 rounded-full text-sm border text-gray-900 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
              >
                募集一覧
              </Link>
              <Link
                href="/listings/new"
                className="px-3 py-2 rounded-full bg-blue-600 text-white text-sm transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
              >
                募集する
              </Link>
            </div>

            {/* 区切り線 */}
            <span className="h-6 w-px bg-gray-200" aria-hidden />

            {/* 認証グループ：ログイン・新規登録（ログイン済みなら非表示） */}
            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-gray-300" aria-label="プロフィール" />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAuthOpen(true)}
                  className="px-3 py-2 rounded-full bg-blue-600 text-white text-sm transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
                >
                  ログイン
                </button>
                <button
                  onClick={() => setAuthOpen(true)}
                  className="px-3 py-2 rounded-full border text-sm text-gray-900 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
                >
                  新規登録
                </button>
              </div>
            )}
          </nav>

          {/* モバイルメニュー */}
          <button
            onClick={() => setOpen((v) => !v)}
            className="ml-auto sm:hidden p-2 rounded-full hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
            aria-label="メニュー"
            aria-expanded={open}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" className="text-gray-900">
              <path fill="currentColor" d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z" />
            </svg>
          </button>
        </div>
      </div>

      {/* モバイルドロワー */}
      {open && (
        <div className="sm:hidden border-t bg-white">
          <div className="px-4 py-3 space-y-4">
            {/* 検索 */}
            <form onSubmit={onSearch}>
              <div className="relative">
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  type="text"
                  placeholder="キーワードで探す"
                  className="w-full rounded-full border px-4 py-2 text-sm shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none text-gray-900 placeholder:text-gray-500"
                />
                <button
                  type="submit"
                  onClick={onSearch}
                  className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full px-4 py-1.5 text-sm bg-blue-600 text-white"
                >
                  検索
                </button>
              </div>
            </form>

            {/* 機能グループ */}
            <div>
              <p className="text-xs text-gray-500 mb-2">募集</p>
              <div className="flex flex-col gap-2">
                <Link
                  href="/"
                  className="px-4 py-2 rounded-xl border text-sm text-gray-900 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors"
                >
                  募集一覧
                </Link>
                <Link
                  href="/listings/new"
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm text-center hover:bg-blue-700 transition-colors"
                >
                  募集する
                </Link>
              </div>
            </div>

            {/* 認証グループ */}
            {!isLoggedIn && (
              <div>
                <p className="text-xs text-gray-500 mb-2">アカウント</p>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => setAuthOpen(true)}
                    className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm text-left hover:bg-blue-700 transition-colors"
                  >
                    ログイン
                  </button>
                  <button
                    onClick={() => setAuthOpen(true)}
                    className="px-4 py-2 rounded-xl border text-sm text-left text-gray-900 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors"
                  >
                    新規登録
                  </button>
                </div>
              </div>
            )}

            {/* 既存リンク（互換） */}
            <div className="pt-2 border-t">
              <div className="mt-3 flex flex-col gap-2">
                {items.map((it) => (
                  <Link
                    key={it.href}
                    href={it.href}
                    className="px-4 py-2 rounded-xl border text-sm text-gray-900 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors"
                  >
                    {it.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 認証モーダル */}
      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onLoginSuccess={() => {
          setIsLoggedIn(true);
          setAuthOpen(false);
        }}
      />
    </header>
  );
}