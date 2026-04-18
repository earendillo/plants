// app/(authenticated)/today/page.tsx
import { redirect } from 'next/navigation'
import { getPlants } from '@/lib/db/plants'
import { getGardens } from '@/lib/db/gardens'
import { resolveActiveGarden } from '@/lib/gardens'
import { isDueForWatering, isDueForFeeding, daysUntilDue } from '@/lib/utils'
import { DueCard } from '@/components/DueCard'
import { GardenTabs } from '@/components/GardenTabs'
import { GardenHeader } from '@/components/GardenHeader'
import { Plant } from '@/types'
import { getAuthenticatedUser } from '@/lib/auth'
import { getTranslations, getLocale } from 'next-intl/server'

type DueItem = {
  plant: Plant
  action: 'water' | 'feed'
  daysUntil: number
}

export default async function TodayPage({
  searchParams,
}: {
  searchParams: Promise<{ garden?: string }>
}) {
  const { garden: gardenParam } = await searchParams
  const user = await getAuthenticatedUser()
  const [gardens, t, locale] = await Promise.all([
    getGardens(user?.id ?? ''),
    getTranslations('today'),
    getLocale(),
  ])

  const resolvedId = resolveActiveGarden(gardens, gardenParam)
  if (gardenParam !== resolvedId) {
    redirect(`/today?garden=${resolvedId}`)
  }

  const plants = await getPlants(user?.id ?? '', resolvedId)
  const today = new Date()
  const activeGarden = gardens.find(g => g.id === resolvedId)!

  const dueItems: DueItem[] = []
  for (const plant of plants) {
    if (isDueForWatering(plant, today)) {
      dueItems.push({
        plant,
        action: 'water',
        daysUntil: daysUntilDue(plant.lastWateredAt, plant.wateringIntervalDays, today),
      })
    }
    if (isDueForFeeding(plant, today)) {
      dueItems.push({
        plant,
        action: 'feed',
        daysUntil: daysUntilDue(plant.lastFedAt, plant.feedingIntervalDays, today),
      })
    }
  }

  const overdue = dueItems.filter(item => item.daysUntil < 0)
  const dueToday = dueItems.filter(item => item.daysUntil === 0)

  const dateStr = today.toLocaleDateString(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  })

  return (
    <main className="flex-1 px-4 py-4 pb-28">
      <div className="mb-4">
        <GardenHeader
          garden={activeGarden}
          plantCount={plants.length}
          isLastGarden={gardens.length === 1}
          firstRemainingGardenId={gardens.find(g => g.id !== resolvedId)?.id ?? null}
        />
        <GardenTabs gardens={gardens} activeGardenId={resolvedId} basePath="/today" />
      </div>
      <p className="mb-4 text-sm text-brand-fg-dim">{dateStr}</p>
      {dueItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-5xl">🌿</p>
          <p className="mt-4 text-lg font-semibold text-brand-fg">{t('allCaughtUp')}</p>
          <p className="mt-1 text-sm text-brand-fg-dim">{t('allCaughtUpDesc')}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {overdue.length > 0 && (
            <section>
              <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-brand-alert">
                {t('sectionOverdue')}
              </h2>
              <div className="space-y-3">
                {overdue.map(item => (
                  <DueCard
                    key={`${item.plant.id}-${item.action}`}
                    plant={item.plant}
                    action={item.action}
                    daysUntil={item.daysUntil}
                  />
                ))}
              </div>
            </section>
          )}
          {dueToday.length > 0 && (
            <section>
              <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-brand-muted">
                {t('sectionDueToday')}
              </h2>
              <div className="space-y-3">
                {dueToday.map(item => (
                  <DueCard
                    key={`${item.plant.id}-${item.action}`}
                    plant={item.plant}
                    action={item.action}
                    daysUntil={item.daysUntil}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </main>
  )
}
