export function PlantsPageSkeleton() {
  return (
    <div className="px-5">
      <div className="mb-3 h-3 w-16 animate-pulse rounded-full bg-white/6" />
      <div className="grid grid-cols-2 gap-3">
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            className="animate-pulse overflow-hidden rounded-[22px] border border-white/6 bg-brand-surface"
            style={{ opacity: 1 - i * 0.15 }}
          >
            {/* Illustration zone */}
            <div
              className="relative flex h-[104px] items-center justify-center"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
            >
              <div className="size-[72px] rounded-full bg-white/6" />
            </div>

            {/* Info zone */}
            <div className="space-y-2 px-3 pb-3 pt-2.5">
              <div className="h-4 w-20 rounded-full bg-white/8" />
              <div className="h-2.5 w-14 rounded-full bg-white/5" />
              <div className="h-3 w-12 rounded-full bg-white/5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
