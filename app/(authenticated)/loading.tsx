export default function Loading() {
  return (
    <>
      <header className="border-b border-white/6 px-6 py-5">
        <div className="h-3 w-24 animate-pulse rounded-full bg-white/10" />
        <div className="mt-2 h-6 w-40 animate-pulse rounded-full bg-white/10" />
      </header>
      <main className="flex-1 px-4 py-4 pb-28 space-y-3">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="h-[72px] animate-pulse rounded-xl border border-white/6 bg-brand-surface"
            style={{ opacity: 1 - i * 0.2 }}
          />
        ))}
      </main>
    </>
  )
}
