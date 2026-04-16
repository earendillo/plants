'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { supabase } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const t = useTranslations('forgotPassword')
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/auth/set-password`,
    })

    if (err) {
      setError(err.message)
    } else {
      setSent(true)
    }

    setLoading(false)
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-bg px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="text-6xl">🌿</div>
          <h1 className="mt-2 text-2xl text-brand-fg">{t('title')}</h1>
          <p className="mt-1 text-sm text-brand-fg-dim">
            {sent ? t('emailSent') : t('subtitle')}
          </p>
        </div>

        {sent ? (
          <div className="rounded-lg border border-brand-cta/30 bg-brand-cta/10 px-4 py-3 text-sm text-brand-cta text-center">
            {t('successMessage')}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-brand-muted">
                {t('emailLabel')}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder={t('emailPlaceholder')}
                className="mt-1 block w-full rounded-lg border border-white/10 bg-brand-surface px-4 py-3 text-brand-fg placeholder:text-brand-fg-dim focus:border-brand-cta focus:outline-none focus:ring-1 focus:ring-brand-cta/20"
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
              {loading ? '...' : t('sendButton')}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-brand-fg-dim">
          <Link href="/login" className="font-semibold text-brand-muted hover:text-brand-fg transition-colors">
            {t('backToLogin')}
          </Link>
        </p>
      </div>
    </main>
  )
}
