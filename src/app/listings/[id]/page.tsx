// src/app/listings/[id]/page.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
// ▼ 修正: React から use を削除
import React, { /* use, */ useMemo, useState, useEffect, useRef } from "react";
// import { notFound } from "next/navigation";
// ▼ 追加: Client で動的ルートの id を取得
import { useParams } from "next/navigation";
import {
  getListingById,
  getSimilarListings,
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

  const [isFav, setFav] = useState(false);

  // ▼ 参加フロー用 state（listingが未取得でも初期値が成立するように）
  const [localCapacityLeft, setLocalCapacityLeft] = useState(
    listing ? listing.capacityLeft : 0
  );
  const [joined, setJoined] = useState(false);
  const [joinConfirmOpen, setJoinConfirmOpen] = useState(false);
  const [joinSuccessOpen, setJoinSuccessOpen] = useState(false);

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

  // ▼ 参加ボタンの実行
  const handleJoin = () => {
    setJoinConfirmOpen(true);
  };
  const confirmJoin = async () => {
    setJoinConfirmOpen(false);
    await new Promise((r) => setTimeout(r, 600));
    setJoined(true);
    setLocalCapacityLeft((n) => Math.max(0, n - 1));
    setJoinSuccessOpen(true);
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
                一覧に戻る
              </Link>

              <button
                onClick={() => setFav((v) => !v)}
                className={[
                  "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors",
                  isFav
                    ? "border-blue-300 bg-blue-50 text-blue-700"
                    : "hover:bg-blue-50 hover:border-blue-300",
                ].join(" ")}
                aria-pressed={isFav}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" className={isFav ? "text-blue-600" : "text-gray-600"}>
                  <path
                    d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5A4.5 4.5 0 0 1 6.5 4c1.74 0 3.41.81 4.5 2.09A6 6 0 0 1 18 4a4.5 4.5 0 0 1 4 4.5c0 3.78-3.4 6.86-8.55 11.54z"
                    fill="currentColor"
                  />
                </svg>
                {isFav ? "お気に入り済み" : "お気に入り"}
              </button>
            </div>
          </div>

          {/* ヒーロー */}
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="relative w-full aspect-[16/9] overflow-hidden rounded-2xl bg-gray-100 shadow-sm">
              <Image
                src={listing.imageUrl}
                alt={listing.title}
                fill
                sizes="(max-width: 768px) 100vw, 1024px"
                className="object-cover"
                priority
              />
            </div>
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
                    listing.feeType === "無料"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-amber-50 text-amber-700",
                  ].join(" ")}
                >
                  {listing.feeType}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                {listing.title}
              </h1>

              {/* メタ情報 */}
              <div className="flex flex-wrap gap-2 text-sm text-gray-700">
                <Badge icon="calendar">{fmtDate(listing.date)}</Badge>
                <Badge icon="map">{listing.place}</Badge>
                <Badge icon="users">残り{localCapacityLeft}人</Badge>
              </div>

              {/* 説明 */}
              {listing.description && (
                <p className="leading-relaxed text-gray-700 whitespace-pre-wrap bg-white rounded-xl p-4 shadow-sm">
                  {listing.description}
                </p>
              )}

              {/* ▼ 地図（簡易） */}
              <div className="bg-white rounded-xl p-4 border shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">場所</h3>
                  <a
                    className="text-sm text-blue-700 hover:underline"
                    href={`https://www.google.com/maps/search/${encodeURIComponent(listing.place)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Googleマップで開く
                  </a>
                </div>
                <div className="relative h-56 w-full overflow-hidden rounded-lg border bg-gray-100">
                  <svg viewBox="0 0 400 240" className="h-full w-full">
                    <defs>
                      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="1" />
                      </pattern>
                    </defs>
                    <rect width="400" height="240" fill="url(#grid)" />
                    <g transform="translate(200,120)">
                      <path d="M0,-32 C-16,-32 -28,-20 -28,-4 C-28,16 0,40 0,40 C0,40 28,16 28,-4 C28,-20 16,-32 0,-32 Z" fill="#2563eb" />
                      <circle cx="0" cy="-12" r="7" fill="white" />
                    </g>
                  </svg>
                  <div className="absolute bottom-2 left-2 right-2 rounded-md bg-white/90 px-3 py-2 text-sm text-gray-700 shadow">
                    {listing.place}
                  </div>
                </div>
              </div>

              {/* 参加ボックス（PC） */}
              <div className="hidden sm:flex items-center gap-3 bg-white rounded-xl p-4 border shadow-sm">
                <button
                  className="px-4 py-2 rounded-full bg-blue-600 text-white text-sm transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 active:translate-y-px disabled:opacity-60"
                  onClick={handleJoin}
                  disabled={joined || localCapacityLeft <= 0}
                >
                  {joined ? "参加済み" : localCapacityLeft <= 0 ? "満員" : "この募集に参加する"}
                </button>
                <button
                  className="px-4 py-2 rounded-full border text-sm hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors disabled:opacity-60"
                  onClick={() => setFav((v) => !v)}
                  disabled={joined && isFav}
                >
                  {isFav ? "お気に入りを外す" : "お気に入りに追加"}
                </button>
              </div>

              {/* タグ */}
              {listing.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {listing.tags.map((t) => (
                    <span
                      key={t}
                      className="px-3 py-1.5 rounded-full border text-xs text-gray-700 bg-white hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </section>

            {/* 右：主催者カード */}
            <aside className="lg:col-span-4">
              <div className="bg-white rounded-2xl border p-4 shadow-sm">
                <h3 className="font-semibold mb-3 text-gray-500">主催者</h3>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-gray-200" />
                  <div>
                    <p className="font-medium text-gray-900">{listing.host.name}</p>
                    <p className="text-xs text-gray-500">本人確認：未設定</p>
                  </div>
                </div>

                {/* 主催者プロフィール詳細 */}
                <div className="mt-4 space-y-3 text-sm text-gray-700">
                  <div className="rounded-lg border bg-gray-50 p-3">
                    <p className="font-medium text-gray-800">自己紹介</p>
                    <p className="mt-1">
                      はじめまして。{listing.host.name}です。初心者歓迎の雰囲気づくりを大切にしています。お気軽にご参加ください！
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-lg border bg-white p-2 text-center">
                      <p className="text-xs text-gray-500">開催回数</p>
                      <p className="text-sm font-semibold text-gray-800">12</p>
                    </div>
                    <div className="rounded-lg border bg-white p-2 text-center">
                      <p className="text-xs text-gray-500">累計参加</p>
                      <p className="text-sm font-semibold text-gray-800">87人</p>
                    </div>
                    <div className="rounded-lg border bg白 p-2 text-center">
                      <p className="text-xs text-gray-500">評価</p>
                      <p className="text-sm font-semibold text-gray-800">4.8/5</p>
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
                  className="group bg-white rounded-xl border shadow-sm hover:shadow-md transition overflow-hidden"
                >
                  <div className="relative aspect-[3/2]">
                    <Image
                      src={s.imageUrl}
                      alt={s.title}
                      fill
                      sizes="(max-width: 640px) 50vw, 25vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="p-3 space-y-1">
                    <p className="text-sm font-medium line-clamp-2 group-hover:text-blue-700 transition-colors">
                      {s.title}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {fmtDate(s.date)} ・ {s.place}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* モバイル固定CTA */}
          <div className="fixed inset-x-0 bottom-0 sm:hidden bg-white/95 backdrop-blur border-t p-3">
            <div className="mx-auto max-w-6xl px-2 flex items-center gap-2">
              <button
                className="flex-1 px-4 py-2 rounded-full bg-blue-600 text-white text-sm transition-colors hover:bg-blue-700 active:translate-y-px disabled:opacity-60"
                onClick={handleJoin}
                disabled={joined || localCapacityLeft <= 0}
              >
                {joined ? "参加済み" : localCapacityLeft <= 0 ? "満員" : "参加する"}
              </button>
              <button
                onClick={() => setFav((v) => !v)}
                className={[
                  "px-4 py-2 rounded-full border text-sm transition-colors",
                  isFav
                    ? "border-blue-300 bg-blue-50 text-blue-700"
                    : "hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700",
                ].join(" ")}
              >
                {isFav ? "お気に入り済" : "お気に入り"}
              </button>
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

          {/* 参加成功モーダル */}
          {joinSuccessOpen && (
            <SuccessModal
              title="参加申請を送信しました"
              message="主催者からの連絡をお待ちください。メッセージが届き次第、通知します。"
              onClose={() => setJoinSuccessOpen(false)}
            />
          )}

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

          {/* トースト */}
          {toast && (
            <div
              className="fixed bottom-4 right-4 z-50 rounded-lg bg-gray-900 text-white px-4 py-2 text-sm shadow-lg"
              role="status"
              aria-live="polite"
            >
              {toast}
            </div>
          )}
        </>
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
    <span className="inline-flex items-center gap-1 rounded-full bg-white border px-2.5 py-1">
      <svg width="14" height="14" viewBox="0 0 24 24" className="text-gray-500">
        <path d={path} fill="currentColor" />
      </svg>
      {children}
    </span>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-white p-2">
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
          <button onClick={onCancel} className="px-4 py-2 rounded-full border text-sm hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors">
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
      <div className="absolute inset-0 bg-black/40" aria-hidden="true" />
      <div className="relative w-full sm:w-[440px] bg-white rounded-t-2xl sm:rounded-2xl p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-3 sm:hidden" />
        <div className="flex items-start gap-3">
          <div className="mt-1 h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
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
        <p className="mt-1 text-sm text-gray-600">
          参加希望や質問など、主催者にメッセージを送れます。
        </p>

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

// --------- util ----------
function fmtDate(yyyyMMdd: string) {
  const d = new Date(yyyyMMdd);
  const w = ["日", "月", "火", "水", "木", "金", "土"][d.getDay()];
  return `${d.getMonth() + 1}/${d.getDate()}(${w})`;
}

// ★ 追記: Client 用の簡易 Not Found UI
function InlineNotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md text-center space-y-3">
        <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" className="text-gray-500">
            <path fill="currentColor" d="M11 7h2v6h-2zm0 8h2v2h-2zM1 21h22L12 2L1 21z"/>
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-gray-900">募集が見つかりませんでした</h2>
        <p className="text-sm text-gray-600">URL が正しいか、すでに終了していないかをご確認ください。</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors"
        >
          トップへ戻る
        </Link>
      </div>
    </div>
  );
}