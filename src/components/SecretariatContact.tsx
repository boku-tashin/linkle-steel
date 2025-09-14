"use client";

import Link from "next/link";
import { useMemo } from "react";

type Props = {
  /** クリックで開く宛先メール。未指定なら info@linkle.example */
  mailto?: string;
  /** メールの件名（URLエンコード不要） */
  subject?: string;
  /** メール本文のテンプレ（URLエンコード不要） */
  body?: string;
  /** 表示をシンプルに（青帯だけ）したい場合は true */
  compact?: boolean;
};

export default function SecretariatContact({
  mailto = "info@linkle.example",
  subject = "【お問い合わせ】Linkle事務局宛",
  body = "お世話になっております。\nLinkle事務局さま宛てにお問い合わせです。\n\n▼ご用件：\n\n▼お名前：\n\n▼ご連絡先：\n\n---\n※このメールはサイトのフッターから作成されました。",
  compact = false,
}: Props) {
  const link = useMemo(() => {
    const s = encodeURIComponent(subject);
    const b = encodeURIComponent(body);
    return `mailto:${mailto}?subject=${s}&body=${b}`;
  }, [mailto, subject, body]);

  return (
    <footer className="bg-white border-t">
      {/* 上段：青帯の問い合わせCTA */}
      <div className="bg-blue-50 border-b border-blue-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-blue-900 font-medium text-center sm:text-left">
            ご不明点やご要望は<Link href="/guides/contact" className="underline decoration-blue-400 underline-offset-2 hover:text-blue-700 ml-1">FAQ</Link>をご確認のうえ、
            <span className="ml-1">事務局までお気軽にお問い合わせください。</span>
          </p>
          <div className="flex items-center gap-2">
            <a
              href={link}
              className="px-4 py-2 rounded-full bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors"
            >
              メールで問い合わせる
            </a>
            <Link
              href="/contact"
              className="px-4 py-2 rounded-full border text-sm hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors"
            >
              フォームへ
            </Link>
          </div>
        </div>
      </div>

      {/* 下段：サイト下部（コピーライト等） */}
      {!compact && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 text-sm text-gray-600">
          <div className="flex flex-wrap gap-4">
            <Link href="/terms" className="hover:text-blue-600">利用規約</Link>
            <Link href="/privacy" className="hover:text-blue-600">プライバシーポリシー</Link>
            <Link href="/guidelines" className="hover:text-blue-600">ガイドライン</Link>
            <a href={link} className="hover:text-blue-600">事務局へのお問い合わせ</a>
          </div>
          <p className="mt-3">受付時間：平日 10:00–18:00（年末年始除く）</p>
          <p className="mt-1">© {new Date().getFullYear()} Linkle</p>
        </div>
      )}
    </footer>
  );
}