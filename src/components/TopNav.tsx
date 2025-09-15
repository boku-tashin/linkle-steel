// src/components/TopNav.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import HostInboxButton from "@/components/HostInboxButton";

export default function TopNav() {
  const router = useRouter();
  const pathname = usePathname();

  // NextAuth セッション
  const { data: session } = useSession();
  const user = session?.user;
  const isLoggedIn = !!user;

  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  // プロフィールドロップダウン
  const [profileOpen, setProfileOpen] = useState(false);
  const profileBtnRef = useRef<HTMLButtonElement | null>(null);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  // 画面遷移でドロワー/プロフィールメニューを閉じる
  useEffect(() => {
    setOpen(false);
    setProfileOpen(false);
  }, [pathname]);

  // プロフィールドロップダウンの外側クリック/ESCで閉じる
  useEffect(() => {
    if (!profileOpen) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(t) &&
        profileBtnRef.current &&
        !profileBtnRef.current.contains(t)
      ) {
        setProfileOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setProfileOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [profileOpen]);

  // 🔴 追加：NextAuth の状態を localStorage("auth:loggedIn") にミラー
  // Listing 詳細ページ側はこのフラグで isLoggedIn を判定しているため、ここで常に同期させる。
  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      if (isLoggedIn) {
        localStorage.setItem("auth:loggedIn", "1");
      } else {
        localStorage.removeItem("auth:loggedIn");
      }
      // 同期通知（別タブや同タブの監視フックに反映させる）
      try {
        window.dispatchEvent(new StorageEvent("storage", { key: "auth:loggedIn" }));
      } catch {}
    } catch {
      /* noop */
    }
  }, [isLoggedIn]);

  // 検索（フォーム送信/クリック両対応）
  const onSearch = (e?: React.FormEvent | React.MouseEvent) => {
    if (e?.preventDefault) e.preventDefault();
    const url = q.trim() ? `/?q=${encodeURIComponent(q.trim())}` : "/";
    router.push(url);
  };

  // ログアウト
  const onLogout = async () => {
    setProfileOpen(false);
    setOpen(false);
    // 先に localStorage を落として UI を即時反映
    try {
      localStorage.removeItem("auth:loggedIn");
      window.dispatchEvent(new StorageEvent("storage", { key: "auth:loggedIn" }));
    } catch {}
    await signOut({ callbackUrl: "/" });
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-7xl h-14 px-3 sm:px-6 lg:px-8">
          <div className="h-full flex items-center gap-3">
            {/* ロゴ */}
            <Link
              href="/"
              className="flex items-center gap-2 shrink-0 group"
              aria-label="Linkle ホームへ"
            >
              <Image
                src="/logo.png"
                alt="Linkle ロゴ"
                width={120}
                height={30}
                priority
                className="h-6 w-auto sm:h-7"
              />
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
                  className="w-full rounded-full px-4 py-2 text-sm shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none text-gray-900 placeholder:text-gray-500"
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
              <div className="flex items-center gap-2">
                <Link
                  href="/"
                  className="px-3 py-2 rounded-full text-sm bg-blue-50 text-blue-700 transition-colors hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
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

              {/* 主催者受信箱 */}
              <HostInboxButton />

              <span className="h-6 w-px bg-gray-200" aria-hidden />

              {/* 認証グループ */}
              {isLoggedIn ? (
                <div className="relative">
                  <button
                    ref={profileBtnRef}
                    onClick={() => setProfileOpen((v) => !v)}
                    className="h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center hover:opacity-90 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 overflow-hidden"
                    aria-haspopup="menu"
                    aria-expanded={profileOpen}
                    aria-label="プロフィールメニュー"
                  >
                    {user?.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={user.image}
                        alt={user.name ?? "profile"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" className="text-gray-700">
                        <path
                          fill="currentColor"
                          d="M12 12a5 5 0 1 0-5-5a5 5 0 0 0 5 5m0 2c-4.33 0-8 2.17-8 5v1h16v-1c0-2.83-3.67-5-8-5"
                        />
                      </svg>
                    )}
                  </button>

                  {profileOpen && (
                    <div
                      ref={profileMenuRef}
                      role="menu"
                      aria-label="プロフィール"
                      className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-lg p-2"
                    >
                      <div className="px-3 py-2">
                        <p className="text-sm font-medium text-gray-900 line-clamp-1">
                          {user?.name ?? "ユーザー"}
                        </p>
                        {user?.email && (
                          <p className="text-xs text-gray-500 line-clamp-1">
                            {user.email}
                          </p>
                        )}
                      </div>
                      <Link
                        href="/mypage"
                        onClick={() => setProfileOpen(false)}
                        className="block w-full text-left rounded-xl px-3 py-2 text-sm hover:bg-blue-50 hover:text-blue-700 transition"
                        role="menuitem"
                      >
                        マイページ
                      </Link>
                      <Link
                        href="/mypage/settings"
                        onClick={() => setProfileOpen(false)}
                        className="block w-full text-left rounded-xl px-3 py-2 text-sm hover:bg-blue-50 hover:text-blue-700 transition"
                        role="menuitem"
                      >
                        設定
                      </Link>
                      <button
                        onClick={onLogout}
                        className="mt-1 block w-full text-left rounded-xl px-3 py-2 text-sm hover:bg-blue-50 hover:text-blue-700 transition"
                        role="menuitem"
                      >
                        ログアウト
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => signIn(undefined, { callbackUrl: "/" })}
                    className="px-3 py-2 rounded-full bg-blue-600 text-white text-sm transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
                  >
                    ログイン
                  </button>
                  <button
                    onClick={() => signIn(undefined, { callbackUrl: "/" })}
                    className="px-3 py-2 rounded-full text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
                  >
                    新規登録
                  </button>
                </div>
              )}
            </nav>

            {/* モバイルメニュー（トグル） */}
            <button
              onClick={() => setOpen((v) => !v)}
              className="ml-auto sm:hidden p-2 rounded-full hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
              aria-label="メニュー"
              aria-expanded={open}
              aria-controls="mobile-drawer"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" className="text-gray-900">
                <path fill="currentColor" d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* モバイルドロワー */}
      {open && (
        <div
          id="mobile-drawer"
          className="fixed inset-0 z-50 sm:hidden"
          aria-modal="true"
          role="dialog"
          onClick={() => setOpen(false)}
        >
          <div className="absolute inset-0 bg-black/30" />
          <div
            className="absolute left-0 right-0 top-0 bg-white rounded-b-2xl shadow-lg p-4 pt-5 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={onSearch}>
              <div className="relative">
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  type="text"
                  placeholder="キーワードで探す"
                  className="w-full rounded-full px-4 py-2 text-sm shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none text-gray-900 placeholder:text-gray-500"
                />
                <button
                  type="submit"
                  onClick={onSearch}
                  className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full px-4 py-1.5 text-sm bg-blue-600 text-white hover:bg-blue-700 transition"
                >
                  検索
                </button>
              </div>
            </form>

            <div className="mt-4 space-y-5">
              <div>
                <p className="text-xs text-gray-500 mb-2">募集</p>
                <div className="flex flex-col gap-2">
                  <Link
                    href="/"
                    onClick={() => setOpen(false)}
                    className="px-4 py-2 rounded-xl text-sm text-gray-900 bg-white shadow-sm hover:bg-blue-50 hover:text-blue-700 transition text-center"
                  >
                    募集一覧
                  </Link>
                  <Link
                    href="/listings/new"
                    onClick={() => setOpen(false)}
                    className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm hover:bg-blue-700 transition text-center"
                  >
                    募集する
                  </Link>
                  <HostInboxButton asItem />
                </div>
              </div>

              {!isLoggedIn ? (
                <div>
                  <p className="text-xs text-gray-500 mb-2">アカウント</p>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => {
                        setOpen(false);
                        signIn(undefined, { callbackUrl: "/" });
                      }}
                      className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm hover:bg-blue-700 transition text-center"
                    >
                      ログイン
                    </button>
                    <button
                      onClick={() => {
                        setOpen(false);
                        signIn(undefined, { callbackUrl: "/" });
                      }}
                      className="px-4 py-2 rounded-xl text-sm text-gray-900 bg-white shadow-sm hover:bg-blue-50 hover:text-blue-700 transition text-center"
                    >
                      新規登録
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-xs text-gray-500 mb-2">プロフィール</p>
                  <div className="flex flex-col gap-2">
                    <Link
                      href="/mypage"
                      onClick={() => setOpen(false)}
                      className="px-4 py-2 rounded-xl text-sm text-gray-900 bg-white shadow-sm hover:bg-blue-50 hover:text-blue-700 transition text-center"
                    >
                      マイページ
                    </Link>
                    <Link
                      href="/settings"
                      onClick={() => setOpen(false)}
                      className="px-4 py-2 rounded-xl text-sm text-gray-900 bg-white shadow-sm hover:bg-blue-50 hover:text-blue-700 transition text-center"
                    >
                      設定
                    </Link>
                    <button
                      onClick={onLogout}
                      className="px-4 py-2 rounded-xl text-sm text-gray-900 bg-white shadow-sm hover:bg-blue-50 hover:text-blue-700 transition text-center"
                    >
                      ログアウト
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="h-3" />
          </div>
        </div>
      )}
    </>
  );
}