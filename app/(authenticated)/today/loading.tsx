import { TodayPageSkeleton } from '@/components/TodayPageSkeleton'

export default function TodayLoading() {
  return (
    <main className="flex-1 pb-28">
      {/* Garden picker row skeleton */}
      <div className="flex items-center justify-between gap-2 px-5 pb-3 pt-1">
        <div className="h-5 w-28 animate-pulse rounded-full bg-white/8" />
        <div className="h-5 w-5 animate-pulse rounded-full bg-white/8" />
      </div>

      {/* Date skeleton */}
      <div className="px-5 pb-4">
        <div className="h-3 w-36 animate-pulse rounded-full bg-white/6" />
      </div>

      <TodayPageSkeleton />
    </main>
  )
}
