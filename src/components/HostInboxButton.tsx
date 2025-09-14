// src/components/HostInboxButton.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { unreadCount } from "@/lib/host-inbox";
import { useSession } from "next-auth/react";

/**
 * ヘッダー用：主催者受信箱ボタン
 * - 未読があれば赤バッジを表示
 * - hostName は session.user.name → localStorage → 既定値の順で推定
 */
export default function HostInboxButton({
  className = "",
  asItem = false, // モバイルドロワーでリスト項目風に出したい場合 true
}: {
  className?: string;
  asItem?: boolean;
}) {
  const { data: session } = useSession();
  const [hostNameLS, setHostNameLS] = useState<string>("");

  // 初期ロード時に localStorage から後方互換のキーも含めて取得
  useEffect(() => {
    try {
      const v =
        localStorage.getItem("auth:hostName") ||
        localStorage.getItem("auth:displayName") ||
        "";
      setHostNameLS(v || "");
    } catch {
      setHostNameLS("");
    }
  }, []);

  // hostName を推定（優先度：session → LS → 既定値）
  const hostName = useMemo(() => {
    const s = (session?.user?.name || "").trim();
    if (s) return s;
    const l = (hostNameLS || "").trim();
    if (l) return l;
    return "Linkle運営事務局";
  }, [session?.user?.name, hostNameLS]);

  // 未読件数
  const [unread, setUnread] = useState<number>(() => unreadCount(hostName));

  // hostName 変化時や storage シグナルで更新
  useEffect(() => {
    const refresh = () => setUnread(unreadCount(hostName));
    refresh();
    const onStorage = (e: StorageEvent) => {
      if (e.key === "host:notifications") refresh();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [hostName]);

  const href = `/host/inbox?host=${encodeURIComponent(hostName)}`;

  if (asItem) {
    // モバイルドロワー用（行アイテム風）
    return (
      <Link
        href={href}
        className={[
          "relative px-4 py-2 rounded-xl text-sm text-gray-900 bg-white shadow-sm hover:bg-blue-50 hover:text-blue-700 transition text-center",
          className,
        ].join(" ")}
      >
        主催者受信箱
        {unread > 0 && (
          <span className="ml-2 inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-red-600 text-white text-[11px] leading-none">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </Link>
    );
  }

  // PC ヘッダー用（丸ボタン＋赤バッジ）
  return (
    <Link
      href={href}
      className={[
        "relative inline-flex items-center justify-center h-9 w-9 rounded-full hover:bg-blue-50 text-gray-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300",
        className,
      ].join(" ")}
      aria-label={unread > 0 ? `未読 ${unread} 件の受信箱` : "主催者受信箱"}
    >
      {/* メール/インボックス風アイコン */}
      <svg width="20" height="20" viewBox="0 0 24 24" className="text-gray-700">
        <path
          fill="currentColor"
          d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2m0 4-8 5L4 8V6l8 5l8-5z"
        />
      </svg>

      {unread > 0 && (
        <span
          className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-600 text-white text-[11px] leading-none grid place-items-center ring-2 ring-white"
          aria-hidden="true"
        >
          {unread > 99 ? "99+" : unread}
        </span>
      )}
    </Link>
  );
}