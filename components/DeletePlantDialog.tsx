'use client'

import { useTranslations } from 'next-intl'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter, DialogClose,
} from '@/components/ui/dialog'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  loading: boolean
}

export function DeletePlantDialog({ open, onOpenChange, onConfirm, loading }: Props) {
  const t = useTranslations('plantForm')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{t('deleteConfirmTitle')}</DialogTitle>
          <DialogDescription>{t('deleteConfirmDesc')}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose
            render={
              <button className="flex-1 rounded-[14px] border border-white/10 bg-white/[0.06] px-4 py-2.5 text-[13px] font-medium text-brand-fg-sub" />
            }
          >
            {t('deleteCancel')}
          </DialogClose>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 rounded-[14px] bg-brand-alert px-4 py-2.5 text-[13px] font-semibold text-white shadow-[0_2px_12px_rgba(224,85,85,0.3)] disabled:opacity-50"
          >
            {loading ? t('deleting') : t('deleteConfirm')}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
