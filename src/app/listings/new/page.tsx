// src/app/listings/new/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createListing } from "@/lib/mock-listings";

type Form = {
  category: "スポーツ" | "学習" | "趣味";
  title: string;
  date: string;     // YYYY-MM-DD
  place: string;    // 市区町村
  capacity: number; // 募集人数
  feeType: "無料" | "有料";
  imageUrl: string; // 任意
  description: string;
};

export default function NewListingPage() {
  const router = useRouter();

  const [form, setForm] = useState<Form>({
    category: "スポーツ",
    title: "",
    date: "",
    place: "",
    capacity: 1,
    feeType: "無料",
    imageUrl: "",
    description: "",
  });
  const [err, setErr] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // ▼ 追加：作成成功後に使う state（モーダル制御）
  const [successId, setSuccessId] = useState<string | null>(null);

  const onChange = <K extends keyof Form>(key: K, val: Form[K]) =>
    setForm((f) => ({ ...f, [key]: val }));

  // ← これが「submit」です（保存→成功モーダル表示）
  const submit = async () => {
    setErr(null);
    if (!form.title.trim()) return setErr("タイトルは必須です。");
    if (!form.date) return setErr("開催日は必須です。");
    if (!form.place.trim()) return setErr("場所は必須です。");
    if (!Number.isFinite(form.capacity) || form.capacity < 1)
      return setErr("募集人数は1以上を入力してください。");

    try {
      setSubmitting(true);

      const id = createListing({
        category: form.category,
        title: form.title,
        date: form.date,
        place: form.place,
        capacityLeft: form.capacity,
        feeType: form.feeType,
        imageUrl: form.imageUrl || undefined,
        description: form.description || undefined,
        // tags は未入力UIのため省略可能
      });

      // 旧: router.push(`/listings/${id}`);
      // 新: 成功モーダルに制御を渡す
      setSuccessId(id);
      setSubmitting(false);
    } catch (e) {
      console.error(e);
      setErr("作成に失敗しました。時間をおいて再度お試しください。");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#111827]">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b">
        <div className="h-14 px-4 flex items-center justify-between">
          <button
            onClick={() => history.back()}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100"
            aria-label="戻る"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" className="text-gray-700">
              <path fill="currentColor" d="m10 19l-7-7l7-7v14Zm2 0V5h9v14h-9Z" />
            </svg>
          </button>
          <h1 className="font-semibold">募集を作成</h1>
          <div className="w-8" />
        </div>
      </header>

      {/* Form */}
      <main className="px-4 py-5 max-w-xl mx-auto">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">カテゴリ</label>
            <select
              value={form.category}
              onChange={(e) => onChange("category", e.target.value as Form["category"])}
              className="w-full border rounded-xl px-4 py-2 text-sm bg-white"
            >
              <option value="スポーツ">スポーツ</option>
              <option value="学習">学習</option>
              <option value="趣味">趣味</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">タイトル</label>
            <input
              value={form.title}
              onChange={(e) => onChange("title", e.target.value)}
              type="text"
              placeholder="例）フットサルメンバー募集！"
              className="w-full border rounded-xl px-4 py-2 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">開催日</label>
              <input
                value={form.date}
                onChange={(e) => onChange("date", e.target.value)}
                type="date"
                className="w-full border rounded-xl px-4 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">費用</label>
              <select
                value={form.feeType}
                onChange={(e) => onChange("feeType", e.target.value as Form["feeType"])}
                className="w-full border rounded-xl px-4 py-2 text-sm bg-white"
              >
                <option value="無料">無料</option>
                <option value="有料">有料</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">場所（市区町村）</label>
            <input
              value={form.place}
              onChange={(e) => onChange("place", e.target.value)}
              type="text"
              placeholder="例）東京都 渋谷区"
              className="w-full border rounded-xl px-4 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">募集人数</label>
            <input
              value={form.capacity}
              onChange={(e) => onChange("capacity", Number(e.target.value) || 0)}
              type="number"
              min={1}
              className="w-full border rounded-xl px-4 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">
              画像URL（任意・画像は後でアップロード対応）
            </label>
            <input
              value={form.imageUrl}
              onChange={(e) => onChange("imageUrl", e.target.value)}
              type="url"
              placeholder="https://example.com/image.jpg"
              className="w-full border rounded-xl px-4 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">説明</label>
            <textarea
              value={form.description}
              onChange={(e) => onChange("description", e.target.value)}
              placeholder="イベントの概要、対象、集合場所、持ち物など"
              className="w-full border rounded-xl px-4 py-2 text-sm h-28"
            />
          </div>

          {err && <p className="text-sm text-red-600">{err}</p>}

          <button
            onClick={submit}
            disabled={submitting}
            className="w-full rounded-full bg-blue-600 text-white py-2 text-sm disabled:opacity-60 hover:bg-blue-700 active:translate-y-px transition"
          >
            {submitting ? "作成中..." : "この内容で作成する"}
          </button>
        </div>

        <p className="mt-4 text-[12px] text-gray-500 text-center">
          作成をタップすると、ガイドラインに同意したものとみなされます。
        </p>

        <div className="h-24" />
      </main>

      {/* ▼ 成功モーダル（追加） */}
      {successId && (
        <SuccessModal
          onClose={() => setSuccessId(null)}
          onGoDetail={() => router.push(`/listings/${successId}`)}
          onGoHome={() => router.push("/")}
        />
      )}
    </div>
  );
}

/* ========= 追加：成功モーダル ========= */
function SuccessModal({
  onClose,
  onGoDetail,
  onGoHome,
}: {
  onClose: () => void;
  onGoDetail: () => void;
  onGoHome: () => void;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  // Escapeキーで閉じる
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // フォーカスをモーダル内にとどめる簡易処理（最初の表示時にフォーカス）
  useEffect(() => {
    ref.current?.focus();
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="success-title"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40" />

      <div
        ref={ref}
        tabIndex={-1}
        className="relative mx-3 w-full max-w-md rounded-2xl bg-white p-5 shadow-xl outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <svg width="24" height="24" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"
            />
          </svg>
        </div>

        <h2 id="success-title" className="text-center text-lg font-bold text-gray-900">
          募集を作成しました！
        </h2>
        <p className="mt-1 text-center text-sm text-gray-600">
          内容の確認や共有ができます。次のアクションを選んでください。
        </p>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            onClick={onGoDetail}
            className="w-full rounded-full bg-blue-600 text-white py-2 text-sm hover:bg-blue-700 active:translate-y-px transition"
          >
            詳細へ進む
          </button>
          <button
            onClick={onGoHome}
            className="w-full rounded-full border py-2 text-sm hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition"
          >
            一覧へ戻る
          </button>
        </div>

        <button
          onClick={onClose}
          className="mt-3 w-full rounded-full py-2 text-sm text-gray-500 hover:bg-gray-50 transition"
        >
          とじる
        </button>
      </div>
    </div>
  );
}