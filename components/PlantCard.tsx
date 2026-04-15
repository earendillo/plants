import Link from 'next/link'
import { Plant } from '@/types'
import { daysUntilDue } from '@/lib/utils'

type Props = {
  plant: Plant
  today: Date
}

type Status = 'overdue' | 'due-today' | 'ok'

function getWorstStatus(waterDays: number, feedDays: number): Status {
  const worst = Math.min(waterDays, feedDays)
  if (worst < 0) return 'overdue'
  if (worst === 0) return 'due-today'
  return 'ok'
}

const BADGE: Record<Status, { classes: string; label: (days: number) => string }> = {
  overdue: {
    classes: 'bg-red-100 text-red-500',
    label: () => 'Overdue',
  },
  'due-today': {
    classes: 'bg-yellow-50 text-yellow-600',
    label: () => 'Due today',
  },
  ok: {
    classes: 'bg-green-50 text-green-600',
    label: days => `OK — ${days}d`,
  },
}

export function PlantCard({ plant, today }: Props) {
  const waterDays = daysUntilDue(plant.lastWateredAt, plant.wateringIntervalDays, today)
  const feedDays = daysUntilDue(plant.lastFedAt, plant.feedingIntervalDays, today)
  const status = getWorstStatus(waterDays, feedDays)
  const bestDays = Math.min(waterDays, feedDays)
  const badge = BADGE[status]

  return (
    <Link href={`/plants/${plant.id}`} className="block">
      <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 active:bg-slate-50">
        <span className="text-3xl leading-none">{plant.emoji}</span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-slate-900">{plant.name}</p>
          <p className="mt-0.5 text-sm text-slate-500">
            Water every {plant.wateringIntervalDays}d · Feed every {plant.feedingIntervalDays}d
          </p>
        </div>
        <span
          className={[
            'shrink-0 rounded-full px-3 py-1 text-xs font-semibold',
            badge.classes,
          ].join(' ')}
        >
          {badge.label(bestDays)}
        </span>
      </div>
    </Link>
  )
}
