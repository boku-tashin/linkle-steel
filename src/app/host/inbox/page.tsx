// src/app/host/inbox/page.tsx
"use client";

import React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  getNotifications,
  unreadCount,
  markAllRead,
  markAsRead,
  type HostNotification,
} from "@/lib/host-inbox";

/* ---------- ユーティリティ ---------- */
function timeAgo(iso: string) {
  const d = new Date(iso).getTime();
  const diff = Math.max(0, Date.now() - d);
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec}秒前`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}分前`;
  const hour = Math.floor(min / 60);
  if (hour < 24) return `${hour}時間前`;
  const day = Math.floor(hour / 24);
  if (day < 7) return `${day}日前`;
  return new Date(iso).toLocaleString();
}

function initialAvatarText(name?: string) {
  const ch = (name || "").trim()[0] || "U";
  return ch;
}

/** このページ内でも照合キーは正規化して使う */
const normalizeHost = (s: string) => (s || "").normalize("NFKC").trim();

/* ---------- ページ本体 ---------- */
export default function HostInboxPage() {
  const sp = useSearchParams();
  const hostRaw = (sp?.get("host") || "Linkle運営事務局").trim();
  const hostName = hostRaw;                  // 画面表示用（そのまま）
  const hostKey = normalizeHost(hostRaw);    // 照合用（正規化）

  const [typeFilter, setTypeFilter] =
    React.useState<"all" | "join-request" | "message">("all");
  const [search, setSearch] = React.useState("");

  const [items, setItems] = React.useState<HostNotification[]>(() =>
    getNotifications(hostKey)
  );
  const [unread, setUnread] = React.useState<number>(() =>
    unreadCount(hostKey)
  );

  const refresh = React.useCallback(() => {
    setItems(getNotifications(hostKey));
    setUnread(unreadCount(hostKey));
  }, [hostKey]);

  React.useEffect(() => {
    refresh();
    const onStorage = (e: StorageEvent) => {
      if (e.key === "host:notifications") {
        refresh();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [refresh]);

  const filtered = React.useMemo(() => {
    return items.filter((n) => {
      if (typeFilter !== "all" && n.type !== typeFilter) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const hay = `${n.listingTitle} ${n.applicant?.name ?? ""} ${n.type}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [items, typeFilter, search]);

  return (
    <div className="mx-auto max-w-3xl p-4 bg-gray-50 min-h-screen">
      {/* ヘッダー */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-xl font-bold">主催者受信箱</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            主催者: <span className="font-medium">{hostName}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">未読 {unread} 件</span>
          <button
            className="px-3 py-1.5 rounded-full text-sm bg-white border border-gray-300 hover:bg-gray-50"
            onClick={() => {
              markAllRead(hostKey);
              refresh();
              window.dispatchEvent(
                new StorageEvent("storage", { key: "host:notifications" })
              );
            }}
          >
            すべて既読に
          </button>
        </div>
      </div>

      {/* ツールバー：白 + グレー枠 */}
      <div className="flex flex-wrap items-center gap-2 bg-white rounded-xl p-3 border border-gray-300 mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          type="text"
          placeholder="タイトル・申請者で検索"
          className="flex-1 min-w-[160px] rounded-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
        <select
          value={typeFilter}
          onChange={(e) =>
            setTypeFilter(e.target.value as "all" | "join-request" | "message")
          }
          className="rounded-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          <option value="all">すべて</option>
          <option value="join-request">参加申請</option>
          <option value="message">メッセージ</option>
        </select>
      </div>

      {/* 本文 */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 border border-gray-300 text-center text-gray-600">
          通知はありません
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((n) => (
            <li
              key={n.id}
              className="group rounded-2xl bg-white p-4 border border-gray-300"
            >
              <div className="flex items-start gap-3">
                {/* 左アイコン */}
                <div className="relative shrink-0">
                  <div className="h-10 w-10 rounded-full bg-gray-100 text-gray-700 grid place-items-center font-semibold border border-gray-300">
                    {initialAvatarText(n.applicant?.name)}
                  </div>
                  {n.status === "unread" && (
                    <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-amber-500 ring-2 ring-white" />
                  )}
                </div>

                {/* 中央 */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={[
                        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium border",
                        n.type === "join-request"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : "bg-emerald-50 text-emerald-700 border-emerald-200",
                      ].join(" ")}
                    >
                      {n.type === "join-request" ? "参加申請" : "メッセージ"}
                    </span>
                    {n.status === "unread" ? (
                      <span className="inline-flex items-center rounded-full bg-amber-50 text-amber-800 px-2 py-0.5 text-[11px] border border-amber-200">
                        未読
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-gray-100 text-gray-600 px-2 py-0.5 text-[11px] border border-gray-300">
                        既読
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-sm font-semibold leading-snug">
                    <Link
                      href={`/listings/${n.listingId}`}
                      className="text-gray-900 hover:text-blue-700 underline-offset-2 hover:underline"
                    >
                      {n.listingTitle}
                    </Link>
                  </p>

                  <p className="mt-0.5 text-sm text-gray-600 truncate">
                    申請者: {n.applicant?.name ?? "不明"}
                  </p>
                </div>

                {/* 右 */}
                <div className="text-right shrink-0">
                  <p className="text-[11px] text-gray-500">{timeAgo(n.when)}</p>
                  {n.status === "unread" && (
<button
  className="mt-2 text-xs px-2 py-1 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50"
  onClick={() => {
    markAsRead(n.id);

    // ✅ status をリテラル型で固定
    setItems((prev) =>
      prev.map<HostNotification>((x) =>
        x.id === n.id ? { ...x, status: "read" as const } : x
      )
    );

    setUnread((u) => Math.max(0, u - 1));

    window.dispatchEvent(
      new StorageEvent("storage", { key: "host:notifications" })
    );
  }}
>
  既読にする
</button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
        >
          トップに戻る
        </Link>
      </div>
    </div>
  );
}