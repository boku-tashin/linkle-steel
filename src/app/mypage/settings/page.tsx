// src/app/mypage/settings/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { signOut } from "next-auth/react";

/** 都道府県一覧（47） */
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

/** 設定データ型（MVP: ローカル保存） */
type Settings = {
  nickname: string;
  email: string;
  avatarUrl: string;
  bio: string;
  pref: string;
  city: string;
  interests: string[];
  notifyEmail: boolean;
  notifyPush: boolean;
};

const DEFAULT: Settings = {
  nickname: "",
  email: "",
  avatarUrl: "",
  bio: "",
  pref: "東京都",
  city: "",
  interests: [],
  notifyEmail: true,
  notifyPush: true,
};

export default function MyPageSettings() {
  const router = useRouter();

  const [data, setData] = useState<Settings>(DEFAULT);
  const [pwd1, setPwd1] = useState("");
  const [pwd2, setPwd2] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // アバターアップロード
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const onPickFile = () => fileRef.current?.click();
  const onFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("画像ファイルを選択してください");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPreview(String(reader.result));
    reader.readAsDataURL(file);
  };
  const saveAvatar = async () => {
    if (!preview) return;
    setUploading(true);
    try {
      setData((d) => ({ ...d, avatarUrl: preview }));
      localStorage.setItem("linkle:settings", JSON.stringify({ ...data, avatarUrl: preview }));
      setPreview(null);
      setToast("アバターを更新しました");
    } finally {
      setUploading(false);
      setTimeout(() => setToast(null), 1800);
    }
  };

  // 初回ロード：ローカルから読み込み（本番はAPI）
  useEffect(() => {
    try {
      const raw = localStorage.getItem("linkle:settings");
      if (raw) setData({ ...DEFAULT, ...JSON.parse(raw) });
    } catch {}
  }, []);

  // 便利ヘルパ
  const on = <K extends keyof Settings>(k: K, v: Settings[K]) =>
    setData((d) => ({ ...d, [k]: v }));

  const canSave = useMemo(() => {
    if (!data.nickname.trim()) return false;
    if (!data.pref.trim() || !data.city.trim()) return false;
    if (pwd1 || pwd2) {
      if (pwd1.length < 6 || pwd1 !== pwd2) return false;
    }
    return true;
  }, [data, pwd1, pwd2]);

  const save = async () => {
    if (!canSave) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    try {
      localStorage.setItem("linkle:settings", JSON.stringify(data));
      setPwd1("");
      setPwd2("");
      setToast("設定を保存しました");
    } finally {
      setSaving(false);
      setTimeout(() => setToast(null), 1800);
    }
  };

  // アカウント削除
  const [confirmOpen, setConfirmOpen] = useState(false);
  const deleteAccount = async () => {
    setConfirmOpen(false);
    try {
      await fetch("/api/account/delete", { method: "POST" });
      localStorage.clear();
      await signOut({ callbackUrl: "/" });
    } catch (e) {
      console.error(e);
      alert("削除に失敗しました");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-[#111827]">
      {/* ヘッダー（共通戻るUIに統一） */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur shadow-sm">
        <div className="h-14 px-4 flex items-center justify-between">
          <Link
            href="/mypage"
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
            マイページへ戻る
          </Link>
          <h1 className="font-semibold">マイページ設定</h1>
          <div className="w-8" />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-6">
        {/* プロフィール */}
<section className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-5">
  <h2 className="font-semibold">プロフィール</h2>

  {/* 上段：アバター＋基本情報 */}
  <div className="mt-4 grid grid-cols-1 sm:grid-cols-4 gap-5 items-start">
    {/* アバター */}
    <div className="sm:col-span-1">
      <div className="relative h-24 w-24 rounded-full overflow-hidden bg-gray-200 ring-1 ring-gray-200 shrink-0">
        {(preview || data.avatarUrl) && (
          <Image
            src={(preview || data.avatarUrl) as string}
            alt="avatar"
            fill
            className="object-cover"
          />
        )}
      </div>
    </div>

    {/* 基本フィールド */}
    <div className="sm:col-span-3">
      <p className="text-sm text-gray-500">ニックネーム</p>
      <input
        value={data.nickname}
        onChange={(e) => on("nickname", e.target.value)}
        type="text"
        placeholder="Linkle太郎"
        className="mt-1 w-full h-10 rounded-xl px-3 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
      />

      <p className="mt-3 text-sm text-gray-500">メールアドレス</p>
      <input
        value={data.email}
        onChange={(e) => on("email", e.target.value)}
        type="email"
        placeholder="you@example.com"
        className="mt-1 w-full h-10 rounded-xl px-3 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
      />
    </div>
  </div>

  {/* 下段：アバターアップロード操作 */}
  <div className="mt-4">
    <input
      ref={fileRef}
      type="file"
      accept="image/*"
      className="hidden"
      onChange={onFileChange}
    />
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={onPickFile}
        className="px-3 py-1.5 rounded-full text-sm bg-white shadow-sm hover:bg-blue-50 hover:text-blue-700 transition"
      >
        画像を選択
      </button>
      <button
        onClick={saveAvatar}
        disabled={!preview || uploading}
        className="px-3 py-1.5 rounded-full text-sm bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {uploading ? "保存中…" : "保存する"}
      </button>
      {preview && (
        <button
          onClick={() => setPreview(null)}
          className="px-3 py-1.5 rounded-full text-sm hover:bg-blue-50"
        >
          取消
        </button>
      )}
    </div>
  </div>
</section>

          {/* 自己紹介 */}
          <div className="mt-4">
            <label className="block text-xs text-gray-500">自己紹介</label>
            <textarea
              value={data.bio}
              onChange={(e) => on("bio", e.target.value)}
              rows={4}
              placeholder="はじめまして！"
              className="mt-1 w-full rounded-xl px-3 py-2 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>

          {/* 位置情報 */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500">都道府県</label>
              <select
                value={data.pref}
                onChange={(e) => on("pref", e.target.value)}
                className="mt-1 w-full rounded-xl px-3 py-2 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                {PREFS.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500">市区町村</label>
              <input
                value={data.city}
                onChange={(e) => on("city", e.target.value)}
                type="text"
                placeholder="渋谷区 など"
                className="mt-1 w-full rounded-xl px-3 py-2 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
          </div>

{/* 興味タグ */}
<div className="mt-4">
  <label className="block text-xs text-gray-500 mb-1">興味タグ</label>
  <TagEditor values={data.interests} onChange={(v) => on("interests", v)} />
</div>


        {/* 通知設定 */}
        <section className="mt-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-5">
          <h2 className="font-semibold">通知</h2>
          <label className="flex items-center gap-3 mt-2">
            <input
              type="checkbox"
              checked={data.notifyEmail}
              onChange={(e) => on("notifyEmail", e.target.checked)}
              className="h-4 w-4"
            />
            <span className="text-sm">メール通知を受け取る</span>
          </label>
          <label className="flex items-center gap-3 mt-2">
            <input
              type="checkbox"
              checked={data.notifyPush}
              onChange={(e) => on("notifyPush", e.target.checked)}
              className="h-4 w-4"
            />
            <span className="text-sm">プッシュ通知を受け取る</span>
          </label>
        </section>

        {/* パスワード変更 */}
        <section className="mt-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-5">
          <h2 className="font-semibold">パスワード変更</h2>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              value={pwd1}
              onChange={(e) => setPwd1(e.target.value)}
              type="password"
              placeholder="新しいパスワード"
              className="w-full rounded-xl px-3 py-2 text-sm bg-gray-50 focus:ring-2 focus:ring-blue-300"
            />
            <input
              value={pwd2}
              onChange={(e) => setPwd2(e.target.value)}
              type="password"
              placeholder="確認用"
              className="w-full rounded-xl px-3 py-2 text-sm bg-gray-50 focus:ring-2 focus:ring-blue-300"
            />
          </div>
          {(pwd1 || pwd2) && pwd1 !== pwd2 && (
            <p className="mt-2 text-xs text-red-600">パスワードが一致しません。</p>
          )}
          {(pwd1 || pwd2) && pwd1.length > 0 && pwd1.length < 6 && (
            <p className="mt-2 text-xs text-red-600">6文字以上で入力してください。</p>
          )}
        </section>

        {/* 保存・戻る */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            onClick={save}
            disabled={!canSave || saving}
            className="flex-1 rounded-full bg-blue-600 text-white py-2 text-sm disabled:opacity-60 hover:bg-blue-700 active:translate-y-px"
          >
            {saving ? "保存中…" : "設定を保存"}
          </button>
          <Link
            href="/mypage"
            className="flex-1 sm:w-48 text-center rounded-full bg-gray-100 py-2 text-sm hover:bg-blue-50 hover:text-blue-700"
          >
            マイページへ戻る
          </Link>
        </div>

        {/* 危険エリア */}
        <section className="mt-8 bg-white rounded-2xl shadow-sm p-5">
          <h3 className="font-semibold text-red-600">アカウント削除</h3>
          <p className="mt-1 text-sm text-gray-600">
            この操作は取り消せません。すべてのデータが削除されます。
          </p>
          <button
            onClick={() => setConfirmOpen(true)}
            className="mt-3 rounded-full bg-red-600 text-white px-4 py-2 text-sm hover:bg-red-700"
          >
            アカウントを削除する
          </button>
        </section>
      </main>

      {/* トースト */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 bg-gray-900 text-white px-4 py-2 text-sm rounded-lg shadow-lg">
          {toast}
        </div>
      )}

      {/* 削除確認モーダル */}
      {confirmOpen && (
        <ConfirmModal
          title="アカウントを削除しますか？"
          description="すべてのデータが削除され、復元できません。"
          confirmText="削除する"
          cancelText="やめる"
          onCancel={() => setConfirmOpen(false)}
          onConfirm={deleteAccount}
        />
      )}
    </div>
  );
}

/* タグエディタ */
function TagEditor({ values, onChange }: { values: string[]; onChange: (v: string[]) => void }) {
  const [input, setInput] = useState("");
  const add = (v: string) => {
    const s = v.trim();
    if (!s || values.includes(s)) return;
    onChange([...values, s]);
    setInput("");
  };
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {values.map((t) => (
          <span key={t} className="inline-flex items-center gap-1 rounded-full bg-blue-50 text-blue-700 px-3 py-1 text-xs">
            #{t}
            <button
              onClick={() => onChange(values.filter((x) => x !== t))}
              className="ml-1 rounded-full px-1 hover:bg-blue-100"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            add(input);
          }
          if (e.key === "Backspace" && !input && values.length) {
            onChange(values.slice(0, -1));
          }
        }}
        placeholder="タグを入力して Enter/Space で追加"
        className="mt-2 w-full rounded-xl px-3 py-2 text-sm bg-white shadow-sm focus:ring-2 focus:ring-blue-300"
      />
    </div>
  );
}

/* 確認モーダル */
function ConfirmModal({
  title,
  description,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
}: {
  title: string;
  description?: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
      onClick={onCancel}
    >
      <div className="absolute inset-0 bg-black/40" aria-hidden="true" />
      <div
        className="relative w-full sm:w-[440px] bg-white rounded-t-2xl sm:rounded-2xl p-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-3 sm:hidden" />
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {description && (
          <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">
            {description}
          </p>
        )}
        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-full text-sm hover:bg-blue-50 hover:text-blue-700 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-full bg-red-600 text-white text-sm hover:bg-red-700 transition-colors"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}