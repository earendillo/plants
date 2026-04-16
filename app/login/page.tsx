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

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="text-6xl">🌿</div>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">{t('appName')}</h1>
          <p className="mt-1 text-sm text-slate-500">{t('subtitle')}</p>
        </div>

        {signupDone ? (
          <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800 text-center">
            {t('confirmEmail')}
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                  {t('emailLabel')}
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder={t('emailPlaceholder')}
                  className="mt-1 block w-full rounded-lg border border-slate-200 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                  {t('passwordLabel')}
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder={t('passwordPlaceholder')}
                  className="mt-1 block w-full rounded-lg border border-slate-200 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                />
              </div>

              {mode === 'signin' && (
                <div className="text-right">
                  <Link href="/forgot-password" className="text-sm text-green-700 hover:underline">
                    {t('forgotPassword')}
                  </Link>
                </div>
              )}

              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-green-600 py-3 text-base font-semibold text-white hover:bg-green-700 active:bg-green-800 disabled:opacity-60"
              >
                {loading ? '...' : mode === 'signin' ? t('signIn') : t('createAccount')}
              </button>
            </form>

            <div className="mt-4 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs text-slate-400">{t('or')}</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <button
              onClick={handleGoogle}
              className="mt-4 w-full rounded-lg border border-slate-200 bg-white py-3 text-base font-semibold text-slate-700 hover:bg-slate-50 active:bg-slate-100"
            >
              {t('continueWithGoogle')}
            </button>

            <p className="mt-6 text-center text-sm text-slate-500">
              {mode === 'signin' ? (
                <>
                  {t('noAccount')}{' '}
                  <button
                    onClick={() => { setMode('signup'); setError(null) }}
                    className="font-medium text-green-600 hover:underline"
                  >
                    {t('signUp')}
                  </button>
                </>
              ) : (
                <>
                  {t('alreadyHaveAccount')}{' '}
                  <button
                    onClick={() => { setMode('signin'); setError(null) }}
                    className="font-medium text-green-600 hover:underline"
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
