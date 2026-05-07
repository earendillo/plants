'use client'

import { useTranslations } from 'next-intl'
import { Plant, PlantGroup } from '@/types'

type Props = {
  plant: Plant
  groups: PlantGroup[]
  open: boolean
  onClose: () => void
  onMove: (groupId: string | null) => void
}

export function PlantCardContextMenu({ plant, groups, open, onClose, onMove }: Props) {
  const t = useTranslations('plantGroups')

  if (!open) return null

  function handleMove(groupId: string | null) {
    onMove(groupId)
    onClose()
  }

  return (
    <>
      <div className="fixed inset-0 z-50 animate-[fadeIn_150ms_ease] bg-black/60" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 z-50 animate-[slideUp_220ms_cubic-bezier(0.32,0.72,0,1)] rounded-t-[24px] bg-brand-surface p-4 pb-8">
        <p className="mb-3 text-center text-sm font-medium text-brand-fg">{plant.name}</p>
        <div className="space-y-2">
          {plant.groupId !== null && (
            <button
              onClick={() => handleMove(null)}
              className="w-full rounded-[14px] bg-brand-surface2 px-4 py-3 text-left text-sm text-brand-fg"
            >
              {t('removeFromGroup')}
            </button>
          )}
          {groups.map(g => (
            <button
              key={g.id}
              onClick={() => handleMove(g.id)}
              className="w-full rounded-[14px] bg-brand-surface2 px-4 py-3 text-left text-sm text-brand-fg"
            >
              {t('moveToGroup')}: {g.name}
            </button>
          ))}
          <button
            onClick={onClose}
            className="mt-2 w-full rounded-[14px] px-4 py-3 text-center text-sm text-brand-fg-dim"
          >
            {t('cancel')}
          </button>
        </div>
      </div>
    </>
  )
}
