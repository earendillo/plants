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
          <svg
            viewBox="0 0 300 300"
            fill="currentColor"
            className="mx-auto w-16 text-brand-cta"
            aria-hidden="true"
          >
            <path d="M283.659 45C277.307 144.78 257.845 199.508 199.285 215.274C141.866 230.734 153.394 227.789 129.148 255.002C135.257 243.221 146.587 208.043 163.332 175.415C184.331 134.499 222.467 108.391 235.904 94.4902C231.554 92.2576 178.005 129.116 157.006 170.032C145.021 189.05 134.458 208.462 128 224.357C129.957 139.707 140.674 118.515 166.493 90.2744C179.672 75.8596 233.207 45.0001 283.659 45Z"/>
            <path d="M16 129C51.4959 129 89.1615 146.666 98.4346 154.918C115.22 169.857 120.228 184.658 121.456 225.692C118.627 221.293 115.386 216.816 111.896 212.446C99.2923 190.914 59.2793 162.992 55.5117 165.197C64.9031 171.33 93.5823 195.452 106.186 216.983C113.461 229.413 118.292 243.206 121.8 252.223C121.801 253.139 121.805 254.064 121.805 255C107.756 241.829 116.097 236.122 89.7559 231.293C63.4144 226.464 23.9233 185.218 16 129Z"/>
          </svg>
          <h1 className="mt-3 text-2xl text-brand-fg">{t('title')}</h1>
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
