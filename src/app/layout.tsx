// src/app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import TopNav from "@/components/TopNav";
import SiteFooter from "@/components/SiteFooter";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ★ ここは元のexportを残しつつ、内容をLinkle向けに拡張
export const metadata: Metadata = {
  title: "Linkle | まかせてつながる募集掲示板",
  description:
    "スポーツ・学習・趣味の募集をサクッと作成＆参加。スマホ最適のシンプル設計で“会いたい人”とすぐ出会える。",
  openGraph: {
    title: "Linkle | まかせてつながる募集掲示板",
    description:
      "スポーツ・学習・趣味の募集をサクッと作成＆参加。スマホ最適のシンプル設計で“会いたい人”とすぐ出会える.",
    type: "website",
    url: "https://example.com/",
    images: [{ url: "/sample/new.svg", width: 800, height: 500, alt: "Linkle" }],
  },
  // ★ ローカル確認時は 3010 にしておくとベター
  metadataBase: new URL("http://localhost:3010"),

  // ★ ここだけ差し替え：/favicon.ico 参照をやめて /icon.png を明示
  icons: {
    icon: "/icon.png",
    apple: "/icon.png", // iOSのホーム追加など
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        {/* 任意: テーマカラー（PWA/モバイルのアドレスバー色） */}
        <meta name="theme-color" content="#2563eb" />

        {/* ★ 念のための直指定（Nextのmetadataと二重でもOK） */}
        <link rel="icon" href="/icon.png" sizes="32x32" />
        <link rel="icon" href="/icon.png" sizes="any" />
        <link rel="apple-touch-icon" href="/icon.png" />

        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-P8RBH63C4C"
          strategy="afterInteractive"
        />
        <Script id="ga-script" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-P8RBH63C4C');
          `}
        </Script>
      </head>

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 text-[#111827] min-h-screen flex flex-col selection:bg-blue-200/60`}
      >
        {/* キーボード操作のA11y: スキップリンク */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:shadow"
        >
          コンテンツへスキップ
        </a>

        {/* ★ ここから追加（既存構造は維持） */}
        <TopNav />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
        {/* ★ ここまで追加 */}
      </body>
    </html>
  );
}