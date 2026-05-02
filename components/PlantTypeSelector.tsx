'use client'

import { useTranslations } from 'next-intl'
import { type PlantType, PLANT_TINTS, PLANT_TYPE_LABELS, PlantIcon } from '@/components/PlantIcon'

const PLANT_TYPES = Object.keys(PLANT_TYPE_LABELS) as PlantType[]

type Props = {
  value: PlantType
  onChange: (type: PlantType) => void
}

export function PlantTypeSelector({ value, onChange }: Props) {
  const t = useTranslations('plantFormFields')

  return (
    <div>
      <span className="block text-[11px] font-medium uppercase tracking-[0.07em] text-brand-fg-dim mb-1.5">
        {t('typeLabel')}
      </span>
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {PLANT_TYPES.map(type => {
          const tint = PLANT_TINTS[type]
          const selected = type === value

          return (
            <button
              key={type}
              type="button"
              title={PLANT_TYPE_LABELS[type]}
              onClick={() => onChange(type)}
              className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl transition-all"
              style={{
                background: selected ? `${tint}22` : 'rgba(255,255,255,0.04)',
                border: `1.5px solid ${selected ? tint + '55' : 'rgba(255,255,255,0.07)'}`,
              }}
            >
              <PlantIcon type={type} color={tint} size={30} />
            </button>
          )
        })}
      </div>
    </div>
  )
}
