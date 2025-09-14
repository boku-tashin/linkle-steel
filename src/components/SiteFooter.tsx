// src/components/SiteFooter.tsx
import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="bg-white mt-10 shadow-[0_-6px_12px_rgba(0,0,0,0.03)]">
      <div className="mx-auto max-w-7xl px-4 py-6 text-sm text-gray-600 flex flex-col sm:flex-row justify-between gap-4">
        <p>© 2025 Linkle運営事務局</p>

        <nav className="flex flex-wrap gap-4">
          <Link href="/terms" className="hover:text-blue-600 transition-colors">
            利用規約
          </Link>
          <Link href="/privacy" className="hover:text-blue-600 transition-colors">
            プライバシーポリシー
          </Link>
          <Link href="/guidelines" className="hover:text-blue-600 transition-colors">
            コミュニティガイドライン
          </Link>
          <Link href="/legal" className="hover:text-blue-600 transition-colors">
            特定商取引法に基づく表記
          </Link>
          {/* ▼ 追加：事務局へのお問い合わせ */}
          <a
            href="mailto:info@linkle.example?subject=【お問い合わせ】Linkle事務局宛"
            className="hover:text-blue-600 transition-colors"
          >
            事務局へのお問い合わせ
          </a>
        </nav>
      </div>
    </footer>
  );
}