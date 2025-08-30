// src/components/SiteFooter.tsx
import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="border-t bg-white mt-10">
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
        </nav>
      </div>
    </footer>
  );
}