'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase/client'

type Props = {
  hasPasswordProvider: boolean
}

export function DeleteAccountDialog({ hasPasswordProvider }: Props) {
  const t = useTranslations('profile')
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [confirmText, setConfirmText] = useState('')

  const canSubmit = hasPasswordProvider
    ? password.length > 0
    : confirmText === 'DELETE'

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (next) {
      setError(null)
      setLoading(false)
      setPassword('')
      setConfirmText('')
    }
  }

  async function handleDelete() {
    setLoading(true)
    setError(null)

    try {
      const body = hasPasswordProvider ? { password } : {}
      const res = await fetch('/api/user', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        if (res.status === 403) {
          setError(t('invalidPassword'))
        } else {
          setError(t('deleteAccountError'))
        }
        setLoading(false)
        return
      }

      await supabase.auth.signOut()
      router.push('/login')
    } catch {
      setError(t('deleteAccountError'))
      setLoading(false)
    }
  }

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="border-brand-alert/40 text-brand-alert hover:bg-brand-alert/10 hover:border-brand-alert"
      >
        {t('deleteAccountButton')}
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="bg-brand-surface border-white/10 text-brand-fg">
          <DialogHeader>
            <DialogTitle>{t('deleteAccountTitle')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-sm text-brand-fg-dim">{t('deleteAccountConfirm')}</p>

            {hasPasswordProvider ? (
              <div className="space-y-1.5">
                <Label className="text-xs text-brand-fg-dim uppercase tracking-wide">
                  {t('passwordLabel')}
                </Label>
                <Input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={t('passwordPlaceholder')}
                  className="bg-white/[0.04] text-brand-fg"
                  autoComplete="current-password"
                />
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label className="text-xs text-brand-fg-dim uppercase tracking-wide">
                  {t('typeDeleteLabel')}
                </Label>
                <Input
                  type="text"
                  value={confirmText}
                  onChange={e => setConfirmText(e.target.value)}
                  placeholder={t('typeDeletePlaceholder')}
                  className="bg-white/[0.04] text-brand-fg"
                />
              </div>
            )}

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
                disabled={loading || !canSubmit}
                className="flex-1 bg-brand-alert text-white hover:brightness-[0.92]"
              >
                {loading ? t('deletingAccount') : t('deleteAccountButton')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
