'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Profile } from '@/types'

type Props = {
  profile: Profile | null
  email: string
}

export function ProfileForm({ profile, email }: Props) {
  const t = useTranslations('profile')
  const [displayName, setDisplayName] = useState(profile?.displayName ?? '')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSuccess(false)
    setError(null)

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: displayName || null }),
      })
      if (!res.ok) {
        setError(t('errorSaveFailed'))
      } else {
        setSuccess(true)
      }
    } catch {
      setError(t('errorSaveFailed'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-xs text-brand-fg-dim uppercase tracking-wide">
          {t('emailLabel')}
        </Label>
        <Input
          id="email"
          type="email"
          value={email}
          readOnly
          className="bg-white/[0.04] text-brand-fg-sub cursor-default"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="displayName" className="text-xs text-brand-fg-dim uppercase tracking-wide">
          {t('displayNameLabel')}
        </Label>
        <Input
          id="displayName"
          type="text"
          value={displayName}
          onChange={e => setDisplayName(e.target.value)}
          placeholder={t('displayNamePlaceholder')}
          maxLength={100}
          className="bg-white/[0.04] text-brand-fg"
        />
      </div>

      {error && (
        <p className="text-sm text-brand-alert">{error}</p>
      )}
      {success && (
        <p className="text-sm text-brand-cta">{t('saveSuccess')}</p>
      )}

      <Button type="submit" disabled={saving} className="w-full">
        {saving ? t('saving') : t('saveChanges')}
      </Button>
    </form>
  )
}
