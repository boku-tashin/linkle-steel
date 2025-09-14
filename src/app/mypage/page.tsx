// src/app/mypage/page.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { getAllListings, getListingById, type Listing } from "@/lib/mock-listings";
import { useSession, signIn } from "next-auth/react";
import ListingCard from "@/components/ListingCard";

/** ローカルの簡易ユーザー型（既存UI用の表示整形） */
type ViewUser = {
  id?: string | null;
  nickname: string;
  email?: string | null;
  avatarUrl?: string | null;
  createdAt?: string; // ISO（未使用だが既存型踏襲）
};

type TabKey = "joined" | "favorites" | "mine";

export default function MyPage() {
  const { data: session, status } = useSession();
  const [joinedIds, setJoinedIds] = useState<string[]>([]);
  const [favIds, setFavIds] = useState<string[]>([]);
  const [myIds, setMyIds] = useState<string[]>([]);
  const [active, setActive] = useState<TabKey>("joined");

  // ---- NextAuthセッションから表示用ユーザーを整形 ----
  const user: ViewUser | null = session?.user
    ? {
        id: (session.user as any).id ?? null, // route.ts の session callback で付与済み
        nickname: session.user.name ?? "ユーザー",
        email: session.user.email ?? null,
        avatarUrl: session.user.image ?? null,
        // createdAt は今回は無し
      }
    : null;

  // ---- ローカルストレージから参加/お気に入り/作成IDを読む ----
  useEffect(() => {
    try {
      const j = localStorage.getItem("auth:joined"); // string[] of listingId
      setJoinedIds(j ? JSON.parse(j) : []);
      const f = localStorage.getItem("auth:favs"); // string[] of listingId
      setFavIds(f ? JSON.parse(f) : []);
      const m = localStorage.getItem("auth:mine"); // string[] of listingId
      setMyIds(m ? JSON.parse(m) : []);
    } catch {
      setJoinedIds([]);
      setFavIds([]);
      setMyIds([]);
    }
  }, []);

  // ---- タブごとの一覧 ----
  const joined: Listing[] = useMemo(
    () => joinedIds.map((id) => getListingById(id)).filter(Boolean) as Listing[],
    [joinedIds]
  );
  const favorites: Listing[] = useMemo(
    () => favIds.map((id) => getListingById(id)).filter(Boolean) as Listing[],
    [favIds]
  );
  const mine: Listing[] = useMemo(() => {
    if (!user) return [];
    // 1) auth:mine に保存されたIDで復元
    const fromIds = myIds.map((id) => getListingById(id)).filter(Boolean) as Listing[];
    if (fromIds.length > 0) return fromIds;

    // 2) フォールバック：従来のニックネーム一致
    return getAllListings().filter((l) => l.host?.name === user.nickname);
  }, [user, myIds]);

  // ---- 未ログイン表示（ロード中は何も出さない→未ログインならCTA） ----
  if (status !== "authenticated") {
    if (status === "loading") {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="text-sm text-gray-500">読み込み中…</div>
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-blue-50 flex items-center justify-center">
            <svg width="26" height="26" viewBox="0 0 24 24" className="text-blue-600">
              <path
                fill="currentColor"
                d="M12 12a5 5 0 1 0-5-5a5 5 0 0 0 5 5m0 2c-3.33 0-10 1.67-10 5v1h20v-1c0-3.33-6.67-5-10-5"
              />
            </svg>
          </div>
          <h1 className="mt-4 text-xl font-bold text-gray-900">マイページ</h1>
          <p className="mt-1 text-sm text-gray-600">
            ログインすると、参加中・お気に入り・作成した募集を確認できます。
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              onClick={() => signIn(undefined, { callbackUrl: "/mypage" })}
              className="px-4 py-2 rounded-full bg-blue-600 text-white text-sm hover:bg-blue-700 transition"
            >
              ログインする
            </button>
            <Link
              href="/"
              className="px-4 py-2 rounded-full text-sm bg-white shadow-sm text-gray-900 hover:bg-blue-50 transition"
            >
              トップへ戻る
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ---- ログイン後 UI ----
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー行（戻る） */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-700 hover:text-blue-700 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path
                d="M15 18l-6-6 6-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            トップへ戻る
          </Link>
        </div>
      </div>

      {/* プロフィールカード */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 rounded-full overflow-hidden bg-gray-200 shrink-0">
              {user?.avatarUrl ? (
                <Image src={user.avatarUrl as string} alt="avatar" fill className="object-cover" />
              ) : (
                <div className="h-full w-full grid place-items-center text-gray-500 text-sm">
                  {user?.nickname?.[0] ?? "U"}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-bold text-gray-900 truncate">{user?.nickname ?? "ユーザー"}</h1>
              {user?.email && <p className="text-sm text-gray-600 truncate">{user.email}</p>}
            </div>
            <Link
              href="/mypage/settings"
              className="shrink-0 whitespace-nowrap px-3 py-1.5 rounded-full bg-blue-600 text-white 
                         text-xs sm:text-sm hover:bg-blue-700 transition"
            >
              設定を開く
            </Link>
          </div>
        </div>
      </div>

      {/* タブ */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 mt-6">
        <div className="bg-white rounded-2xl p-2 shadow-sm flex items-center gap-2">
          <Tab label="参加中" active={active === "joined"} onClick={() => setActive("joined")} />
          <Tab label="お気に入り" active={active === "favorites"} onClick={() => setActive("favorites")} />
          <Tab label="作成した募集" active={active === "mine"} onClick={() => setActive("mine")} />
        </div>

        {/* 一覧 */}
        <div className="mt-4">
          <ListingGrid
            items={active === "joined" ? joined : active === "favorites" ? favorites : mine}
            emptyText={
              active === "joined"
                ? "参加中の募集はまだありません。気になる募集に参加してみましょう。"
                : active === "favorites"
                ? "お気に入りはまだありません。募集カードの「お気に入り」をタップできます。"
                : "作成した募集はありません。「募集する」から作ってみましょう。"
            }
          />
        </div>
      </div>

      <div className="h-10" />
    </div>
  );
}

/* ===== 小物 ===== */
function Tab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={[
        "px-4 py-2 rounded-full text-sm transition",
        active ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-blue-50",
      ].join(" ")}
      aria-pressed={active}
    >
      {label}
    </button>
  );
}

function ListingGrid({ items, emptyText }: { items: Listing[]; emptyText: string }) {
  if (!items || items.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
        <div className="mx-auto h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
          <svg width="22" height="22" viewBox="0 0 24 24" className="text-blue-600">
            <path
              fill="currentColor"
              d="M9.5 3A6.5 6.5 0 0 1 16 9.5c0 1.61-.57 3.09-1.52 4.24l4.89 4.89l-1.41 1.41l-4.89-4.89A6.47 6.47 0 0 1 9.5 16A6.5 6.5 0 1 1 9.5 3m0 2A4.5 4.5 0 1 0 14 9.5A4.5 4.5 0 0 0 9.5 5Z"
            />
          </svg>
        </div>
        <p className="mt-3 text-sm text-gray-600">{emptyText}</p>
        <div className="mt-4">
          <Link
            href="/"
            className="inline-flex px-4 py-2 rounded-full bg-blue-600 text-white text-sm hover:bg-blue-700 transition"
          >
            募集を探す
          </Link>
        </div>
      </div>
    );
  }

  return (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {items.map((l) => (
      <ListingCard key={l.id} listing={l} />
    ))}
  </div>
);
}

function fmtDate(yyyyMMdd: string) {
  const d = new Date(yyyyMMdd);
  const w = ["日", "月", "火", "水", "木", "金", "土"][d.getDay()];
  return `${d.getMonth() + 1}/${d.getDate()}(${w})`;
}