'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Copy } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

type Props = {
  gardenId: string
  anonUrl: string | null
  loading: boolean
  onUrlChange: (url: string | null) => void
  onLoadingChange: (loading: boolean) => void
}

export function GuestShareSection({
  gardenId,
  anonUrl,
  loading,
  onUrlChange,
  onLoadingChange,
}: Props) {
  const t = useTranslations('shareDialog')
  const [copied, setCopied] = useState(false)
  const [durationDays, setDurationDays] = useState(7)

  async function handleCreate() {
    onLoadingChange(true)
    setCopied(false)
    try {
      const res = await fetch(`/api/gardens/${gardenId}/anonymous-share-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ durationDays }),
      })
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
      await fetch(`/api/gardens/${gardenId}/anonymous-share-link`, { method: 'DELETE' })
      onUrlChange(null)
    } finally {
      onLoadingChange(false)
    }
  }

  function handleCopy() {
    if (anonUrl) {
      navigator.clipboard.writeText(anonUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="border-t border-white/10 pt-4 space-y-3">
      <div>
        <p className="text-sm font-medium text-brand-fg">{t('guestAccess')}</p>
        <p className="text-sm text-brand-fg-dim">
          {t('guestDescription')}
        </p>
      </div>

      {loading && <p className="text-sm text-brand-fg-dim">{t('loading')}</p>}

      {!loading && anonUrl && (
        <>
          <div className="flex gap-2">
            <Input
              readOnly
              value={anonUrl}
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
          <Button
            type="button"
            onClick={handleRevoke}
            disabled={loading}
            className="w-full bg-brand-alert text-white hover:brightness-[0.92] text-sm"
          >
            {t('revokeGuestLink')}
          </Button>
        </>
      )}

      {!loading && !anonUrl && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-brand-fg-dim">{t('expiresIn')}</span>
            <select
              value={durationDays}
              onChange={e => setDurationDays(Number(e.target.value))}
              className="text-sm bg-brand-bg border border-white/10 rounded px-2 py-1 text-brand-fg"
            >
              {[1,2,3,4,5,6,7,8,9,10,11,12,13,14].map(d => (
                <option key={d} value={d}>{t('day', { count: d })}</option>
              ))}
            </select>
          </div>
          <Button
            type="button"
            onClick={handleCreate}
            disabled={loading}
            className="w-full bg-brand-cta text-brand-cta-fg hover:brightness-[0.92]"
          >
            {t('createGuestLink')}
          </Button>
        </div>
      )}
    </div>
  )
}
