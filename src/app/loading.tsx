// src/app/loading.tsx
export default function Loading() {
  return (
    <div className="min-h-dvh flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-3 select-none">
        {/* ロゴ風ブロック：回転のみ（アクセシビリティ対応） */}
        <div
          aria-hidden="true"
          className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-500 animate-spin motion-reduce:animate-none shadow-[0_10px_20px_rgba(37,99,235,0.15)]"
        />

        {/* テキスト：やさしい点滅 */}
        <p className="text-sm font-semibold text-gray-700 animate-pulse motion-reduce:animate-none">
          Linkle を読み込み中…
        </p>
      </div>
    </div>
  );
}