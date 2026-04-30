// app/(authenticated)/profile/page.tsx
import { getAuthenticatedUser } from '@/lib/auth'
import { getProfile } from '@/lib/db/profiles'
import { ProfileForm } from '@/components/ProfileForm'
import { getTranslations } from 'next-intl/server'

export default async function ProfilePage() {
  const [user, t] = await Promise.all([
    getAuthenticatedUser(),
    getTranslations('profile'),
  ])

  const profile = user ? await getProfile(user.id) : null

  return (
    <main className="flex-1 pb-28">
      <div className="px-5 pt-6 pb-4">
        <h1 className="font-heading text-2xl text-brand-fg" style={{ fontWeight: 400 }}>
          {t('title')}
        </h1>
      </div>
      <div className="px-5">
        <ProfileForm profile={profile} email={user?.email ?? ''} />
      </div>
    </main>
  )
}
