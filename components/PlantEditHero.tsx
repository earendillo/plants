'use client'

import { useTranslations } from 'next-intl'
import type { PlantType } from '@/types'
import { PLANT_TINTS, PlantIcon } from '@/components/PlantIcon'

type Props = {
  plantType: PlantType
  onBack: () => void
}

export function PlantEditHero({ plantType, onBack }: Props) {
  const t = useTranslations('plantEdit')
  const tint = PLANT_TINTS[plantType]

  return (
    <div
      className="relative flex h-[190px] shrink-0 items-center justify-center overflow-hidden"
      style={{ background: `${tint}18` }}
    >
      <div className="grain-overlay" />

      <button
        type="button"
        onClick={onBack}
        className="absolute left-4 top-3.5 z-10 flex items-center gap-1.5 rounded-xl border border-white/[0.12] bg-black/[0.28] px-3.5 py-1.5 text-xs font-medium text-brand-fg"
      >
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
          <path d="M8.5 2L3.5 6.5L8.5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {t('backLabel')}
      </button>

      <div
        className="z-10 flex h-[110px] w-[110px] items-center justify-center rounded-full transition-colors"
        style={{ background: `${tint}12` }}
      >
        <PlantIcon type={plantType} color={tint} size={70} />
      </div>
    </div>
  )
}
