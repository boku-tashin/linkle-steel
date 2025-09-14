// src/components/AuthModal.tsx
"use client";

import { useEffect, useRef } from "react";
import { signIn, useSession } from "next-auth/react";

type Props = {
  open: boolean;
  onClose: () => void;
  onLoginSuccess?: () => void;
};

export default function AuthModal({ open, onClose, onLoginSuccess }: Props) {
  const { data: session, status } = useSession();
  const dialogRef = useRef<HTMLDivElement | null>(null);

  // 既存：モーダル外クリックで閉じる & Escapeで閉じる
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

  // ここがポイント：ログイン成功を検知して閉じる
  useEffect(() => {
    if (status === "authenticated" && open) {
      onLoginSuccess?.();
      onClose();
    }
  }, [status, open, onClose, onLoginSuccess]);

  if (!open) return null;

  // Twitterのenvが無い場合の簡易ガード（押下時に弾く）
  const hasTwitterEnv =
    !!process.env.NEXT_PUBLIC_TWITTER_ENABLED || // 任意: 表示制御用フラグがあれば
    (!!process.env.TWITTER_CLIENT_ID && !!process.env.TWITTER_CLIENT_SECRET);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      {/* 背景（元の画面は見えるまま。クリックで閉じる） */}
      <div className="absolute inset-0 bg-black/40" aria-hidden="true" />

      {/* パネル本体：クリックバブリング抑止 */}
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="relative w-full max-w-md mx-3 sm:mx-0 rounded-2xl bg-white p-5 shadow-xl outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダ */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">ログイン / 新規登録</h3>
          <button
            onClick={onClose}
            className="p-2 -mr-2 rounded-full hover:bg-gray-100"
            aria-label="閉じる"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" className="text-gray-600">
              <path
                fill="currentColor"
                d="m12 10.586l4.95-4.95l1.414 1.414L13.414 12l4.95 4.95l-1.414 1.414L12 13.414l-4.95 4.95l-1.414-1.414L10.586 12l-4.95-4.95l1.414-1.414z"
              />
            </svg>
          </button>
        </div>

        <p className="mt-1 text-sm text-gray-600">
          Google または X（Twitter）アカウントでログインできます。初回ログイン時は自動的に会員登録が作成されます。
        </p>

        <div className="mt-4 grid grid-cols-1 gap-2">
          {/* Googleでログイン */}
          <button
            onClick={() =>
              signIn("google", {
                // 必要ならコールバックURL
                // callbackUrl: "/mypage",
              })
            }
            className="w-full rounded-full bg-blue-600 text-white py-2 text-sm hover:bg-blue-700 active:translate-y-px transition inline-flex items-center justify-center gap-2"
          >
            <GoogleIcon />
            Googleで続行
          </button>

          {/* Twitterでログイン */}
          <button
            onClick={() => {
              if (!hasTwitterEnv) {
                alert("Twitterログインは現在準備中です。");
                return;
              }
              signIn("twitter", {
                // callbackUrl: "/mypage",
              });
            }}
            className={[
              "w-full rounded-full border py-2 text-sm transition inline-flex items-center justify-center gap-2",
              hasTwitterEnv
                ? "hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700"
                : "opacity-60 cursor-not-allowed",
            ].join(" ")}
          >
            <TwitterIcon />
            X（Twitter）で続行
          </button>
        </div>

        <p className="mt-3 text-[12px] text-gray-500">
          続行をクリックすると、利用規約およびプライバシーポリシーに同意したものとみなされます。
        </p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 533.5 544.3" aria-hidden="true">
      <path
        fill="#4285f4"
        d="M533.5 278.4c0-18.5-1.7-36.3-4.9-53.6H272v101.5h147.1c-6.3 34.1-25.1 63-53.4 82.4v68h86.4c50.5-46.5 81.4-115.2 81.4-198.3z"
      />
      <path
        fill="#34a853"
        d="M272 544.3c72.5 0 133.6-24.1 178.1-65.4l-86.4-68c-24 16.1-54.7 25.7-91.7 25.7-70.5 0-130.2-47.6-151.6-111.7H31.2v70.2C75.4 497.4 168.2 544.3 272 544.3z"
      />
      <path
        fill="#fbbc04"
        d="M120.4 324.9c-9.9-29.6-9.9-61.6 0-91.2V163.5H31.2c-40.1 80.2-40.1 176.1 0 256.3z"
      />
      <path
        fill="#ea4335"
        d="M272 106.1c39.4-.6 77.2 13.6 106 40.1l79.1-79.1C405.5 22.9 344.5 0 272 0 168.2 0 75.4 46.9 31.2 163.5l89.2 70.2C141.8 153.7 201.5 106.1 272 106.1z"
      />
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 1200 1227" aria-hidden="true">
      <path
        fill="currentColor"
        d="M714.163 519.284L1160.89 0H1056.94L667.137 450.887L356.812 0H0L468.492 681.821L0 1226.37H103.953L513.006 749.218L843.188 1226.37H1200L714.137 519.284H714.163ZM566.005 686.087L518.315 617.577L141.486 79.694H305.242L609.099 512.723L656.789 581.233L1056.99 1150.3H893.234L566.005 686.113V686.087Z"
      />
    </svg>
  );
}