import { getPlants } from '@/lib/db/plants'
import { BottomTabBar } from '@/components/BottomTabBar'
import { PlantCard } from '@/components/PlantCard'
import { getAuthenticatedUser } from '@/lib/auth'
import { getTranslations } from 'next-intl/server'

export default async function PlantsPage() {
  const user = await getAuthenticatedUser()
  const plants = await getPlants(user?.id ?? '')
  const today = new Date()
  const t = await getTranslations('plants')

  return (
    <div className="flex min-h-screen flex-col bg-brand-bg">
      <header className="border-b border-white/6 px-6 py-5">
        <h1 className="text-2xl text-brand-fg">{t('title')}</h1>
        <p className="mt-0.5 text-sm text-brand-fg-dim">
          {t('count', { count: plants.length })}
        </p>
      </header>

      <main className="flex-1 px-4 py-4 pb-28 space-y-3">
        {plants.length === 0 ? (
          <p className="py-16 text-center text-brand-fg-dim">
            {t('empty')}
          </p>
        ) : (
          plants.map(plant => (
            <PlantCard key={plant.id} plant={plant} today={today} />
          ))
        )}
      </main>

      <BottomTabBar />
    </div>
  )
}
