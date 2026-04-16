import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
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

const BADGE_CLASSES: Record<Status, string> = {
  overdue: 'bg-red-100 text-red-500',
  'due-today': 'bg-yellow-50 text-yellow-600',
  ok: 'bg-green-50 text-green-600',
}

export async function PlantCard({ plant, today }: Props) {
  const t = await getTranslations('plantCard')
  const waterDays = daysUntilDue(plant.lastWateredAt, plant.wateringIntervalDays, today)
  const feedDays = daysUntilDue(plant.lastFedAt, plant.feedingIntervalDays, today)
  const status = getWorstStatus(waterDays, feedDays)
  const bestDays = Math.min(waterDays, feedDays)

  const badgeLabel =
    status === 'overdue'
      ? t('statusOverdue')
      : status === 'due-today'
        ? t('statusDueToday')
        : t('statusOk', { days: bestDays })

  return (
    <Link href={`/plants/${plant.id}`} className="block">
      <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 active:bg-slate-50">
        <span className="text-3xl leading-none">{plant.emoji}</span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-slate-900">{plant.name}</p>
          <p className="mt-0.5 text-sm text-slate-500">
            {t('schedule', {
              waterDays: plant.wateringIntervalDays,
              feedDays: plant.feedingIntervalDays,
            })}
          </p>
        </div>
        <span
          className={[
            'shrink-0 rounded-full px-3 py-1 text-xs font-semibold',
            BADGE_CLASSES[status],
          ].join(' ')}
        >
          {badgeLabel}
        </span>
      </div>
    </Link>
  )
}
