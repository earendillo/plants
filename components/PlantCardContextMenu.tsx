'use client'

import { useTranslations } from 'next-intl'
import { Plant, PlantGroup } from '@/types'
import { Dialog, DialogContent } from '@/components/ui/dialog'

type Props = {
  plant: Plant
  groups: PlantGroup[]
  open: boolean
  onClose: () => void
  onMove: (groupId: string | null) => void
}

export function PlantCardContextMenu({ plant, groups, open, onClose, onMove }: Props) {
  const t = useTranslations('plantGroups')

  function handleMove(groupId: string | null) {
    onMove(groupId)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent showCloseButton={false} className="pb-8">
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
      </DialogContent>
    </Dialog>
  )
}
