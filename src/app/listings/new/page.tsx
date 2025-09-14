// src/app/listings/new/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createListing } from "@/lib/mock-listings";

// ---------- 型定義 ----------
type Form = {
  category: "スポーツ" | "学習" | "趣味";
  title: string;
  date: string;     // YYYY-MM-DD
  pref: string;     // 都道府県
  city: string;     // 市区町村
  capacity: number; // 募集人数
  feeType: "無料" | "有料";
  imageUrl: string; // 任意
  description: string;
};

// ---------- 都道府県一覧 ----------
const PREFS = [
  "北海道","青森県","岩手県","宮城県","秋田県","山形県","福島県",
  "茨城県","栃木県","群馬県","埼玉県","千葉県","東京都","神奈川県",
  "新潟県","富山県","石川県","福井県","山梨県","長野県",
  "岐阜県","静岡県","愛知県","三重県",
  "滋賀県","京都府","大阪府","兵庫県","奈良県","和歌山県",
  "鳥取県","島根県","岡山県","広島県","山口県",
  "徳島県","香川県","愛媛県","高知県",
  "福岡県","佐賀県","長崎県","熊本県","大分県","宮崎県","鹿児島県","沖縄県"
];

export default function NewListingPage() {
  const router = useRouter();

  const [form, setForm] = useState<Form>({
    category: "スポーツ",
    title: "",
    date: "",
    pref: "東京都",
    city: "",
    capacity: 1,
    feeType: "無料",
    imageUrl: "",
    description: "",
  });
  const [err, setErr] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);

  const onChange = <K extends keyof Form>(key: K, val: Form[K]) =>
    setForm((f) => ({ ...f, [key]: val }));

  // submit処理
const submit = async () => {
  setErr(null);

  // 入力バリデーション
  if (!form.title.trim()) return setErr("タイトルは必須です。");
  if (!form.date) return setErr("開催日は必須です。");
  if (!form.pref.trim() || !form.city.trim()) return setErr("場所は必須です。");
  if (!Number.isFinite(form.capacity) || form.capacity < 1)
    return setErr("募集人数は1以上を入力してください。");

  setSubmitting(true);
  try {
    const id = createListing({
      category: form.category,
      title: form.title,
      date: form.date,
      place: `${form.pref} ${form.city}`,
      capacityLeft: form.capacity,
      feeType: form.feeType,
      imageUrl: form.imageUrl || undefined,
      description: form.description || undefined,
    });

    setSuccessId(id);
  } catch (e: any) {
    console.error(e);
    if (e?.message === "STORAGE_QUOTA") {
      setErr(
        "保存容量の上限に達しました。画像を小さくするか、古い募集を削除してからもう一度お試しください。"
      );
    } else {
      setErr("作成に失敗しました。時間をおいて再度お試しください。");
    }
  } finally {
    setSubmitting(false);
  }
};

  return (
    <div className="min-h-screen bg-white text-[#111827]">
      {/* Header（下線→シャドウ、戻るは共通デザイン） */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur shadow-sm">
        <div className="h-14 px-4 flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-2 -ml-1 px-2 py-1 rounded text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
            aria-label="トップへ戻る"
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
          </button>
          <div className="w-8" />
        </div>
      </header>

      {/* Form */}
      <main className="px-4 py-5 max-w-xl mx-auto">
  <form
    onSubmit={(e) => {
      e.preventDefault();
      if (submitting) return; // 二重実行ガード
      submit();
    }}
    noValidate
  >
        <div className="space-y-4">
          {/* カテゴリ */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">カテゴリ</label>
            <select
              value={form.category}
              onChange={(e) => onChange("category", e.target.value as Form["category"])}
              className="w-full rounded-xl px-4 py-2 text-sm bg-white shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
            >
              <option value="スポーツ">スポーツ</option>
              <option value="学習">学習</option>
              <option value="趣味">趣味</option>
            </select>
          </div>

          {/* タイトル */}
<input
  value={form.title}
  onChange={(e) => onChange("title", e.target.value)}
  type="text"
  placeholder="例）フットサルメンバー募集！"
  required                       // ★追加
  className="w-full rounded-xl px-4 py-2 text-sm bg-white shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
/>

{/* 開催日 */}
<input
  value={form.date}
  onChange={(e) => onChange("date", e.target.value)}
  type="date"
  required                       // ★追加
  className="w-full rounded-xl px-4 py-2 text-sm bg-white shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
/>

{/* 場所：市区町村 */}
<input
  value={form.city}
  onChange={(e) => onChange("city", e.target.value)}
  type="text"
  placeholder="市区町村（例：渋谷区）"
  required                       // ★追加
  className="w-full rounded-xl px-4 py-2 text-sm bg-white shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
/>

{/* 募集人数 */}
<input
  value={form.capacity}
  onChange={(e) => onChange("capacity", Number(e.target.value) || 0)}
  type="number"
  min={1}
  required                       // ★追加
  className="w-full rounded-xl px-4 py-2 text-sm bg-white shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
/>
 {/* 料金 */}
 <div>
   <label className="block text-sm text-gray-600 mb-1">料金</label>
   <select
     value={form.feeType}
     onChange={(e) => onChange("feeType", e.target.value as Form["feeType"])}
     className="w-full rounded-xl px-4 py-2 text-sm bg-white shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
   >
     <option value="無料">無料</option>
     <option value="有料">有料</option>
   </select>
 </div>
          {/* 画像アップロード */}
<div>
  <label className="block text-sm text-gray-600 mb-1">画像（任意）</label>

  <input
    type="file"
    accept="image/*"
    onChange={async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // サイズ制限（例: 2MB）
      const MAX = 1.5 * 1024 * 1024; // 1.5MB
      if (file.size > MAX) {
        setErr("画像サイズは 2MB 以下にしてください。");
        return;
      }

      // 画像を Data URL(Base64) に変換して form.imageUrl に保存
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange("imageUrl", (reader.result as string) || "");
      };
      reader.readAsDataURL(file);
    }}
    className="block w-full text-sm file:mr-3 file:rounded-lg file:border file:px-3 file:py-1.5 file:bg-white file:shadow-sm hover:file:bg-blue-50"
  />

  {/* プレビュー or NO IMAGE */}
  <div className="mt-2">
    {form.imageUrl ? (
      <img
        src={form.imageUrl}
        alt="プレビュー"
        className="h-32 w-full rounded-md object-cover bg-gray-100"
      />
    ) : (
      <div className="h-32 w-full grid place-items-center rounded-md bg-gray-100 text-gray-500 font-semibold">
        NO IMAGE
      </div>
    )}
  </div>

  {/* クリアボタン */}
  {form.imageUrl && (
    <button
      type="button"
      onClick={() => onChange("imageUrl", "")}
      className="mt-2 rounded-full px-3 py-1.5 text-sm bg-white shadow-sm hover:bg-blue-50"
    >
      画像をクリア
    </button>
  )}

  <p className="mt-2 text-xs text-gray-500">
    ※ 2MB まで。アップロードした画像はブラウザ内（localStorage）にのみ保存されます。
  </p>
</div>

          {/* 説明 */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">説明</label>
            <textarea
              value={form.description}
              onChange={(e) => onChange("description", e.target.value)}
              placeholder="イベントの概要、対象、集合場所、持ち物など"
              className="w-full rounded-xl px-4 py-2 text-sm h-28 bg-white shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
          </div>

          {/* エラー */}
          {err && <p className="text-sm text-red-600">{err}</p>}

          {/* 作成ボタン */}
          <button
        type="submit"              // ★ここを submit に
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
  </form>
</main>

      {/* 成功モーダル */}
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

/* ========= 成功モーダル ========= */
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
            className="w-full rounded-full py-2 text-sm bg-white shadow-sm hover:bg-blue-50 hover:text-blue-700 transition"
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