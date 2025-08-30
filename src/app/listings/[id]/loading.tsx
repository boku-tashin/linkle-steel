// src/app/listings/[id]/loading.tsx
export default function LoadingListing() {
  return (
    <div className="min-h-screen bg-gray-50 animate-pulse">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-4">
        <div className="h-5 w-28 rounded bg-gray-200" />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="relative w-full aspect-[16/9] overflow-hidden rounded-2xl bg-gray-200" />
      </div>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-8 space-y-4">
          <div className="flex gap-2">
            <div className="h-6 w-16 rounded-full bg-gray-200" />
            <div className="h-6 w-12 rounded-full bg-gray-200" />
          </div>
          <div className="h-7 w-3/4 rounded bg-gray-200" />

          <div className="flex gap-2">
            <div className="h-7 w-28 rounded-full bg-gray-200" />
            <div className="h-7 w-40 rounded-full bg-gray-200" />
            <div className="h-7 w-24 rounded-full bg-gray-200" />
          </div>

          <div className="h-32 rounded-xl bg-gray-200" />
          <div className="h-56 rounded-xl bg-gray-200" />
        </section>

        <aside className="lg:col-span-4">
          <div className="bg-white rounded-2xl border p-4 shadow-sm">
            <div className="h-5 w-16 rounded bg-gray-200 mb-3" />
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gray-200" />
              <div className="flex-1">
                <div className="h-4 w-28 rounded bg-gray-200 mb-1" />
                <div className="h-3 w-24 rounded bg-gray-200" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              <div className="h-12 rounded bg-gray-100" />
              <div className="h-12 rounded bg-gray-100" />
              <div className="h-12 rounded bg-gray-100" />
              <div className="h-12 rounded bg-gray-100" />
            </div>
            <div className="h-9 rounded-full bg-gray-200 mt-4" />
          </div>
        </aside>
      </main>
    </div>
  );
}