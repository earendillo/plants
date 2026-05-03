'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Copy, RefreshCw } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

type Props = {
  gardenId: string
  shareUrl: string | null
  loading: boolean
  onUrlChange: (url: string | null) => void
  onLoadingChange: (loading: boolean) => void
}

export function MemberShareSection({
  gardenId,
  shareUrl,
  loading,
  onUrlChange,
  onLoadingChange,
}: Props) {
  const t = useTranslations('shareDialog')
  const [copied, setCopied] = useState(false)

  async function handleCreateOrRotate() {
    onLoadingChange(true)
    setCopied(false)
    try {
      const res = await fetch(`/api/gardens/${gardenId}/share-link`, { method: 'POST' })
      if (res.ok) {
        const data = (await res.json()) as { url: string }
        onUrlChange(data.url)
      }
    } finally {
      onLoadingChange(false)
    }
  }

  async function handleRevoke() {
    onLoadingChange(true)
    try {
      await fetch(`/api/gardens/${gardenId}/share-link`, { method: 'DELETE' })
      onUrlChange(null)
    } finally {
      onLoadingChange(false)
    }
  }

  function handleCopy() {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) {
    return <p className="text-sm text-brand-fg-dim">{t('loading')}</p>
  }

  if (shareUrl) {
    return (
      <>
        <div className="flex gap-2">
          <Input
            readOnly
            value={shareUrl}
            className="border-white/10 bg-brand-bg text-brand-fg text-xs"
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleCopy}
            className="shrink-0 border-white/10 bg-transparent text-brand-fg hover:bg-white/5"
          >
            {copied ? t('copied') : <Copy size={16} />}
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleCreateOrRotate}
            disabled={loading}
            className="flex-1 border-white/10 bg-transparent text-brand-fg hover:bg-white/5 text-sm"
          >
            <RefreshCw size={14} className="mr-1" />
            {t('rotateLink')}
          </Button>
          <Button
            type="button"
            onClick={handleRevoke}
            disabled={loading}
            className="flex-1 bg-brand-alert text-white hover:brightness-[0.92] text-sm"
          >
            {t('revoke')}
          </Button>
        </div>
      </>
    )
  }

  return (
    <Button
      type="button"
      onClick={handleCreateOrRotate}
      disabled={loading}
      className="w-full bg-brand-cta text-brand-cta-fg hover:brightness-[0.92]"
    >
      {t('createShareLink')}
    </Button>
  )
}
