export function TodayPageSkeleton() {
  return (
    <div className="space-y-2.5 px-5">
      {[0, 1, 2].map(i => (
        <div
          key={i}
          className="animate-pulse overflow-hidden rounded-[22px] border border-white/6 bg-brand-surface"
          style={{ opacity: 1 - i * 0.2 }}
        >
          {/* Header zone */}
          <div
            className="flex items-center gap-3 px-4 py-3.5"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
          >
            <div className="size-[50px] flex-shrink-0 rounded-2xl bg-white/6" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-24 rounded-full bg-white/8" />
              <div className="h-2.5 w-16 rounded-full bg-white/5" />
            </div>
            <div className="h-6 w-12 rounded-full bg-white/6" />
          </div>

          {/* Footer zone */}
          <div className="flex items-center justify-between px-4 py-2.5">
            <div className="h-2.5 w-20 rounded-full bg-white/5" />
            <div className="h-7 w-16 rounded-full bg-white/6" />
          </div>
        </div>
      ))}
    </div>
  )
}
