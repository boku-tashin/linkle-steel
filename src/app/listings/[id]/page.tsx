// src/app/listings/[id]/page.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
// ▼ 追加: React フック類を明示インポート
import React, { useMemo, useState, useEffect, useRef } from "react";
// ▼ 追加: Client で URL の id を取得
import { useParams } from "next/navigation";
import { deleteListing } from "@/lib/mock-listings";
import { hasJoined, join, leave } from "@/lib/join-store";
import { pushNotification } from "@/lib/host-inbox";
import {
  getListingById,
  getSimilarListings,
  getAllListings, //
  type Listing,
} from "@/lib/mock-listings";

// --------- ページ本体（params は Promise なので React.use() で unwrap）---------
// ▼ 修正: Client では props から params を受け取らず useParams を使う
export default function ListingDetailPage(/* { params }: { params: Promise<{ id: string }> } */) {
  // const { id } = use(params);
  const { id } = useParams<{ id: string }>(); // ← ここで id を取得

  // ★ Hooksは常に最上位で呼び出す（早期returnの前）
  const similar = useMemo(() => getSimilarListings(id, 4), [id]);

  // listingの取得（hookではないのでOK）
  const listing: Listing | undefined = getListingById(id);

  // 主催者の開催リストと集計
  const hostListings = useMemo(
    () => (listing?.host.name ? getAllListings().filter((l) => l.host.name === listing.host.name) : []),
    [listing?.host.name]
  );
  const hostEventsCount = hostListings.length;
  const hostTotalViews = useMemo(
    () => hostListings.reduce((sum, l) => sum + (l.views || 0), 0),
    [hostListings]
  );

  // 主催者の自己紹介を description から抽出
  const hostBio = useMemo(() => pickHostBio(listing?.description), [listing?.description]);

  // 既存の isFav / isMine / isLoggedIn / delConfirmOpen 定義一式をこのブロックで上書き
  const [isFav, setFav] = useState(false);
  const [isMine, setIsMine] = useState(false); // 自分の募集フラグ
  const [isLoggedIn, setIsLoggedIn] = useState(false); // ログイン状態
  const canDelete = isLoggedIn && isMine; // ★ 表示可否はここに集約
  const [delConfirmOpen, setDelConfirmOpen] = useState(false);

  // ※ 既存変数を保持（削除せず活かす）
  const [isJoined, setIsJoined] = React.useState(false);
  const [msg, setMsg] = React.useState<null | { type: "success" | "info" | "warn"; text: string }>(null);

  // ★ isMine は「ログインしている場合のみ」評価。未ログインなら false
  useEffect(() => {
    if (!listing) return;
    if (!isLoggedIn) {
      setIsMine(false);
      return;
    }
    try {
      const mine: string[] = JSON.parse(localStorage.getItem("auth:mine") || "[]");
      setIsMine(Array.isArray(mine) && mine.includes(listing.id));
    } catch {
      setIsMine(false);
    }
  }, [listing?.id, isLoggedIn]);

  // ★ ログイン状態の復元＆同期（同タブでも検知できるように focus/visibilitychange を追加）
  useEffect(() => {
    const read = () => {
      try {
        const raw = (localStorage.getItem("auth:loggedIn") || "").toString().trim().toLowerCase();
        setIsLoggedIn(raw === "1" || raw === "true" || raw === "yes" || raw === "on");
      } catch {
        setIsLoggedIn(false);
      }
    };

    // 初回
    read();

    // 別タブ更新 → storage
    const onStorage = (e: StorageEvent) => {
      if (e.key === "auth:loggedIn") read();
    };

    // 同タブでの変更後も検知：フォーカス復帰・可視化変更で再読込
    const onFocus = () => read();
    const onVisibility = () => {
      if (document.visibilityState === "visible") read();
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  // ★ 初期化：localStorage のお気に入りに現在の募集IDがあれば isFav=true
  useEffect(() => {
    if (!listing) return;
    try {
      const favs: string[] = JSON.parse(localStorage.getItem("auth:favs") || "[]");
      setFav(favs.includes(listing.id));
    } catch {
      setFav(false);
    }
  }, [listing?.id]);

  // ★ 追加/削除ハンドラ：localStorage("auth:favs") と同期
  const toggleFavorite = () => {
    if (!listing) return;
    setFav((prev) => {
      const next = !prev;
      let favs: string[] = [];
      try {
        favs = JSON.parse(localStorage.getItem("auth:favs") || "[]");
        if (!Array.isArray(favs)) favs = [];
      } catch {
        favs = [];
      }

      if (next) {
        // 追加（重複防止）
        if (!favs.includes(listing.id)) favs.push(listing.id);
      } else {
        // 削除
        favs = favs.filter((fid) => fid !== listing.id);
      }

      localStorage.setItem("auth:favs", JSON.stringify(favs));
      return next;
    });
  };

  // ▼ 参加フロー用 state（listingが未取得でも初期値が成立するように）
  const [localCapacityLeft, setLocalCapacityLeft] = useState(listing ? listing.capacityLeft : 0);
  const [joined, setJoined] = useState(false);

  // ★ 初期化：localStorage("auth:joined") / join-store を確認して参加状態を復元＋残枠も調整
  useEffect(() => {
    if (!listing) return;
    try {
      const joinedIds: string[] = JSON.parse(localStorage.getItem("auth:joined") || "[]");
      const isAlreadyJoined = (Array.isArray(joinedIds) && joinedIds.includes(listing.id)) || hasJoined(String(listing.id));
      setJoined(isAlreadyJoined);
      setIsJoined(isAlreadyJoined); // 既存stateとも同期
      setLocalCapacityLeft(Math.max(0, (listing.capacityLeft ?? 0) - (isAlreadyJoined ? 1 : 0)));
    } catch {
      setJoined(false);
      setIsJoined(false);
      setLocalCapacityLeft(listing.capacityLeft ?? 0);
    }
  }, [listing?.id]);

  // 別タブ/別ウィンドウでの参加状態更新を監視して同期
  useEffect(() => {
    if (!listing) return;
    const recalc = () => {
      try {
        const joinedIds: string[] = JSON.parse(localStorage.getItem("auth:joined") || "[]");
        const nowJoined =
          (Array.isArray(joinedIds) && joinedIds.includes(listing.id)) || hasJoined(String(listing.id));
        setJoined(nowJoined);
        setIsJoined(nowJoined);
        setLocalCapacityLeft(Math.max(0, (listing.capacityLeft ?? 0) - (nowJoined ? 1 : 0)));
      } catch {
        setJoined(false);
        setIsJoined(false);
        setLocalCapacityLeft(listing.capacityLeft ?? 0);
      }
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === "auth:joined") recalc();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [listing?.id, listing?.capacityLeft]);

  const [joinConfirmOpen, setJoinConfirmOpen] = useState(false);
  const [joinSuccessOpen, setJoinSuccessOpen] = useState(false);
  // 参加/取消の二重押し防止
  const [joining, setJoining] = useState(false);
  const [leaving, setLeaving] = useState(false);

  // ★ 参加解除用
  const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false);

  const requestLeave = () => {
    setLeaveConfirmOpen(true);
  };

  const confirmLeave = () => {
    if (leaving) return;
    setLeaving(true);
    setLeaveConfirmOpen(false);
    try {
      // 表示を即反映
      setJoined(false);
      setIsJoined(false); // 既存stateとも同期
      setLocalCapacityLeft((n) => Math.max(0, n + 1)); // 念のため0割れ防止

      // join-store と localStorage の両方を更新
      if (listing) leave(String(listing.id));
      try {
        let joinedIds: string[] = JSON.parse(localStorage.getItem("auth:joined") || "[]");
        if (!Array.isArray(joinedIds)) joinedIds = [];
        const next = joinedIds.filter((x) => x !== listing!.id);
        localStorage.setItem("auth:joined", JSON.stringify(next));
      } catch {
        localStorage.setItem("auth:joined", JSON.stringify([]));
      }

      setToast("参加を取り消しました");
      setMsg({ type: "info", text: "参加を取り消しました。" });
    } finally {
      setLeaving(false);
    }
  };

  // ▼ 問い合わせモーダル用の状態
  const [contactOpen, setContactOpen] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactMsg, setContactMsg] = useState("");
  const [sending, setSending] = useState(false);

  // ▼ 送信後のトースト
  const [toast, setToast] = useState<string | null>(null);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 1800);
    return () => clearTimeout(t);
  }, [toast]);

  const handleJoin = () => {
    // 直前の localStorage を再読込して最新のログイン状態に同期
    try {
      const raw = (localStorage.getItem("auth:loggedIn") || "").toString().trim().toLowerCase();
      const nowLoggedIn = raw === "1" || raw === "true" || raw === "yes" || raw === "on";
      if (nowLoggedIn !== isLoggedIn) setIsLoggedIn(nowLoggedIn);
      if (!nowLoggedIn) {
        setMsg({ type: "warn", text: "参加にはログインが必要です。画面右上からログインしてください。" });
        return;
      }
    } catch {
      setMsg({ type: "warn", text: "参加にはログインが必要です。画面右上からログインしてください。" });
      return;
    }

    if (joining || joined || localCapacityLeft <= 0) return; // 二重押し/満員ガード
    setJoinConfirmOpen(true);
  };

  // 置き換え：参加確定
  const confirmJoin = async () => {
    if (joining) return;
    setJoining(true);
    setJoinConfirmOpen(false);

    try {
      // フェイク待ち
      await new Promise((r) => setTimeout(r, 400));

      // 画面状態を更新
      setJoined(true);
      setIsJoined(true);
      setLocalCapacityLeft((n) => Math.max(0, n - 1));

      // join-store へ保存
      if (listing) join(String(listing.id));

      // localStorage("auth:joined") も更新
      try {
        let joinedIds: string[] = JSON.parse(localStorage.getItem("auth:joined") || "[]");
        if (!Array.isArray(joinedIds)) joinedIds = [];
        if (listing && !joinedIds.includes(listing.id)) {
          joinedIds.push(listing.id);
          localStorage.setItem("auth:joined", JSON.stringify(joinedIds));
        }
      } catch {
        if (listing) localStorage.setItem("auth:joined", JSON.stringify([listing.id]));
      }

      // === 主催者へ通知（受信箱に1件追加） ===
      if (listing?.host?.name) {
        const hostName = String(listing.host.name).trim();
        const listingTitle = String(listing.title || "");
        const applicant =
          (typeof window !== "undefined" && localStorage.getItem("auth:displayName")) ||
          "ゲストユーザー";

        pushNotification({
          hostName,
          listingId: String(listing.id),
          listingTitle,
          applicant: { name: applicant },
          type: "join-request",
        });

        // 同一/別タブの受信箱に即時反映させるための軽いシグナル
        try {
          window.dispatchEvent(new StorageEvent("storage", { key: "host:notifications" }));
        } catch {}
      }
      // === /通知ここまで ===

      setJoinSuccessOpen(true);
      setMsg({ type: "success", text: "参加が確定しました。主催者からの連絡をお待ちください！" });
    } finally {
      setJoining(false);
    }
  };

  const handleDelete = () => {
    if (!listing) return;
    try {
      deleteListing(listing.id);
      setToast("募集を削除しました");
      // 少しトーストを見せてからトップへ
      setTimeout(() => {
        window.location.href = "/";
      }, 600);
    } finally {
      setDelConfirmOpen(false);
    }
  };

  // if (!listing) return notFound(); // ← Client なので使わない

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ★ 追加: listing が無い場合はインライン404を表示 */}
      {!listing ? (
        <InlineNotFound />
      ) : (
        <>
          {/* ヘッダー戻る */}
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm text-gray-700 hover:text-blue-700 transition-colors hover:bg-blue-50 px-2 py-1 rounded"
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
                一覧に戻る
              </Link>

              {/* 右側アクション：お気に入り＋（自分の募集なら）削除 */}
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleFavorite}
                  className={[
                    "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm transition-colors shadow-sm",
                    isFav ? "bg-blue-50 text-blue-700" : "hover:bg-blue-50 hover:text-blue-700",
                  ].join(" ")}
                  aria-pressed={isFav}
                >
                  {/* ハートSVGは既存のまま */}
                  <svg width="18" height="18" viewBox="0 0 24 24" className={isFav ? "text-blue-600" : "text-gray-600"}>
                    <path
                      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5A4.5 4.5 0 0 1 6.5 4c1.74 0 3.41.81 4.5 2.09A6 6 0 0 1 18 4a4.5 4.5 0 0 1 4 4.5c0 3.78-3.4 6.86-8.55 11.54z"
                      fill="currentColor"
                    />
                  </svg>

                  {isFav ? "お気に入り済み" : "お気に入り"}
                </button>
                {canDelete && (
                  <button
                    onClick={() => setDelConfirmOpen(true)}
                    className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm text-red-700 hover:text-white hover:bg-red-600 border border-red-300 shadow-sm transition-colors"
                  >
                    削除
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ヒーロー */}
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            {/* ヒーロー */}
            <HeroImage src={listing.imageUrl} alt={listing.title} />
          </div>

          {/* 本文 */}
          <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* 左：内容 */}
            <section className="lg:col-span-8 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                  {listing.category}
                </span>
                <span
                  className={[
                    "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
                    listing.feeType === "無料" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700",
                  ].join(" ")}
                >
                  {listing.feeType}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">{listing.title}</h1>

              {/* メタ情報 */}
              <div className="flex flex-wrap gap-2 text-sm text-gray-700">
                <Badge icon="calendar">{fmtDate(listing.date)}</Badge>
                <Badge icon="map">{listing.place}</Badge>
                <Badge icon="users">残り{localCapacityLeft}人</Badge>
              </div>

              {/* 説明 */}
              {listing.description && (
                <p className="leading-relaxed text-gray-700 whitespace-pre-wrap bg-white rounded-xl p-4 shadow-sm">{listing.description}</p>
              )}

              {/* ▼ 地図（Google Map埋め込み） */}
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">場所</h3>
                  <a
                    className="text-sm text-blue-700 hover:text-blue-900 hover:bg-blue-50 rounded px-2 py-1 transition-colors"
                    href={`https://www.google.com/maps/search/${encodeURIComponent(listing.place)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Googleマップで開く
                  </a>
                </div>

                <div className="relative h-56 w-full overflow-hidden rounded-lg bg-gray-100 shadow-inner">
                  <iframe
                    className="absolute inset-0 w-full h-full border-0"
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.google.com/maps?q=${encodeURIComponent(listing.place)}&output=embed`}
                  />
                  <div className="absolute bottom-2 left-2 right-2 rounded-md bg-white/90 px-3 py-2 text-sm text-gray-700 shadow">{listing.place}</div>
                </div>
              </div>

              {/* 参加ボックス（PC） */}
              <div className="hidden sm:flex items-center gap-3 bg-white rounded-xl p-4 shadow-sm">
                {!joined ? (
                  <>
                    <button
                      className="px-4 py-2 rounded-full bg-blue-600 text-white text-sm transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 active:translate-y-px disabled:opacity-60"
                      onClick={handleJoin}
                      disabled={localCapacityLeft <= 0 || joining}
                    >
                      {localCapacityLeft <= 0 ? "満員" : joining ? "処理中…" : "この募集に参加する"}
                    </button>
                    <button
                      className="px-4 py-2 rounded-full text-sm shadow-sm hover:bg-blue-50 hover:text-blue-700 transition-colors"
                      onClick={() => setFav((v) => !v)}
                    >
                      {isFav ? "お気に入りを外す" : "お気に入りに追加"}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="px-4 py-2 rounded-full text-sm shadow-sm hover:bg-blue-50 hover:text-blue-700 transition-colors disabled:opacity-60"
                      onClick={requestLeave}
                      disabled={leaving}
                    >
                      {leaving ? "処理中…" : "参加を取り消す"}
                    </button>
                    <button
                      className="px-4 py-2 rounded-full text-sm shadow-sm hover:bg-blue-50 hover:text-blue-700 transition-colors"
                      onClick={() => setFav((v) => !v)}
                    >
                      {isFav ? "お気に入りを外す" : "お気に入りに追加"}
                    </button>
                  </>
                )}
              </div>

              {/* 簡易メッセージ（参加/取消結果など） */}
              {msg && (
                <div
                  className={[
                    "mt-2 rounded-xl px-3 py-2 text-sm",
                    msg.type === "success" && "bg-emerald-50 text-emerald-800",
                    msg.type === "info" && "bg-blue-50 text-blue-800",
                    msg.type === "warn" && "bg-amber-50 text-amber-800",
                  ].join(" ")}
                  role="status"
                >
                  {msg.text}
                </div>
              )}

              {/* タグ */}
              {listing.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {listing.tags.map((t) => (
                    <span key={t} className="px-3 py-1.5 rounded-full text-xs text-gray-700 bg-white shadow-sm hover:bg-blue-50 hover:text-blue-700 transition-colors">
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </section>

            {/* 右：主催者カード */}
            <aside className="lg:col-span-4">
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <h3 className="font-semibold mb-3 text-gray-500">主催者</h3>
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-12 rounded-full overflow-hidden bg-gray-200">
                    {listing.host.avatarUrl ? (
                      <img
                        src={listing.host.avatarUrl}
                        alt={listing.host.name}
                        className="object-cover absolute inset-0 h-full w-full"
                        /*  ↑あなたのレイアウトに合わせて className はそのままでOK */
                        onError={(e) => {
                          const img = e.currentTarget;
                          img.onerror = null;
                          img.src = genInitialAvatar(listing.host.name);
                        }}
                      />
                    ) : (
                      <div className="h-full w-full grid place-items-center text-gray-500 text-sm">{listing.host.name?.[0] ?? "U"}</div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{listing.host.name}</p>
                    <p className="text-xs text-gray-500">本人確認：未設定</p>
                  </div>
                </div>

                {/* 主催者プロフィール詳細 */}
                <div className="mt-4 space-y-3 text-sm text-gray-700">
                  <div className="rounded-lg bg-gray-50 p-3 shadow-sm">
                    <p className="font-medium text-gray-800">自己紹介</p>
                    {hostBio ? <p className="mt-1 whitespace-pre-wrap">{hostBio}</p> : <p className="mt-1 text-gray-600">{listing.host.name}さんの自己紹介はまだありません。</p>}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-lg bg-white p-2 text-center shadow-sm">
                      <p className="text-xs text-gray-500">開催回数</p>
                      <p className="text-sm font-semibold text-gray-800">{hostEventsCount}</p>
                    </div>
                    <div className="rounded-lg bg-white p-2 text-center shadow-sm">
                      <p className="text-xs text-gray-500">累計参加</p>
                      <p className="text-sm font-semibold text-gray-800">—</p>
                    </div>
                    <div className="rounded-lg bg-white p-2 text-center shadow-sm">
                      <p className="text-xs text-gray-500">総閲覧</p>
                      <p className="text-sm font-semibold text-gray-800">{hostTotalViews}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-gray-600">
                  <InfoItem label="開催日" value={fmtDate(listing.date)} />
                  <InfoItem label="エリア" value={listing.place} />
                  <InfoItem label="費用" value={listing.feeType} />
                  <InfoItem label="残枠" value={`${localCapacityLeft}人`} />
                </div>

                <button
                  onClick={() => setContactOpen(true)}
                  className="mt-4 w-full px-4 py-2 rounded-full bg-blue-600 text-white text-sm transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 active:translate-y-px"
                >
                  主催者に問い合わせる
                </button>
              </div>
            </aside>
          </main>

          {/* 類似募集 */}
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-10">
            <h2 className="text-lg font-semibold mb-3">他のおすすめ</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {similar.map((s) => (
                <Link
                  key={s.id}
                  href={`/listings/${s.id}`}
                  className="group bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden"
                >
                  <div className="relative aspect-[3/2]">
                    <Image src={s.imageUrl} alt={s.title} fill sizes="(max-width: 640px) 50vw, 25vw" className="object-cover" />
                  </div>
                  <div className="p-3 space-y-1">
                    <p className="text-sm font-medium line-clamp-2 group-hover:text-blue-700 transition-colors">{s.title}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {fmtDate(s.date)} ・ {s.place}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* モバイル固定CTA（罫線撤去→シャドウに） */}
          <div className="fixed inset-x-0 bottom-0 sm:hidden bg-white/95 backdrop-blur shadow-[0_-4px_10px_rgba(0,0,0,0.06)] p-3">
            <div className="mx-auto max-w-6xl px-2 flex items-center gap-2">
              {!joined ? (
                <>
                  <button
                    className="flex-1 px-4 py-2 rounded-full bg-blue-600 text-white text-sm transition-colors hover:bg-blue-700 active:translate-y-px disabled:opacity-60"
                    onClick={handleJoin}
                    disabled={localCapacityLeft <= 0}
                  >
                    {localCapacityLeft <= 0 ? "満員" : joinConfirmOpen ? "処理中…" : "参加する"}
                  </button>
                  <button
                    onClick={() => setFav((v) => !v)}
                    disabled={joinConfirmOpen}
                    className={[
                      "px-4 py-2 rounded-full text-sm transition-colors shadow-sm",
                      isFav ? "bg-blue-50 text-blue-700" : "hover:bg-blue-50 hover:text-blue-700",
                      joinConfirmOpen ? "opacity-60 cursor-not-allowed" : "",
                    ].join(" ")}
                  >
                    {isFav ? "お気に入り済" : "お気に入り"}
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="flex-1 px-4 py-2 rounded-full text-sm shadow-sm hover:bg-blue-50 hover:text-blue-700 active:translate-y-px disabled:opacity-60"
                    onClick={requestLeave}
                    disabled={leaveConfirmOpen}
                  >
                    {leaveConfirmOpen ? "取り消し中…" : "参加を取り消す"}
                  </button>
                  <button
                    onClick={() => setFav((v) => !v)}
                    disabled={leaveConfirmOpen}
                    className={[
                      "px-4 py-2 rounded-full text-sm transition-colors shadow-sm",
                      isFav ? "bg-blue-50 text-blue-700" : "hover:bg-blue-50 hover:text-blue-700",
                      leaveConfirmOpen ? "opacity-60 cursor-not-allowed" : "",
                    ].join(" ")}
                  >
                    {isFav ? "お気に入り済" : "お気に入り"}
                  </button>
                </>
              )}
            </div>
            <div className="h-[env(safe-area-inset-bottom)]" />
          </div>

          {/* 参加確認モーダル */}
          {joinConfirmOpen && (
            <ConfirmModal
              title="この募集に参加しますか？"
              description={`${fmtDate(listing.date)}・${listing.place}\n参加申請を送信します。`}
              confirmText="参加する"
              cancelText="戻る"
              onCancel={() => setJoinConfirmOpen(false)}
              onConfirm={confirmJoin}
            />
          )}

          {/* 参加解除確認モーダル */}
          {leaveConfirmOpen && (
            <ConfirmModal
              title="参加を取り消しますか？"
              description="この募集の参加状態を取り消します。よろしいですか？"
              confirmText="取り消す"
              cancelText="戻る"
              onCancel={() => setLeaveConfirmOpen(false)}
              onConfirm={confirmLeave}
            />
          )}

          {/* 参加成功モーダル */}
          {joinSuccessOpen && <SuccessModal title="参加申請を送信しました" message="主催者からの連絡をお待ちください。メッセージが届き次第、通知します。" onClose={() => setJoinSuccessOpen(false)} />}

          {/* 問い合わせモーダル */}
          {contactOpen && (
            <ContactModal
              open={contactOpen}
              onClose={() => setContactOpen(false)}
              sending={sending}
              name={contactName}
              message={contactMsg}
              onChangeName={setContactName}
              onChangeMessage={setContactMsg}
              onSubmit={async () => {
                if (!contactName.trim() || !contactMsg.trim()) {
                  setToast("お名前とメッセージを入力してください");
                  return;
                }
                try {
                  setSending(true);

                  // --- ここで主催者通知を送る ---
                  if (listing?.host?.name) {
                    const hostName = String(listing.host.name).trim();
                    pushNotification({
                      hostName,
                      listingId: String(listing.id),
                      listingTitle: String(listing.title || ""),
                      applicant: { name: contactName.trim() || "ゲストユーザー" },
                      type: "message",
                    });
                  }
                  // ------------------------------

                  await new Promise((r) => setTimeout(r, 800));
                  setToast("お問い合わせを送信しました");
                  setContactOpen(false);
                  setContactMsg("");
                } finally {
                  setSending(false);
                }
              }}
            />
          )}

          {delConfirmOpen && (
            <ConfirmModal
              title="この募集を削除しますか？"
              description="この操作は取り消せません。作成した募集を完全に削除します。"
              confirmText="削除する"
              cancelText="戻る"
              onCancel={() => setDelConfirmOpen(false)}
              onConfirm={handleDelete}
            />
          )}

          {/* トースト */}
          {toast && (
            <div className="fixed bottom-4 right-4 z-50 rounded-lg bg-gray-900 text-white px-4 py-2 text-sm shadow-lg" role="status" aria-live="polite">
              {toast}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// === ヒーロー画像用ユーティリティ & コンポーネント ===
function isEmptyImage(src?: string | null) {
  if (!src) return true;
  const s = String(src).trim();
  if (!s) return true;
  // 既存データに残っている疑似プレースホルダは「画像なし」とみなす
  if (s === "/sample/new.svg" || s.toLowerCase() === "noimage" || s.toLowerCase() === "no-image") {
    return true;
  }
  return false;
}

function HeroImage({ src, alt }: { src?: string; alt: string }) {
  const [broken, setBroken] = React.useState(false);
  const showFallback = isEmptyImage(src) || broken;

  return (
    <div className="relative w-full aspect-[16/9] overflow-hidden rounded-2xl bg-gray-100 shadow-sm flex items-center justify-center">
      {!showFallback ? (
        <Image
          src={src!}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 1024px"
          className="object-cover"
          priority
          unoptimized
          onError={() => setBroken(true)}
        />
      ) : (
        <span className="text-gray-500 font-semibold">NO IMAGE</span>
      )}
    </div>
  );
}

// --------- 小物 ----------
function Badge({
  icon,
  children,
}: {
  icon: "calendar" | "map" | "users";
  children: React.ReactNode;
}) {
  const path =
    icon === "calendar"
      ? "M7 2v2H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2V2h-2v2H9V2z"
      : icon === "map"
      ? "M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5z"
      : "M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3m-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3m0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C18 14.17 13.33 13 11 13m5 0c.29 0 .62.02.97.05C19.08 13.38 22 14.07 22 16v3h-6z";
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 shadow-sm">
      <svg width="14" height="14" viewBox="0 0 24 24" className="text-gray-500">
        <path d={path} fill="currentColor" />
      </svg>
      {children}
    </span>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white p-2 shadow-sm">
      <p className="text-[11px] text-gray-500">{label}</p>
      <p className="text-sm font-medium text-gray-800 truncate">{value}</p>
    </div>
  );
}

// ▼ 汎用モーダル UI（確認）
function ConfirmModal({
  title,
  description,
  confirmText = "OK",
  cancelText = "キャンセル",
  onConfirm,
  onCancel,
}: {
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" role="dialog" aria-modal="true" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/40" aria-hidden="true" />
      <div className="relative w-full sm:w-[440px] bg-white rounded-t-2xl sm:rounded-2xl p-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-3 sm:hidden" />
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {description && <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">{description}</p>}
        <div className="mt-4 flex items-center justify-end gap-2">
          <button onClick={onCancel} className="px-4 py-2 rounded-full text-sm hover:bg-blue-50 hover:text-blue-700 transition-colors">
            {cancelText}
          </button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-full bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors">
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

// ▼ 成功モーダル
function SuccessModal({
  title,
  message,
  onClose,
}: {
  title: string;
  message?: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative w-full sm:w-[440px] bg-white rounded-t-2xl sm:rounded-2xl p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-3 sm:hidden" />
        <div className="flex items-start gap-3">
          <div className="mt-1 h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path fill="currentColor" d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {message && <p className="mt-1 text-sm text-gray-700">{message}</p>}
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-full bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors">
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

// ▼ 問い合わせモーダル
function ContactModal({
  open,
  onClose,
  sending,
  name,
  message,
  onChangeName,
  onChangeMessage,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  sending: boolean;
  name: string;
  message: string;
  onChangeName: (v: string) => void;
  onChangeMessage: (v: string) => void;
  onSubmit: () => void | Promise<void>;
}) {
  const dialogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) dialogRef.current?.focus();
  }, [open]);

  if (!open) return null;

  return (
    <div
      // ▼ 修正: 誤記 `justify中心` → `justify-center`
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40" aria-hidden="true" />
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="relative w-full sm:w-[480px] bg-white rounded-t-2xl sm:rounded-2xl p-4 shadow-xl outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-3 sm:hidden" />
        <h3 className="text-lg font-semibold">主催者に問い合わせる</h3>
        <p className="mt-1 text-sm text-gray-600">参加希望や質問など、主催者にメッセージを送れます。</p>

        <div className="mt-4 space-y-3">
          <label className="block text-sm">
            お名前
            <input
              value={name}
              onChange={(e) => onChangeName(e.target.value)}
              type="text"
              placeholder="山田 太郎"
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </label>

          <label className="block text-sm">
            メッセージ
            <textarea
              value={message}
              onChange={(e) => onChangeMessage(e.target.value)}
              placeholder="はじめまして。参加を検討しています。いくつか質問があります。"
              rows={5}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </label>
        </div>

        <div className="mt-4 flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-full text-sm hover:bg-blue-50 hover:text-blue-700 transition-colors">
            閉じる
          </button>
          <button
            onClick={onSubmit}
            disabled={sending}
            className={["px-4 py-2 rounded-full text-white text-sm transition-colors", sending ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"].join(" ")}
          >
            {sending ? "送信中…" : "送信する"}
          </button>
        </div>
      </div>
    </div>
  );
}

// --------- util ----------
function fmtDate(yyyyMMdd: string) {
  const d = new Date(yyyyMMdd);
  const w = ["日", "月", "火", "水", "木", "金", "土"][d.getDay()];
  return `${d.getMonth() + 1}/${d.getDate()}(${w})`;
}

function pickHostBio(desc?: string | null) {
  if (!desc) return null;
  const marker = "— 主催者自己紹介 —";
  const i = desc.indexOf(marker);
  if (i === -1) return null;
  return desc.slice(i + marker.length).trim();
}

// ★ 追記: Client 用の簡易 Not Found UI
function InlineNotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md text-center space-y-3">
        <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" className="text-gray-500">
            <path fill="currentColor" d="M11 7h2v6h-2zm0 8h2v2h-2zM1 21h22L12 2L1 21z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-gray-900">募集が見つかりませんでした</h2>
        <p className="text-sm text-gray-600">URL が正しいか、すでに終了していないかをご確認ください。</p>
        <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors">
          トップへ戻る
        </Link>
      </div>
    </div>
  );
}

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