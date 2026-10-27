'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Props = {
  mode: 'signin' | 'signup'
  email: string
  password: string
  error: string | null
  loading: boolean
  onEmailChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onSubmit: (e: React.FormEvent) => void
}

export function LoginForm({
  mode, email, password, error, loading, onEmailChange, onPasswordChange, onSubmit,
}: Props) {
  const t = useTranslations('login')

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="email" className="text-brand-fg-sub">
          {t('emailLabel')}
        </Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={e => onEmailChange(e.target.value)}
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
          onChange={e => onPasswordChange(e.target.value)}
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
  )
}
