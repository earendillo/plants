'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { DeletePlantDialog } from '@/components/DeletePlantDialog'

type Props = {
  isEdit: boolean
  loading: boolean
  onDelete: () => void
}

export function PlantFormActions({ isEdit, loading, onDelete }: Props) {
  const t = useTranslations('plantForm')
  const [deleteOpen, setDeleteOpen] = useState(false)

  return (
    <>
      <button
        type="submit" disabled={loading}
        className="w-full rounded-2xl bg-brand-cta py-3.5 text-sm font-bold text-brand-cta-fg shadow-[0_4px_20px_rgba(207,238,158,0.2)] transition-[filter] hover:brightness-[0.92] active:brightness-[0.84] disabled:opacity-50"
      >
        {loading ? t('saving') : isEdit ? t('saveChanges') : t('savePlant')}
      </button>

      {isEdit && (
        <>
          <button
            type="button" onClick={() => setDeleteOpen(true)} disabled={loading}
            className="w-full rounded-2xl border-[1.5px] border-[rgba(224,85,85,0.40)] bg-[rgba(224,85,85,0.10)] py-3 text-[13px] font-semibold text-[#f07070] disabled:opacity-50"
          >
            {t('deletePlant')}
          </button>
          <DeletePlantDialog
            open={deleteOpen} onOpenChange={setDeleteOpen}
            onConfirm={onDelete} loading={loading}
          />
        </>
      )}
    </>
  )
}
