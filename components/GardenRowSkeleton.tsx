'use client'

export function GardenRowSkeleton() {
  return (
    <div className="flex items-center justify-between gap-2 px-5 pb-3 pt-1">
      {/* Garden picker pill */}
      <div className="h-11 w-28 animate-pulse rounded-xl bg-white/6" />

      {/* Action buttons (rename, delete, share) */}
      <div className="flex items-center gap-1.5">
        <div className="size-11 animate-pulse rounded-xl bg-white/6" />
        <div className="size-11 animate-pulse rounded-xl bg-white/6" />
        <div className="size-11 animate-pulse rounded-xl bg-white/6" />
      </div>
    </div>
  )
}
