'use client'

import { useTranslations } from 'next-intl'
import { TrashIcon, ArrowUpIcon, ArrowDownIcon } from 'lucide-react'
import { PlantGroup } from '@/types'

type Props = {
  group: PlantGroup
  isFirst: boolean
  isLast: boolean
  confirmingDelete: boolean
  onRequestDelete: () => void
  onCancelDelete: () => void
  onDelete: () => void
  onMoveUp: () => void
  onMoveDown: () => void
}

export function GroupRow({
  group, isFirst, isLast, confirmingDelete,
  onRequestDelete, onCancelDelete, onDelete, onMoveUp, onMoveDown,
}: Props) {
  const t = useTranslations('plantGroups')

  return (
    <div className="flex items-center gap-2 rounded-[14px] bg-brand-surface2 px-4 py-3">
      {confirmingDelete ? (
        <>
          <p className="flex-1 text-xs text-brand-fg-dim">{t('deleteConfirm')}</p>
          <button
            onClick={onCancelDelete}
            className="text-xs text-brand-fg-dim"
          >
            {t('cancel')}
          </button>
          <button
            onClick={onDelete}
            className="text-xs font-medium text-red-400"
          >
            {t('delete')}
          </button>
        </>
      ) : (
        <>
          <span className="flex-1 text-sm text-brand-fg">{group.name}</span>
          <button
            onClick={onMoveUp}
            disabled={isFirst}
            className="text-brand-fg-dim disabled:opacity-30"
            aria-label="Move up"
          >
            <ArrowUpIcon size={16} />
          </button>
          <button
            onClick={onMoveDown}
            disabled={isLast}
            className="text-brand-fg-dim disabled:opacity-30"
            aria-label="Move down"
          >
            <ArrowDownIcon size={16} />
          </button>
          <button
            onClick={onRequestDelete}
            className="text-brand-fg-dim"
            aria-label="Delete"
          >
            <TrashIcon size={16} />
          </button>
        </>
      )}
    </div>
  )
}
