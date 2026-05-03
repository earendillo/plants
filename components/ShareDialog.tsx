// components/ShareDialog.tsx
'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Share2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { MemberShareSection } from '@/components/MemberShareSection'
import { GuestShareSection } from '@/components/GuestShareSection'

type Props = { gardenId: string; disabled?: boolean }

export function ShareDialog({ gardenId, disabled }: Props) {
  const t = useTranslations('shareDialog')
  const [open, setOpen] = useState(false)
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [shareLoading, setShareLoading] = useState(false)
  const [anonUrl, setAnonUrl] = useState<string | null>(null)
  const [anonLoading, setAnonLoading] = useState(false)

  async function handleOpenChange(next: boolean) {
    setOpen(next)
    if (next) {
      setShareLoading(true)
      setAnonLoading(true)
      try {
        const [shareRes, anonRes] = await Promise.all([
          fetch(`/api/gardens/${gardenId}/share-link`),
          fetch(`/api/gardens/${gardenId}/anonymous-share-link`),
        ])
        if (shareRes.ok) {
          const data = (await shareRes.json()) as { url: string | null }
          setShareUrl(data.url)
        }
        if (anonRes.ok) {
          const data = (await anonRes.json()) as { url: string | null }
          setAnonUrl(data.url)
        }
      } finally {
        setShareLoading(false)
        setAnonLoading(false)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        aria-label={t('title')}
        disabled={disabled}
        className="flex size-11 items-center justify-center rounded-xl border border-white/[0.09] bg-white/[0.04] text-brand-fg-sub transition-colors hover:bg-white/[0.09] hover:text-brand-fg disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <Share2 size={16} />
      </DialogTrigger>
      <DialogContent className="bg-brand-surface border-white/10 text-brand-fg">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <p className="text-sm text-brand-fg-dim">
            {t('description')}
          </p>
          <MemberShareSection
            gardenId={gardenId}
            shareUrl={shareUrl}
            loading={shareLoading}
            onUrlChange={setShareUrl}
            onLoadingChange={setShareLoading}
          />
          <GuestShareSection
            gardenId={gardenId}
            anonUrl={anonUrl}
            loading={anonLoading}
            onUrlChange={setAnonUrl}
            onLoadingChange={setAnonLoading}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
