// components/MapCard.tsx
export default function MapCard({ address }: { address: string }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">場所</h3>
        <a
          className="text-sm text-blue-700 hover:text-blue-900 hover:bg-blue-50 rounded px-2 py-1 transition-colors"
          href={`https://www.google.com/maps/search/${encodeURIComponent(address)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Googleマップで開く
        </a>
      </div>

      <div className="relative h-56 w-full overflow-hidden rounded-lg bg-gray-100 shadow-inner">
        <iframe
          className="absolute inset-0 w-full h-full border-0"
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          src={`https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`}
        />
        <div className="absolute bottom-2 left-2 right-2 rounded-md bg-white/90 px-3 py-2 text-sm text-gray-700 shadow">
          {address}
        </div>
      </div>
    </div>
  );
}