import { getTranslations } from 'next-intl/server'
import { Plant } from '@/types'
import { ActionButton } from '@/components/ActionButton'

type Props = {
  plant: Plant
  action: 'water' | 'feed'
  daysUntil: number  // negative = overdue, 0 = due today
}

export async function DueCard({ plant, action, daysUntil }: Props) {
  const t = await getTranslations('dueCard')
  const isOverdue = daysUntil < 0
  const overdueDays = Math.abs(daysUntil)

  const actionLabel =
    action === 'water'
      ? isOverdue
        ? t('waterOverdue', { days: overdueDays })
        : t('waterDueToday')
      : isOverdue
        ? t('feedOverdue', { days: overdueDays })
        : t('feedDueToday')

  return (
    <div
      className={[
        'flex items-center gap-4 rounded-xl border bg-white p-4',
        isOverdue ? 'border-red-200' : 'border-slate-200',
      ].join(' ')}
    >
      <span className="text-3xl leading-none">{plant.emoji}</span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-slate-900">{plant.name}</p>
        <p
          className={[
            'mt-0.5 text-sm',
            isOverdue ? 'text-red-500' : 'text-green-600',
          ].join(' ')}
        >
          {actionLabel}
        </p>
      </div>
      <ActionButton plantId={plant.id} action={action} />
    </div>
  )
}
