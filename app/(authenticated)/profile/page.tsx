// app/(authenticated)/profile/page.tsx
import { redirect } from 'next/navigation'
import { getAuthenticatedUser } from '@/lib/auth'
import { getProfile } from '@/lib/db/profiles'
import { ProfileForm } from '@/components/ProfileForm'
import { DeleteAccountDialog } from '@/components/DeleteAccountDialog'
import { getTranslations } from 'next-intl/server'

export default async function ProfilePage() {
  const [user, t] = await Promise.all([
    getAuthenticatedUser(),
    getTranslations('profile'),
  ])
  if (!user) redirect('/login')

  const profile = await getProfile(user.id)
  const providers: string[] = user.app_metadata?.providers ?? []
  const hasPasswordProvider = providers.includes('email')

  return (
    <main className="flex-1 pb-28">
      <div className="px-5 pt-6 pb-4">
        <h1 className="font-heading text-2xl text-brand-fg" style={{ fontWeight: 400 }}>
          {t('title')}
        </h1>
      </div>
      <div className="px-5">
        <ProfileForm profile={profile} email={user.email ?? ''} />
      </div>
      <div className="px-5 mt-10">
        <h2 className="text-xs font-medium text-brand-alert uppercase tracking-wide mb-3">
          {t('dangerZone')}
        </h2>
        <div className="rounded-xl border border-brand-alert/20 bg-brand-alert/[0.04] p-4 space-y-3">
          <p className="text-sm text-brand-fg-dim">{t('deleteAccountWarning')}</p>
          <DeleteAccountDialog hasPasswordProvider={hasPasswordProvider} />
        </div>
      </div>
    </main>
  )
}
