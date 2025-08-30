"use client";

import { useState } from "react";

export default function AuthModal({
  open,
  onClose,
  onLoginSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [name, setName] = useState("");

  if (!open) return null;

  const submit = () => {
    // MVPではダミー成功にします
    if (!email || !pass || (mode === "signup" && !name)) {
      alert("未入力の項目があります。");
      return;
    }
    alert(mode === "login" ? "ログインしました（ダミー）" : "新規登録しました（ダミー）");
    onLoginSuccess();
  };

  return (
    <div
      className="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40" aria-hidden="true" />
      <div
        className="absolute left-0 right-0 top-1/2 -translate-y-1/2 mx-auto w-[92%] max-w-sm rounded-2xl bg-white p-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">
            {mode === "login" ? "ログイン" : "新規登録"}
          </h3>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-100"
            aria-label="閉じる"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="m12 10.586l4.95-4.95l1.414 1.414L13.414 12l4.95 4.95l-1.414 1.414L12 13.414l-4.95 4.95l-1.414-1.414L10.586 12l-4.95-4.95l1.414-1.414z"
              />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <button
            className={`py-2 rounded-full text-sm border ${
              mode === "login"
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
            onClick={() => setMode("login")}
          >
            ログイン
          </button>
          <button
            className={`py-2 rounded-full text-sm border ${
              mode === "signup"
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
            onClick={() => setMode("signup")}
          >
            新規登録
          </button>
        </div>

        <div className="space-y-3">
          {mode === "signup" && (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              type="text"
              placeholder="ニックネーム"
              className="w-full rounded-xl border px-4 py-2 text-sm"
            />
          )}
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="メールアドレス"
            className="w-full rounded-xl border px-4 py-2 text-sm"
          />
          <input
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            type="password"
            placeholder="パスワード"
            className="w-full rounded-xl border px-4 py-2 text-sm"
          />
        </div>

        <button
          onClick={submit}
          className="mt-4 w-full rounded-full bg-blue-600 text-white py-2 text-sm"
        >
          {mode === "login" ? "ログイン" : "登録してはじめる"}
        </button>

        <p className="mt-3 text-[12px] text-gray-500 text-center">
          続行すると、利用規約とプライバシーポリシーに同意したものとみなされます。
        </p>
      </div>
    </div>
  );
}