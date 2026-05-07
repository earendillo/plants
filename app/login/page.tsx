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
    const callbackUrl = new URL('/auth/callback', window.location.origin)
    if (nextPath) callbackUrl.searchParams.set('next', nextPath)
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: callbackUrl.toString() },
    })
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-bg px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <svg
            viewBox="20 12 462 316"
            fill="currentColor"
            className="mx-auto w-48 text-brand-cta"
            aria-label="LeafMo"
          >
            <path d="M26.856 322V226.64H41.96V308.56H83.176V322H26.856ZM126.96 323.536C120.048 323.536 113.904 321.957 108.528 318.8C103.237 315.557 99.0987 311.205 96.112 305.744C93.1253 300.197 91.632 294.011 91.632 287.184C91.632 280.187 93.1253 274 96.112 268.624C99.184 263.248 103.28 259.024 108.4 255.952C113.52 252.795 119.323 251.216 125.808 251.216C131.013 251.216 135.664 252.112 139.76 253.904C143.856 255.696 147.312 258.171 150.128 261.328C152.944 264.4 155.077 267.941 156.528 271.952C158.064 275.963 158.832 280.229 158.832 284.752C158.832 285.861 158.789 287.013 158.704 288.208C158.619 289.403 158.448 290.512 158.192 291.536H103.024V280.016H150L143.088 285.264C143.941 281.083 143.643 277.371 142.192 274.128C140.827 270.8 138.693 268.197 135.792 266.32C132.976 264.357 129.648 263.376 125.808 263.376C121.968 263.376 118.555 264.357 115.568 266.32C112.581 268.197 110.277 270.928 108.656 274.512C107.035 278.011 106.395 282.277 106.736 287.312C106.309 292.005 106.949 296.101 108.656 299.6C110.448 303.099 112.923 305.829 116.08 307.792C119.323 309.755 122.992 310.736 127.088 310.736C131.269 310.736 134.811 309.797 137.712 307.92C140.699 306.043 143.045 303.611 144.752 300.624L156.528 306.384C155.163 309.627 153.029 312.571 150.128 315.216C147.312 317.776 143.899 319.824 139.888 321.36C135.963 322.811 131.653 323.536 126.96 323.536ZM193.059 323.536C188.366 323.536 184.227 322.725 180.643 321.104C177.144 319.397 174.414 317.093 172.451 314.192C170.488 311.205 169.507 307.707 169.507 303.696C169.507 299.941 170.318 296.571 171.939 293.584C173.646 290.597 176.248 288.08 179.747 286.032C183.246 283.984 187.64 282.533 192.931 281.68L216.995 277.712V289.104L195.747 292.816C191.907 293.499 189.091 294.736 187.299 296.528C185.507 298.235 184.611 300.453 184.611 303.184C184.611 305.829 185.592 308.005 187.555 309.712C189.603 311.333 192.206 312.144 195.363 312.144C199.288 312.144 202.702 311.291 205.603 309.584C208.59 307.877 210.894 305.616 212.515 302.8C214.136 299.899 214.947 296.699 214.947 293.2V275.408C214.947 271.995 213.667 269.221 211.107 267.088C208.632 264.869 205.304 263.76 201.123 263.76C197.283 263.76 193.912 264.784 191.011 266.832C188.195 268.795 186.104 271.355 184.739 274.512L172.707 268.496C173.987 265.083 176.078 262.096 178.979 259.536C181.88 256.891 185.251 254.843 189.091 253.392C193.016 251.941 197.155 251.216 201.507 251.216C206.968 251.216 211.79 252.24 215.971 254.288C220.238 256.336 223.523 259.195 225.827 262.864C228.216 266.448 229.411 270.629 229.411 275.408V322H215.587V309.456L218.531 309.84C216.91 312.656 214.819 315.088 212.259 317.136C209.784 319.184 206.926 320.763 203.683 321.872C200.526 322.981 196.984 323.536 193.059 323.536ZM253.506 322V265.808H240.706V252.752H253.506V249.168C253.506 243.963 254.573 239.611 256.706 236.112C258.839 232.528 261.783 229.797 265.538 227.92C269.378 226.043 273.773 225.104 278.722 225.104C279.661 225.104 280.727 225.189 281.922 225.36C283.117 225.445 284.098 225.573 284.866 225.744V238.288C284.183 238.117 283.415 238.032 282.562 238.032C281.709 237.947 281.026 237.904 280.514 237.904C276.674 237.904 273.602 238.8 271.298 240.592C268.994 242.299 267.842 245.157 267.842 249.168V252.752H283.714V265.808H267.842V322H253.506ZM298.606 322V226.64H312.686L348.526 276.304H341.486L376.686 226.64H390.766V322H375.79V244.432L381.422 245.968L345.454 295.12H343.918L308.718 245.968L313.71 244.432V322H298.606ZM442.481 323.536C435.825 323.536 429.724 321.957 424.177 318.8C418.716 315.643 414.364 311.333 411.121 305.872C407.878 300.411 406.257 294.224 406.257 287.312C406.257 280.315 407.878 274.128 411.121 268.752C414.364 263.291 418.716 259.024 424.177 255.952C429.638 252.795 435.74 251.216 442.481 251.216C449.308 251.216 455.409 252.795 460.785 255.952C466.246 259.024 470.556 263.291 473.713 268.752C476.956 274.128 478.577 280.315 478.577 287.312C478.577 294.309 476.956 300.539 473.713 306C470.47 311.461 466.118 315.771 460.657 318.928C455.196 322 449.137 323.536 442.481 323.536ZM442.481 310.096C446.577 310.096 450.204 309.115 453.361 307.152C456.518 305.189 458.993 302.501 460.785 299.088C462.662 295.589 463.601 291.664 463.601 287.312C463.601 282.96 462.662 279.077 460.785 275.664C458.993 272.251 456.518 269.563 453.361 267.6C450.204 265.637 446.577 264.656 442.481 264.656C438.47 264.656 434.844 265.637 431.601 267.6C428.444 269.563 425.926 272.251 424.049 275.664C422.257 279.077 421.361 282.96 421.361 287.312C421.361 291.664 422.257 295.589 424.049 299.088C425.926 302.501 428.444 305.189 431.601 307.152C434.844 309.115 438.47 310.096 442.481 310.096Z"/>
            <path d="M392.659 18C386.307 117.78 366.845 172.508 308.285 188.274C250.866 203.734 262.394 200.789 238.148 228.002C244.257 216.221 255.587 181.043 272.332 148.415C293.331 107.499 331.467 81.3906 344.904 67.4902C340.554 65.2576 287.005 102.116 266.006 143.032C254.021 162.05 243.458 181.462 237 197.357C238.957 112.707 249.674 91.5145 275.493 63.2744C288.672 48.8596 342.207 18.0001 392.659 18Z"/>
            <path d="M125 102C160.496 102 198.162 119.666 207.435 127.918C224.22 142.857 229.228 157.658 230.456 198.692C227.627 194.293 224.386 189.816 220.896 185.446C208.292 163.914 168.279 135.992 164.512 138.197C173.903 144.33 202.582 168.452 215.186 189.983C222.461 202.413 227.292 216.206 230.8 225.223C230.801 226.139 230.805 227.064 230.805 228C216.756 214.829 225.097 209.122 198.756 204.293C172.414 199.464 132.923 158.218 125 102Z"/>
          </svg>
          <p className="mt-3 text-sm text-brand-fg-dim">{t('subtitle')}</p>
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
