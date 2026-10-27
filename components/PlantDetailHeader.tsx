'use client'

import { PlantType } from '@/types'
import { PlantIcon, PLANT_TINTS } from '@/components/PlantIcon'

type Props = {
  type: PlantType
  onClose: () => void
}

export function PlantDetailHeader({ type, onClose }: Props) {
  const tint = PLANT_TINTS[type]

  return (
    <div
      className="relative flex h-[150px] shrink-0 items-center justify-center border-b border-white/[0.05]"
      style={{ background: `${tint}17` }}
    >
      <div className="flex size-[88px] items-center justify-center rounded-full" style={{ background: `${tint}12` }}>
        <PlantIcon type={type} color={tint} size={58} />
      </div>
      <button
        onClick={onClose}
        className="absolute right-3 top-3 flex size-[30px] items-center justify-center rounded-lg border border-white/[0.12] bg-black/25 text-brand-fg-sub transition-colors hover:bg-black/40"
      >
        <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
          <path d="M2 2L12 12M12 2L2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
        </svg>
      </button>
    </div>
  )
}
