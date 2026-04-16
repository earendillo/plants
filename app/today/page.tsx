import { getPlants } from '@/lib/db/plants'
import { isDueForWatering, isDueForFeeding, daysUntilDue } from '@/lib/utils'
import { BottomTabBar } from '@/components/BottomTabBar'
import { DueCard } from '@/components/DueCard'
import { Plant } from '@/types'
import { getAuthenticatedUser } from '@/lib/auth'
import { getTranslations, getLocale } from 'next-intl/server'

type DueItem = {
  plant: Plant
  action: 'water' | 'feed'
  daysUntil: number
}

export default async function TodayPage() {
  const user = await getAuthenticatedUser()
  const plants = await getPlants(user?.id ?? '')
  const today = new Date()
  const t = await getTranslations('today')
  const locale = await getLocale()

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
    <div className="flex min-h-screen flex-col bg-brand-bg">
      <header className="border-b border-white/6 px-6 py-5">
        <p className="text-sm text-brand-fg-dim">{dateStr}</p>
        <h1 className="mt-0.5 text-2xl text-brand-fg">{t('title')}</h1>
      </header>

      <main className="flex-1 px-4 py-4 pb-28">
        {dueItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
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

      <BottomTabBar />
    </div>
  )
}
