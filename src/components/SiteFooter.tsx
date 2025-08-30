// src/components/SiteFooter.tsx
"use client";

export default function SiteFooter() {
  return (
    <footer className="bg-white border-t">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 text-sm text-gray-600">
        <div className="flex flex-wrap gap-4">
          <a href="#" className="hover:text-blue-600">利用規約</a>
          <a href="#" className="hover:text-blue-600">プライバシーポリシー</a>
          <a href="#" className="hover:text-blue-600">ガイドライン</a>
          <a href="#" className="hover:text-blue-600">お問い合わせ</a>
        </div>
        <p className="mt-3">© 2025 Linkle</p>
      </div>
    </footer>
  );
}