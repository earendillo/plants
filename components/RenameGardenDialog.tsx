'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Pencil } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

type Props = {
  gardenId: string
  gardenName: string
  disabled: boolean
}

export function RenameGardenDialog({ gardenId, gardenName, disabled }: Props) {
  const t = useTranslations('gardenHeader')
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(gardenName)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (next) {
      setName(gardenName)
      setError(null)
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/gardens/${gardenId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      if (res.status === 409) {
        setError(t('errorDuplicate'))
        setLoading(false)
        return
      }
      if (!res.ok) throw new Error(`Server error: ${res.status}`)
      setLoading(false)
      setOpen(false)
      router.refresh()
    } catch {
      setError(t('errorRenameFailed'))
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        aria-label={t('renameLabel')}
        disabled={disabled}
        className="flex size-11 items-center justify-center rounded-xl border border-white/[0.09] bg-white/[0.04] text-brand-fg-sub transition-colors hover:bg-white/[0.09] hover:text-brand-fg disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <Pencil size={16} />
      </DialogTrigger>
      <DialogContent className="bg-brand-surface border-white/10 text-brand-fg">
        <DialogHeader>
          <DialogTitle>{t('renameTitle')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {error && <p className="text-sm text-brand-alert">{error}</p>}
          <Input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder={t('gardenNamePlaceholder')}
            className="border-white/10 bg-brand-bg text-brand-fg placeholder:text-brand-fg-dim"
            autoFocus
          />
          <Button
            type="submit"
            disabled={loading || name.trim().length === 0 || name.trim() === gardenName}
            className="w-full bg-brand-cta text-brand-cta-fg hover:brightness-[0.92]"
          >
            {loading ? t('saving') : t('save')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
