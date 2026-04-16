'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { supabase } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const t = useTranslations('login')
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [signupDone, setSignupDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (mode === 'signin') {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password })
      if (err) {
        setError(err.message)
      } else {
        router.push('/today')
        router.refresh()
      }
    } else {
      const { error: err } = await supabase.auth.signUp({ email, password })
      if (err) {
        setError(err.message)
      } else {
        setSignupDone(true)
      }
    }

    setLoading(false)
  }

  async function handleGoogle() {
    setError(null)
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
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
          <h1 className="mt-2 text-2xl text-brand-fg">{t('appName')}</h1>
          <p className="mt-1 text-sm text-brand-fg-dim">{t('subtitle')}</p>
        </div>

        {signupDone ? (
          <div className="rounded-lg border border-brand-cta/30 bg-brand-cta/10 px-4 py-3 text-sm text-brand-cta text-center">
            {t('confirmEmail')}
          </div>
        ) : (
          <>
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
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-brand-muted">
                  {t('passwordLabel')}
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

              {mode === 'signin' && (
                <div className="text-right">
                  <Link href="/forgot-password" className="text-sm text-brand-fg-dim hover:text-brand-muted transition-colors">
                    {t('forgotPassword')}
                  </Link>
                </div>
              )}

              {error && (
                <p className="text-sm text-brand-alert">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-brand-cta py-3 text-base font-semibold text-brand-cta-fg transition-[filter] hover:brightness-[0.92] active:brightness-[0.84] disabled:opacity-50"
              >
                {loading ? '...' : mode === 'signin' ? t('signIn') : t('createAccount')}
              </button>
            </form>

            <div className="mt-4 flex items-center gap-3">
              <div className="h-px flex-1 bg-white/6" />
              <span className="text-xs text-brand-fg-dim">{t('or')}</span>
              <div className="h-px flex-1 bg-white/6" />
            </div>

            <button
              onClick={handleGoogle}
              className="mt-4 w-full rounded-lg border border-white/15 bg-transparent py-3 text-base font-semibold text-brand-muted hover:bg-white/5 active:bg-white/[0.08] transition-colors"
            >
              {t('continueWithGoogle')}
            </button>

            <p className="mt-6 text-center text-sm text-brand-fg-dim">
              {mode === 'signin' ? (
                <>
                  {t('noAccount')}{' '}
                  <button
                    onClick={() => { setMode('signup'); setError(null) }}
                    className="font-semibold text-brand-muted hover:text-brand-fg transition-colors"
                  >
                    {t('signUp')}
                  </button>
                </>
              ) : (
                <>
                  {t('alreadyHaveAccount')}{' '}
                  <button
                    onClick={() => { setMode('signin'); setError(null) }}
                    className="font-semibold text-brand-muted hover:text-brand-fg transition-colors"
                  >
                    {t('signInLink')}
                  </button>
                </>
              )}
            </p>
          </>
        )}
      </div>
    </main>
  )
}
