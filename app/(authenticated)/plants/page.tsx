// app/(authenticated)/plants/page.tsx
import { redirect } from 'next/navigation'
import { getPlants } from '@/lib/db/plants'
import { getGardens } from '@/lib/db/gardens'
import { resolveActiveGarden } from '@/lib/gardens'
import { PlantCard } from '@/components/PlantCard'
import { GardenTabs } from '@/components/GardenTabs'
import { GardenHeader } from '@/components/GardenHeader'
import { getAuthenticatedUser } from '@/lib/auth'
import { getTranslations } from 'next-intl/server'

export default async function PlantsPage({
  searchParams,
}: {
  searchParams: Promise<{ garden?: string }>
}) {
  const { garden: gardenParam } = await searchParams
  const user = await getAuthenticatedUser()
  const [gardens, t] = await Promise.all([
    getGardens(user?.id ?? ''),
    getTranslations('plants'),
  ])

  const resolvedId = resolveActiveGarden(gardens, gardenParam)
  if (gardenParam !== resolvedId) {
    redirect(`/plants?garden=${resolvedId}`)
  }

  const plants = await getPlants(user?.id ?? '', resolvedId)
  const today = new Date()
  const activeGarden = gardens.find(g => g.id === resolvedId)!
  const isOwner = activeGarden.role === 'owner'
  const ownedGardens = gardens.filter(g => g.role === 'owner')

  return (
    <main className="flex-1 px-4 py-4 pb-28 space-y-3">
      <GardenHeader
        garden={activeGarden}
        plantCount={plants.length}
        isLastGarden={ownedGardens.length === 1 && isOwner}
        firstRemainingGardenId={gardens.find(g => g.id !== resolvedId)?.id ?? null}
      />
      <GardenTabs gardens={gardens} activeGardenId={resolvedId} basePath="/plants" />
      <p className="text-sm text-brand-fg-dim">
        {t('count', { count: plants.length })}
      </p>
      {plants.length === 0 ? (
        <p className="py-16 text-center text-brand-fg-dim">{t('empty')}</p>
      ) : (
        plants.map(plant => (
          <PlantCard key={plant.id} plant={plant} today={today} canEdit={isOwner} />
        ))
      )}
    </main>
  )
}
