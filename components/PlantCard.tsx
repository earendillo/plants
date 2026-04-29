import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { Plant } from '@/types'
import { daysUntilDue } from '@/lib/utils'
import { PlantIcon, PLANT_TINTS, emojiToPlantType } from '@/components/PlantIcon'

type Props = {
  plant: Plant
  today: Date
  canEdit: boolean
}

type Status = 'overdue' | 'due-today' | 'ok'

function getWorstStatus(waterDays: number, feedDays: number): Status {
  const worst = Math.min(waterDays, feedDays)
  if (worst < 0) return 'overdue'
  if (worst === 0) return 'due-today'
  return 'ok'
}

export async function PlantCard({ plant, today, canEdit }: Props) {
  const t = await getTranslations('plantCard')
  const waterDays = daysUntilDue(plant.lastWateredAt, plant.wateringIntervalDays, today)
  const feedDays = daysUntilDue(plant.lastFedAt, plant.feedingIntervalDays, today)
  const status = getWorstStatus(waterDays, feedDays)
  const bestDays = Math.min(waterDays, feedDays)

  const plantType = emojiToPlantType(plant.emoji)
  const tint = PLANT_TINTS[plantType]

  const borderColor = status === 'overdue' ? 'rgba(224,85,85,0.22)' : 'rgba(255,255,255,0.07)'
  const boxShadow = status === 'overdue' ? '0 4px 24px rgba(224,85,85,0.08)' : '0 2px 12px rgba(0,0,0,0.2)'

  const card = (
    <div
      className="relative overflow-hidden rounded-[22px] bg-brand-surface transition-[transform,box-shadow] duration-100 hover:-translate-y-0.5 hover:shadow-[0_6px_24px_rgba(0,0,0,0.3)]"
      style={{ border: `1px solid ${borderColor}`, boxShadow }}
    >
      <div className="grain-overlay" />

      {/* Illustration zone */}
      <div
        className="relative flex h-[104px] items-center justify-center"
        style={{ background: `${tint}18`, borderBottom: '1px solid rgba(255,255,255,0.04)' }}
      >
        <div
          className="absolute size-[72px] rounded-full"
          style={{ background: `${tint}12` }}
        />
        <PlantIcon type={plantType} color={tint} size={50} />
        {status !== 'ok' && (
          <div
            className="absolute right-2.5 top-2.5 size-2 rounded-full"
            style={{
              background: status === 'overdue' ? '#e05555' : '#E8C86A',
              boxShadow: `0 0 0 3px #222820`,
            }}
          />
        )}
      </div>

      {/* Info zone */}
      <div className="px-3 pb-3 pt-2.5">
        <p
          className="font-heading text-base leading-tight text-brand-fg"
          style={{ letterSpacing: '-0.015em', fontWeight: 400 }}
        >
          {plant.name}
        </p>
        <p className="mt-1 font-sans text-[11px] tracking-[0.01em] text-brand-fg-dim">
          W·{plant.wateringIntervalDays}d &nbsp;F·{plant.feedingIntervalDays}d
        </p>
        <div className="mt-2">
          {status === 'ok' ? (
            <span className="text-[11px] text-brand-fg-dim">
              {t('statusOk', { days: bestDays })}
            </span>
          ) : (
            <span
              className="inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold tracking-[0.03em]"
              style={
                status === 'overdue'
                  ? { background: 'rgba(224,85,85,0.10)', color: '#e05555' }
                  : { background: 'rgba(232,200,106,0.12)', color: '#E8C86A' }
              }
            >
              {status === 'overdue' ? t('statusOverdue') : t('statusDueToday')}
            </span>
          )}
        </div>
      </div>
    </div>
  )

  if (!canEdit) return <div>{card}</div>
  return <Link href={`/plants/${plant.id}`} className="block">{card}</Link>
}
