'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

type Props = {
  gardenId: string
  gardenName: string
  plantCount: number
  isLastGarden: boolean
  firstRemainingGardenId: string | null
  disabled: boolean
}

export function DeleteGardenDialog({
  gardenId,
  gardenName,
  plantCount,
  isLastGarden,
  firstRemainingGardenId,
  disabled,
}: Props) {
  const t = useTranslations('gardenHeader')
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const deleteDisabled = plantCount > 0 || isLastGarden
  const deleteTitle =
    plantCount > 0
      ? t('removePlantsFirst')
      : isLastGarden
        ? t('cannotDeleteLast')
        : t('deleteLabel')

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (next) {
      setError(null)
      setLoading(false)
    }
  }

  async function handleDelete() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/gardens/${gardenId}`, { method: 'DELETE' })
      if (!res.ok) {
        const body = (await res.json()) as { error: string }
        setError(body.error ?? t('errorDeleteFailed'))
        setLoading(false)
        return
      }
      setLoading(false)
      setOpen(false)
      if (firstRemainingGardenId) {
        router.push(`/plants?garden=${firstRemainingGardenId}`)
      }
      router.refresh()
    } catch {
      setError(t('errorDeleteFailed'))
      setLoading(false)
    }
  }

  return (
    <>
      <button
        aria-label={deleteTitle}
        title={deleteTitle}
        disabled={deleteDisabled || disabled}
        onClick={() => setOpen(true)}
        className="flex size-11 items-center justify-center rounded-xl border border-white/[0.09] bg-white/[0.04] text-brand-fg-sub transition-colors hover:bg-[rgba(224,85,85,0.12)] hover:text-brand-alert disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white/[0.04] disabled:hover:text-brand-fg-sub"
      >
        <Trash2 size={16} />
      </button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="bg-brand-surface border-white/10 text-brand-fg">
          <DialogHeader>
            <DialogTitle>{t('deleteTitle')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-sm text-brand-fg-dim">
              {t.rich('deleteConfirm', {
                name: gardenName,
                strong: (chunks) => <strong className="text-brand-fg">{chunks}</strong>,
              })}
            </p>
            {error && <p className="text-sm text-brand-alert">{error}</p>}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                className="flex-1 border-white/10 bg-transparent text-brand-fg hover:bg-white/5"
              >
                {t('cancel')}
              </Button>
              <Button
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 bg-brand-alert text-white hover:brightness-[0.92]"
              >
                {loading ? t('deleting') : t('delete')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
