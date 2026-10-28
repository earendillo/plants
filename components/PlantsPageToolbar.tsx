'use client'

import { useTranslations } from 'next-intl'
import { Garden } from '@/types'
import { GardenPicker } from '@/components/GardenPicker'
import { GardenHeader } from '@/components/GardenHeader'

type Props = {
  gardens: Garden[]
  activeGarden: Garden
  plantCount: number
  onManageGroups: () => void
}

export function PlantsPageToolbar({ gardens, activeGarden, plantCount, onManageGroups }: Props) {
  const t = useTranslations('plantGroups')
  const isOwner = activeGarden.role === 'owner'
  const ownedGardens = gardens.filter(g => g.role === 'owner')

  return (
    <>
      {/* Garden row — mobile only */}
      <div className="flex items-center justify-between gap-2 px-5 pb-3 pt-1 lg:hidden">
        <GardenPicker gardens={gardens} activeGardenId={activeGarden.id} basePath="/plants" />
        <GardenHeader
          garden={activeGarden}
          plantCount={plantCount}
          isLastGarden={ownedGardens.length === 1 && isOwner}
          firstRemainingGardenId={gardens.find(g => g.id !== activeGarden.id)?.id ?? null}
          onManageGroups={isOwner ? onManageGroups : undefined}
        />
      </div>

      {/* Desktop manage groups button */}
      {isOwner && (
        <div className="hidden items-center justify-end px-7 pb-2 pt-1 lg:flex">
          <button
            onClick={onManageGroups}
            className="text-[11px] font-medium text-brand-fg-dim hover:text-brand-fg-sub transition-colors"
          >
            {t('manageGroups')}
          </button>
        </div>
      )}
    </>
  )
}
