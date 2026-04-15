import { cookies } from 'next/headers'
import { getPlants } from '@/lib/db/plants'
import { isDueForWatering, isDueForFeeding, daysUntilDue } from '@/lib/utils'
import { BottomTabBar } from '@/components/BottomTabBar'
import { DueCard } from '@/components/DueCard'
import { Plant } from '@/types'
import { MOCK_USER_ID } from '@/lib/auth'

type DueItem = {
  plant: Plant
  action: 'water' | 'feed'
  daysUntil: number
}

export default async function TodayPage() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value ?? MOCK_USER_ID
  const plants = await getPlants(userId)
  const today = new Date()

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

  const dateStr = today.toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  })

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="bg-slate-900 px-6 py-5 text-slate-50">
        <p className="text-sm text-slate-400">{dateStr}</p>
        <h1 className="mt-0.5 text-2xl font-bold">Today&apos;s care</h1>
      </header>

      <main className="flex-1 px-4 py-4 pb-28">
        {dueItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-5xl">🌿</p>
            <p className="mt-4 text-lg font-semibold text-slate-700">All caught up!</p>
            <p className="mt-1 text-sm text-slate-400">
              Your plants are all taken care of.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {overdue.length > 0 && (
              <section>
                <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-red-500">
                  Overdue
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
                <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-yellow-600">
                  Due Today
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
