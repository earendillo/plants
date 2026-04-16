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
  overdue: 'bg-brand-alert/15 text-brand-alert',
  'due-today': 'bg-brand-muted/12 text-brand-muted',
  ok: 'bg-white/[0.06] text-brand-fg-dim',
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

  const cardBase = 'flex items-center gap-4 rounded-xl border p-4 transition-colors'
  const cardVariant =
    status === 'overdue'
      ? 'border-brand-alert/30 bg-brand-overdue-surface active:bg-brand-alert/[0.12]'
      : 'border-white/6 bg-brand-surface active:bg-white/[0.04]'

  return (
    <Link href={`/plants/${plant.id}`} className="block">
      <div className={`${cardBase} ${cardVariant}`}>
        <span className="text-3xl leading-none">{plant.emoji}</span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-brand-fg">{plant.name}</p>
          <p className="mt-0.5 text-sm text-brand-fg-dim">
            {t('schedule', {
              waterDays: plant.wateringIntervalDays,
              feedDays: plant.feedingIntervalDays,
            })}
          </p>
        </div>
        <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${BADGE_CLASSES[status]}`}>
          {badgeLabel}
        </span>
      </div>
    </Link>
  )
}
