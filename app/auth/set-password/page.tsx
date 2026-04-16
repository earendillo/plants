'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { supabase } from '@/lib/supabase/client'

export default function SetPasswordPage() {
  const router = useRouter()
  const t = useTranslations('setPassword')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password.length < 6) {
      setError(t('errorMinLength'))
      return
    }

    if (password !== confirm) {
      setError(t('errorMismatch'))
      return
    }

    setLoading(true)
    const { error: err } = await supabase.auth.updateUser({ password })

    if (err) {
      setError(err.message)
      setLoading(false)
    } else {
      router.push('/today')
    }
  }

  const inputClass =
    'mt-1 block w-full rounded-lg border border-white/10 bg-brand-surface px-4 py-3 ' +
    'text-brand-fg placeholder:text-brand-fg-dim focus:border-brand-cta ' +
    'focus:outline-none focus:ring-1 focus:ring-brand-cta/20'

  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-bg px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="text-6xl">🌿</div>
          <h1 className="mt-2 text-2xl text-brand-fg">{t('title')}</h1>
          <p className="mt-1 text-sm text-brand-fg-dim">{t('subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-brand-muted">
              {t('newPasswordLabel')}
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder={t('passwordPlaceholder')}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="confirm" className="block text-sm font-semibold text-brand-muted">
              {t('confirmPasswordLabel')}
            </label>
            <input
              id="confirm"
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
              placeholder={t('passwordPlaceholder')}
              className={inputClass}
            />
          </div>

          {error && (
            <p className="text-sm text-brand-alert">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-brand-cta py-3 text-base font-semibold text-brand-cta-fg transition-[filter] hover:brightness-[0.92] active:brightness-[0.84] disabled:opacity-50"
          >
            {loading ? '...' : t('updateButton')}
          </button>
        </form>
      </div>
    </main>
  )
}
