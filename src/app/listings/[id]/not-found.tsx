// src/app/listings/[id]/not-found.tsx
import Link from "next/link";

export default function ListingNotFound() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="mx-auto max-w-xl rounded-2xl border bg-white p-8 text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" className="text-gray-400">
              <path
                fill="currentColor"
                d="m11.5 1l-9 16h18l-9-16Zm0 4.5l6 10.5h-12l6-10.5ZM10 18v2h3v-2h-3Z"
              />
            </svg>
          </div>
          <h1 className="mt-4 text-xl font-semibold text-gray-900">募集が見つかりませんでした</h1>
          <p className="mt-2 text-sm text-gray-600">
            URLが間違っているか、募集が削除された可能性があります。
          </p>
          <div className="mt-6 flex items-center justify-center gap-2">
            <Link
              href="/"
              className="px-4 py-2 rounded-full bg-blue-600 text-white text-sm transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
            >
              トップに戻る
            </Link>
            <Link
              href="/#search"
              className="px-4 py-2 rounded-full border text-sm hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors"
            >
              他の募集を探す
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}