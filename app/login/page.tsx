'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const router = useRouter()
  const t = useTranslations('login')
  const searchParams = useSearchParams()
  const nextPath = searchParams.get('next')
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
        router.push(nextPath || '/today')
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
    <main className="flex min-h-screen items-center justify-center bg-brand-bg px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="text-6xl">🌿</div>
          <h1 className="mt-2 text-2xl font-heading text-brand-fg">{t('appName')}</h1>
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
                <Label htmlFor="email" className="text-brand-fg-sub">
                  {t('emailLabel')}
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder={t('emailPlaceholder')}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-brand-fg-sub">
                  {t('passwordLabel')}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder={t('passwordPlaceholder')}
                  className="mt-1"
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

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? '...' : mode === 'signin' ? t('signIn') : t('createAccount')}
              </Button>
            </form>

            <div className="mt-4 flex items-center gap-3">
              <div className="h-px flex-1 bg-white/6" />
              <span className="text-xs text-brand-fg-dim">{t('or')}</span>
              <div className="h-px flex-1 bg-white/6" />
            </div>

            <Button
              variant="secondary"
              onClick={handleGoogle}
              className="mt-4 w-full"
            >
              {t('continueWithGoogle')}
            </Button>

            <p className="mt-6 text-center text-sm text-brand-fg-dim">
              {mode === 'signin' ? (
                <>
                  {t('noAccount')}{' '}
                  <Button variant="link" onClick={() => { setMode('signup'); setError(null) }}>
                    {t('signUp')}
                  </Button>
                </>
              ) : (
                <>
                  {t('alreadyHaveAccount')}{' '}
                  <Button variant="link" onClick={() => { setMode('signin'); setError(null) }}>
                    {t('signInLink')}
                  </Button>
                </>
              )}
            </p>
          </>
        )}
      </div>
    </main>
  )
}
