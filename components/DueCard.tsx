import { getTranslations } from 'next-intl/server'
import { Plant } from '@/types'
import { ActionButton } from '@/components/ActionButton'
import { Badge } from '@/components/ui/badge'
import { PlantIcon, PLANT_TINTS, emojiToPlantType } from '@/components/PlantIcon'

type Props = {
  plant: Plant
  action: 'water' | 'feed'
  daysUntil: number  // negative = overdue, 0 = due today
}

export async function DueCard({ plant, action, daysUntil }: Props) {
  const t = await getTranslations('dueCard')
  const isOverdue = daysUntil < 0
  const overdueDays = Math.abs(daysUntil)

  const plantType = emojiToPlantType(plant.emoji)
  const tint = PLANT_TINTS[plantType]

  const actionLabel = action === 'water' ? t('needsWatering') : t('needsFeeding')

  const headerBg = isOverdue ? 'rgba(224,85,85,0.08)' : `${tint}13`
  const headerBorder = isOverdue ? 'rgba(224,85,85,0.12)' : 'rgba(255,255,255,0.05)'
  const iconBubbleBg = isOverdue ? 'rgba(224,85,85,0.13)' : `${tint}1E`
  const iconColor = isOverdue ? '#dd8888' : tint
  const borderColor = isOverdue ? 'rgba(224,85,85,0.22)' : 'rgba(255,255,255,0.07)'
  const boxShadow = isOverdue ? '0 4px 24px rgba(224,85,85,0.08)' : '0 2px 12px rgba(0,0,0,0.18)'

  const intervalDays = action === 'water' ? plant.wateringIntervalDays : plant.feedingIntervalDays

  return (
    <div
      className="relative overflow-hidden rounded-[22px] bg-brand-surface"
      style={{ border: `1px solid ${borderColor}`, boxShadow }}
    >
      <div className="grain-overlay" />

      {/* Colored header zone */}
      <div
        className="flex items-center gap-3 px-4 py-3.5"
        style={{ background: headerBg, borderBottom: `1px solid ${headerBorder}` }}
      >
        {/* Icon bubble */}
        <div
          className="flex size-[50px] flex-shrink-0 items-center justify-center rounded-2xl"
          style={{ background: iconBubbleBg }}
        >
          <PlantIcon type={plantType} color={iconColor} size={30} />
        </div>

        {/* Name + action label */}
        <div className="flex-1 min-w-0">
          <p
            className="font-heading text-xl leading-none text-brand-fg"
            style={{ letterSpacing: '-0.02em', fontWeight: 400 }}
          >
            {plant.name}
          </p>
          <p className="mt-1 text-xs text-brand-fg-sub">{actionLabel}</p>
        </div>

        {/* Status chip */}
        <Badge variant={isOverdue ? 'overdue' : 'due-today'} className="flex-shrink-0">
          {isOverdue ? `−${overdueDays}d` : 'Today'}
        </Badge>
      </div>

      {/* Action footer */}
      <div className="flex items-center justify-between px-4 py-2.5">
        <span className="text-xs text-brand-fg-dim">
          {t('interval', { days: intervalDays })}
        </span>

        <ActionButton plantId={plant.id} action={action} isOverdue={isOverdue} />
      </div>
    </div>
  )
}
