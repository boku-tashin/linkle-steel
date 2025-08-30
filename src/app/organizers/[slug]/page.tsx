// src/app/organizers/[slug]/page.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import React, { use, useEffect, useMemo, useState } from "react";
import { getAllListings, type Listing } from "@/lib/mock-listings";

// Next 15 では params が Promise なので React.use() で unwrap
export default function OrganizerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  // slug → 表示名（例: "taro" / "ken" → "Taro"、"mika-sato" → "Mika Sato"）
  const displayName = useMemo(() => {
    return slug
      .split("-")
      .filter(Boolean)
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(" ");
  }, [slug]);

  const all: Listing[] = getAllListings();
  const hosted = useMemo(
    () => all.filter((l) => l.host?.name?.toLowerCase() === displayName.toLowerCase()),
    [all, displayName]
  );

  // 追加: タブ・検索・絞り込み・並び替え
  const [activeTab, setActiveTab] = useState<"events" | "profile" | "reviews" | "timeline">(
    "events"
  );
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<"すべて" | "スポーツ" | "学習" | "趣味">("すべて");
  const [order, setOrder] = useState<"開催日が近い順" | "閲覧数が多い順">("開催日が近い順");

  const filtered = useMemo(() => {
    let arr = [...hosted];
    if (q.trim()) {
      const k = q.trim().toLowerCase();
      arr = arr.filter(
        (l) =>
          l.title.toLowerCase().includes(k) ||
          l.place.toLowerCase().includes(k) ||
          l.tags?.some((t) => t.toLowerCase().includes(k))
      );
    }
    if (cat !== "すべて") {
      arr = arr.filter((l) => l.category === cat);
    }
    if (order === "開催日が近い順") {
      arr.sort((a, b) => (a.date > b.date ? 1 : -1));
    } else {
      arr.sort((a, b) => (b.views ?? 0) - (a.views ?? 0));
    }
    return arr;
  }, [hosted, q, cat, order]);

  // フォロー・問い合わせ
  const [following, setFollowing] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactMsg, setContactMsg] = useState("");
  const [sending, setSending] = useState(false);

  // 共有・トースト
  const [toast, setToast] = useState<string | null>(null);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 1600);
    return () => clearTimeout(t);
  }, [toast]);

  // 追加: フォロー状態の永続化
  useEffect(() => {
    const key = `follow:${displayName.toLowerCase()}`;
    const saved = localStorage.getItem(key);
    if (saved) setFollowing(saved === "1");
  }, [displayName]);
  useEffect(() => {
    const key = `follow:${displayName.toLowerCase()}`;
    localStorage.setItem(key, following ? "1" : "0");
  }, [displayName, following]);

  // 共有
  const copyShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setToast("ページURLをコピーしました");
    } catch {
      setToast("コピーに失敗しました");
    }
  };
  const shareToX = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`${displayName} さんの主催ページ`);
    window.open(`https://x.com/intent/tweet?url=${url}&text=${text}`, "_blank", "noopener,noreferrer");
  };
  const shareToLINE = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://line.me/R/msg/text/?${url}`, "_blank", "noopener,noreferrer");
  };

  // 統計
  const stats = useMemo(() => {
    const events = hosted.length;
    const totalCapacity = hosted.reduce((s, l) => s + (l.capacityLeft ?? 0), 0);
    const avgViews =
      hosted.length > 0
        ? Math.round(hosted.reduce((s, l) => s + (l.views ?? 0), 0) / hosted.length)
        : 0;
    return { events, totalCapacity, avgViews };
  }, [hosted]);

  // 追加: レビュー（ローカル状態）
  type Review = { id: string; author: string; rating: number; comment: string; date: string };
  const [reviews, setReviews] = useState<Review[]>([
    {
      id: "r1",
      author: "ゲストA",
      rating: 5,
      comment: "初参加でも安心でした！進行がスムーズで楽しかったです。",
      date: "2025-08-10",
    },
    {
      id: "r2",
      author: "ゲストB",
      rating: 4,
      comment: "説明が丁寧。次回も参加したいです。",
      date: "2025-08-14",
    },
  ]);
  const avgRating = useMemo(
    () => (reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "0.0"),
    [reviews]
  );
  const [newAuthor, setNewAuthor] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");

  // ▼ 追加: レビューの並び替えと永続化、通報
  const [reviewsOrder, setReviewsOrder] = useState<"新着順" | "高評価順">("新着順");

  // 読み込み
  useEffect(() => {
    const key = `org:${slug}:reviews`;
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setReviews(parsed);
      } catch {}
    }
  }, [slug]);

  // 保存
  useEffect(() => {
    const key = `org:${slug}:reviews`;
    localStorage.setItem(key, JSON.stringify(reviews));
  }, [slug, reviews]);

  // 通報（＝ローカルから削除）
  const reportReview = (id: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== id));
    setToast("レビューを通報しました（確認中）");
  };

  const submitReview = () => {
    if (!newAuthor.trim() || !newComment.trim()) {
      setToast("お名前とコメントを入力してください");
      return;
    }
    const r: Review = {
      id: String(Date.now()),
      author: newAuthor.trim(),
      rating: newRating,
      comment: newComment.trim(),
      date: new Date().toISOString().slice(0, 10),
    };
    setReviews((prev) => [r, ...prev]);
    setNewAuthor("");
    setNewRating(5);
    setNewComment("");
    setToast("レビューを投稿しました");
  };

  // 追加: 実績タイムライン（サンプル）
  const timeline: { date: string; title: string; desc: string }[] = [
    { date: "2024-05", title: "初開催", desc: "英会話カフェを初めて開催（参加5名）。" },
    { date: "2024-11", title: "累計10回達成", desc: "月1ペースで継続、リピーターも増加。" },
    { date: "2025-04", title: "新カテゴリ挑戦", desc: "写真散歩のイベントを新設。" },
    { date: "2025-08", title: "累計参加100人突破", desc: "多くの方にご参加いただきました。" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-700 hover:text-blue-700 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
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

          <div className="flex items-center gap-2">
            <button
              onClick={copyShare}
              className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors"
              aria-label="ページURLをコピー"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden className="text-gray-600">
                <path
                  fill="currentColor"
                  d="M10 13a5 5 0 0 0 7.54.54l2.12-2.12a5 5 0 1 0-7.07-7.07L11 5"
                />
                <path
                  fill="currentColor"
                  d="M14 11a5 5 0 0 0-7.54-.54L4.34 12.6a5 5 0 1 0 7.07 7.07L13 19"
                />
              </svg>
              共有
            </button>

            {/* 追加: X / LINE 共有 */}
            <button
              onClick={shareToX}
              className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors"
              aria-label="Xで共有"
              title="Xで共有"
            >
              <svg width="16" height="16" viewBox="0 0 1200 1227" aria-hidden>
                <path
                  d="M714 519 1160 0H1062L667 460 356 0H0l464 681L0 1227h98l418-486 328 486h356L714 519Zm-148 171-48-68L160 80h136l250 352 48 68 382 536H888L566 690Z"
                  fill="currentColor"
                />
              </svg>
              X
            </button>

            <button
              onClick={shareToLINE}
              className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors"
              aria-label="LINEで共有"
              title="LINEで共有"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
                <path
                  d="M20 3H4a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h3v3l5-3h8a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3Z"
                  fill="currentColor"
                />
              </svg>
              LINE
            </button>

            <button
              onClick={() => setFollowing((v) => !v)}
              className={[
                "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors",
                following
                  ? "border-blue-300 bg-blue-50 text-blue-700"
                  : "hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700",
              ].join(" ")}
              aria-pressed={following}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden className={following ? "text-blue-600" : "text-gray-600"}>
                <path
                  d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5A4.5 4.5 0 0 1 6.5 4c1.74 0 3.41.81 4.5 2.09A6 6 0 0 1 18 4a4.5 4.5 0 0 1 4 4.5c0 3.78-3.4 6.86-8.55 11.54z"
                  fill="currentColor"
                />
              </svg>
              {following ? "フォロー中" : "フォロー"}
            </button>
          </div>
        </div>
      </div>

      {/* プロフィールヘッダー */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-full bg-gray-200 overflow-hidden">
              <Image
                src="/sample/new.svg"
                alt={`${displayName} avatar`}
                width={64}
                height={64}
                className="h-16 w-16 object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                {displayName}
              </h1>
              <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                初心者歓迎の雰囲気づくりを大事にしています。まずは気軽にメッセージください！
              </p>

              {/* Stats */}
              <div className="mt-3 grid grid-cols-3 gap-2 sm:max-w-md">
                <Stat label="公開中" value={`${stats.events}件`} />
                <Stat label="残枠合計" value={`${stats.totalCapacity}人`} />
                <Stat label="平均閲覧" value={`${stats.avgViews}`} />
              </div>

              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={() => setContactOpen(true)}
                  className="px-4 py-2 rounded-full bg-blue-600 text-white text-sm transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 active:translate-y-px"
                >
                  主催者に問い合わせ
                </button>
                <Link
                  href="/"
                  className="px-4 py-2 rounded-full border text-sm hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors"
                >
                  他の募集を探す
                </Link>
              </div>
            </div>
          </div>

          {/* 追加: タブ */}
          <div className="mt-5 flex items-center gap-2 border-t pt-3">
            <TabButton label={`募集一覧（${hosted.length}）`} active={activeTab === "events"} onClick={() => setActiveTab("events")} />
            <TabButton label="プロフィール" active={activeTab === "profile"} onClick={() => setActiveTab("profile")} />
            <TabButton label={`レビュー（${reviews.length}）`} active={activeTab === "reviews"} onClick={() => setActiveTab("reviews")} />
            <TabButton label="実績" active={activeTab === "timeline"} onClick={() => setActiveTab("timeline")} />
          </div>
        </div>
      </div>

      {/* コンテンツ */}
      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === "profile" && <ProfileBlock displayName={displayName} />}

        {activeTab === "timeline" && <TimelineBlock items={timeline} />}

        {activeTab === "reviews" && (
          <ReviewsBlock
            reviews={reviews}
            avgRating={avgRating}
            newAuthor={newAuthor}
            newRating={newRating}
            newComment={newComment}
            setNewAuthor={setNewAuthor}
            setNewRating={setNewRating}
            setNewComment={setNewComment}
            onSubmit={submitReview}
            /* ▼ 追加: 並び替え・通報 */
            order={reviewsOrder}
            setOrder={setReviewsOrder}
            onReport={reportReview}
          />
        )}

        {activeTab === "events" && (
          <>
            {/* コントロールバー */}
            <div className="mb-4 flex flex-col sm:flex-row gap-3 sm:items-center">
              <div className="flex-1">
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  type="text"
                  placeholder="募集を検索（タイトル・場所・タグ）"
                  className="w-full rounded-full border px-4 py-2 text-sm bg-white shadow-sm focus:ring-2 focus:ring-blue-300 focus:outline-none"
                  aria-label="募集検索"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={cat}
                  onChange={(e) => setCat(e.target.value as typeof cat)}
                  className="border rounded-full px-3 py-2 text-sm bg-white"
                  aria-label="カテゴリ絞り込み"
                >
                  <option>すべて</option>
                  <option>スポーツ</option>
                  <option>学習</option>
                  <option>趣味</option>
                </select>
                <select
                  value={order}
                  onChange={(e) => setOrder(e.target.value as typeof order)}
                  className="border rounded-full px-3 py-2 text-sm bg-white"
                  aria-label="並び替え"
                >
                  <option>開催日が近い順</option>
                  <option>閲覧数が多い順</option>
                </select>
              </div>
            </div>

            {/* 募集一覧 */}
            {filtered.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((l) => (
                  <Link
                    key={l.id}
                    href={`/listings/${l.id}`}
                    className="group border rounded-2xl p-4 bg-white shadow-sm hover:shadow-md transition block"
                  >
                    <div className="relative w-full aspect-[3/2] mb-3 overflow-hidden rounded-xl">
                      <Image
                        src={l.imageUrl}
                        alt={l.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover group-hover:scale-[1.02] transition-transform"
                        priority={false}
                        onError={(e) => {
                          const img = e.currentTarget as HTMLImageElement;
                          img.src = "/sample/new.svg";
                        }}
                      />
                    </div>
                    <h3 className="font-semibold text-base text-gray-900 line-clamp-2 group-hover:text-blue-700 transition-colors">
                      {l.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">
                      {fmtDate(l.date)} ・ {l.place}
                    </p>
                    <div className="mt-2 text-xs text-gray-500 tabular-nums">
                      残り{l.capacityLeft}人 ・ {l.feeType}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* 問い合わせ（簡易モーダル） */}
      {contactOpen && (
        <SimpleContactModal
          onClose={() => setContactOpen(false)}
          name={contactName}
          message={contactMsg}
          sending={sending}
          onChangeName={setContactName}
          onChangeMessage={setContactMsg}
          onSubmit={async () => {
            if (!contactName.trim() || !contactMsg.trim()) {
              setToast("お名前とメッセージを入力してください");
              return;
            }
            try {
              setSending(true);
              await new Promise((r) => setTimeout(r, 700));
              setToast("メッセージを送信しました");
              setContactOpen(false);
              setContactMsg("");
            } finally {
              setSending(false);
            }
          }}
        />
      )}

      {/* トースト */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 rounded-lg bg-gray-900 text-white px-4 py-2 text-sm shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}

/* ---------- 小物 ---------- */
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-white p-2 text-center">
      <p className="text-[11px] text-gray-500">{label}</p>
      <p className="text-sm font-semibold text-gray-800 tabular-nums">{value}</p>
    </div>
  );
}

function TabButton({
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
        "px-4 py-2 rounded-full text-sm border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300",
        active ? "bg-blue-600 text-white border-blue-600" : "bg-white hover:bg-blue-50",
      ].join(" ")}
      aria-pressed={active}
    >
      {label}
    </button>
  );
}

function ProfileBlock({ displayName }: { displayName: string }) {
  return (
    <div className="bg-white rounded-2xl border p-5 shadow-sm">
      <h2 className="text-lg font-semibold">プロフィール</h2>
      <div className="mt-3 grid sm:grid-cols-2 gap-3">
        <div className="rounded-lg border bg-gray-50 p-3">
          <p className="font-medium text-gray-800">自己紹介</p>
          <p className="mt-1 text-sm text-gray-700">
            はじめまして。{displayName}です。初心者歓迎の雰囲気づくりを大切にしています。まずはお気軽にご連絡ください。
          </p>
        </div>
        <div className="rounded-lg border bg-gray-50 p-3">
          <p className="font-medium text-gray-800">方針・よくある質問</p>
          <ul className="mt-1 list-disc pl-5 text-sm text-gray-700 space-y-1">
            <li>遅刻・早退OK（事前に一言ください）</li>
            <li>初心者レクチャーあり</li>
            <li>道具は貸し出し可能な場合があります</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function TimelineBlock({ items }: { items: { date: string; title: string; desc: string }[] }) {
  return (
    <div className="bg-white rounded-2xl border p-5 shadow-sm">
      <h2 className="text-lg font-semibold">主催者の実績タイムライン</h2>
      <ol className="mt-4 relative border-s ps-4 space-y-4">
        {items.map((it, idx) => (
          <li key={`${it.date}-${idx}`} className="ms-2">
            <div className="absolute -start-1.5 mt-1.5 h-3 w-3 rounded-full bg-blue-600" />
            <div className="rounded-lg border bg-gray-50 p-3">
              <p className="text-xs text-gray-500">{it.date}</p>
              <p className="font-medium text-gray-800">{it.title}</p>
              <p className="text-sm text-gray-700 mt-1">{it.desc}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function ReviewsBlock(props: {
  reviews: { id: string; author: string; rating: number; comment: string; date: string }[];
  avgRating: string;
  newAuthor: string;
  newRating: number;
  newComment: string;
  setNewAuthor: (v: string) => void;
  setNewRating: (v: number) => void;
  setNewComment: (v: string) => void;
  onSubmit: () => void;
  /* ▼ 追加 */
  order: "新着順" | "高評価順";
  setOrder: (v: "新着順" | "高評価順") => void;
  onReport: (id: string) => void;
}) {
  const {
    reviews,
    avgRating,
    newAuthor,
    newRating,
    newComment,
    setNewAuthor,
    setNewRating,
    setNewComment,
    onSubmit,
    /* ▼ 追加 */
    order,
    setOrder,
    onReport,
  } = props;

  // 並び替え適用
  const sorted = [...reviews].sort((a, b) => {
    if (order === "高評価順") return b.rating - a.rating || (b.date > a.date ? 1 : -1);
    return a.date > b.date ? -1 : 1; // 新着順
  });

  return (
    <div className="bg-white rounded-2xl border p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">レビュー / 評価一覧</h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <StarRow value={Number(avgRating)} />
            <span className="text-sm text-gray-700 tabular-nums">{avgRating}</span>
            <span className="text-xs text-gray-500">({reviews.length})</span>
          </div>
          {/* ▼ 追加: 並び替え */}
          <select
            value={order}
            onChange={(e) => setOrder(e.target.value as typeof order)}
            className="border rounded-full px-2.5 py-1.5 text-xs bg-white"
            aria-label="並び替え"
          >
            <option>新着順</option>
            <option>高評価順</option>
          </select>
        </div>
      </div>

      {/* 投稿フォーム */}
      <div className="mt-4 grid sm:grid-cols-[1fr_auto] gap-3 items-start">
        <div className="grid sm:grid-cols-2 gap-2">
          <input
            value={newAuthor}
            onChange={(e) => setNewAuthor(e.target.value)}
            type="text"
            placeholder="お名前"
            className="w-full rounded-xl border px-3 py-2 text-sm"
          />
          <select
            value={newRating}
            onChange={(e) => setNewRating(Number(e.target.value))}
            className="rounded-xl border px-3 py-2 text-sm"
          >
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {n} ★
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={onSubmit}
          className="sm:row-span-2 px-4 py-2 rounded-full bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors"
        >
          投稿する
        </button>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          rows={3}
          placeholder="コメント"
          className="sm:col-span-1 rounded-xl border px-3 py-2 text-sm"
        />
      </div>

      {/* 一覧 */}
      <ul className="mt-5 space-y-3">
        {sorted.map((r) => (
          <li key={r.id} className="rounded-xl border bg-gray-50 p-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-800">{r.author}</p>
              <div className="flex items-center gap-2">
                <StarRow value={r.rating} />
                <span className="text-xs text-gray-500">{r.date}</span>
              </div>
            </div>
            <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{r.comment}</p>

            {/* ▼ 追加: 通報（ローカル削除） */}
            <div className="mt-2 text-right">
              <button
                onClick={() => onReport(r.id)}
                className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs text-gray-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors"
                aria-label="レビューを通報"
                title="レビューを通報"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" className="text-gray-500">
                  <path fill="currentColor" d="M4 4h2l3 7v9h2v-9l3-7h2l-3 7h6v2h-6l3 7h-2l-3-7l-3 7H6l3-7H4V4Z"/>
                </svg>
                通報
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function StarRow({ value }: { value: number }) {
  // 5段階で点数分だけ塗る
  return (
    <div className="flex items-center gap-0.5" aria-label={`評価 ${value} / 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24" className={i <= value ? "text-amber-400" : "text-gray-300"}>
          <path
            fill="currentColor"
            d="m12 17.27 6.18 3.73-1.64-7.03 5.46-4.73-7.19-.62L12 2 9.19 8.62l-7.19.62 5.46 4.73L5.82 21z"
          />
        </svg>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border bg-white p-8 text-center text-gray-600">
      <div className="mx-auto h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
        <svg width="28" height="28" viewBox="0 0 24 24" className="text-gray-400">
          <path
            fill="currentColor"
            d="M10 17H5V7h5v10m1-12H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h7l5 3V4l-5 3Z"
          />
        </svg>
      </div>
      <p className="mt-3 font-medium">公開中の募集はありません</p>
      <p className="text-sm">条件を変えて再検索してみてください。</p>
    </div>
  );
}

function SimpleContactModal({
  onClose,
  name,
  message,
  onChangeName,
  onChangeMessage,
  onSubmit,
  sending,
}: {
  onClose: () => void;
  name: string;
  message: string;
  onChangeName: (v: string) => void;
  onChangeMessage: (v: string) => void;
  onSubmit: () => void | Promise<void>;
  sending: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40" aria-hidden="true" />
      <div
        className="relative w-full sm:w-[480px] bg-white rounded-t-2xl sm:rounded-2xl p-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-3 sm:hidden" />
        <h3 className="text-lg font-semibold">主催者に問い合わせ</h3>
        <div className="mt-3 space-y-3">
          <label className="block text-sm">
            お名前
            <input
              value={name}
              onChange={(e) => onChangeName(e.target.value)}
              type="text"
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="山田 太郎"
            />
          </label>
          <label className="block text-sm">
            メッセージ
            <textarea
              value={message}
              onChange={(e) => onChangeMessage(e.target.value)}
              rows={5}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="はじめまして、参加を検討しています…"
            />
          </label>
        </div>

        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full border text-sm hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors"
          >
            閉じる
          </button>
          <button
            onClick={onSubmit}
            disabled={sending}
            className={[
              "px-4 py-2 rounded-full text-white text-sm transition-colors",
              sending ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700",
            ].join(" ")}
          >
            {sending ? "送信中…" : "送信する"}
          </button>
        </div>
      </div>
    </div>
  );
}

function fmtDate(yyyyMMdd: string) {
  const d = new Date(yyyyMMdd);
  const w = ["日", "月", "火", "水", "木", "金", "土"][d.getDay()];
  return `${d.getMonth() + 1}/${d.getDate()}(${w})`;
}