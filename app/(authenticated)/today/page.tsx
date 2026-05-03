// app/(authenticated)/today/page.tsx
import { redirect } from 'next/navigation'
import { getPlants } from '@/lib/db/plants'
import { getGardens, ensureDefaultGarden } from '@/lib/db/gardens'
import { resolveActiveGarden } from '@/lib/gardens'
import { collectDueItems } from '@/lib/due-items'
import { DueCard } from '@/components/DueCard'
import { GardenPicker } from '@/components/GardenPicker'
import { GardenHeader } from '@/components/GardenHeader'
import { PlantIcon } from '@/components/PlantIcon'
import { GardenContentWrapper } from '@/components/GardenContentWrapper'
import { TodayPageSkeleton } from '@/components/TodayPageSkeleton'
import { getAuthenticatedUser } from '@/lib/auth'
import { getTranslations, getLocale } from 'next-intl/server'

export default async function TodayPage({
  searchParams,
}: {
  searchParams: Promise<{ garden?: string }>
}) {
  const { garden: gardenParam } = await searchParams
  const user = await getAuthenticatedUser()
  if (!user) redirect('/login')

  const [gardens, t, locale] = await Promise.all([
    getGardens(user.id),
    getTranslations('today'),
    getLocale(),
  ])

  if (gardens.length === 0) {
    await ensureDefaultGarden(user.id)
    redirect('/today')
  }

  const resolvedId = resolveActiveGarden(gardens, gardenParam)
  if (gardenParam !== resolvedId) {
    redirect(`/today?garden=${resolvedId}`)
  }

  const plants = await getPlants(user.id, resolvedId)
  const today = new Date()
  const activeGarden = gardens.find(g => g.id === resolvedId)!
  const ownedGardens = gardens.filter(g => g.role === 'owner')
  const isOwner = activeGarden.role === 'owner'

  const dueItems = collectDueItems(plants, today)

  const overdue = dueItems.filter(item => item.daysUntil < 0)
  const dueToday = dueItems.filter(item => item.daysUntil === 0)

  const dateStr = today.toLocaleDateString(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  })

  return (
    <main className="flex-1 pb-28">
      {/* Garden row */}
      <div className="flex items-center justify-between gap-2 px-5 pb-3 pt-1">
        <GardenPicker gardens={gardens} activeGardenId={resolvedId} basePath="/today" />
        <GardenHeader
          garden={activeGarden}
          plantCount={plants.length}
          isLastGarden={ownedGardens.length === 1 && isOwner}
          firstRemainingGardenId={gardens.find(g => g.id !== resolvedId)?.id ?? null}
        />
      </div>

      {/* Date */}
      <p className="px-5 pb-4 text-xs text-brand-fg-dim">{dateStr}</p>

      {/* Content */}
      <GardenContentWrapper skeleton={<TodayPageSkeleton />}>
      <div className="px-5">
        {dueItems.length === 0 ? (
          <div className="flex flex-col items-center py-14 text-center">
            <div
              className="flex size-[90px] items-center justify-center rounded-full"
              style={{ background: 'rgba(207,238,158,0.08)' }}
            >
              <PlantIcon type="vine" color="#CFEE9E" size={58} />
            </div>
            <p
              className="mt-4 font-heading text-2xl text-brand-fg"
              style={{ fontWeight: 400 }}
            >
              {t('allCaughtUp')}
            </p>
            <p className="mt-1.5 text-sm text-brand-fg-sub">{t('allCaughtUpDesc')}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {overdue.length > 0 && (
              <section>
                <h2 className="mb-2.5 text-[10px] font-bold uppercase tracking-[0.1em] text-brand-alert">
                  {t('sectionOverdue')}
                </h2>
                <div className="space-y-2.5">
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
                <h2 className="mb-2.5 text-[10px] font-bold uppercase tracking-[0.1em] text-brand-amber">
                  {t('sectionDueToday')}
                </h2>
                <div className="space-y-2.5">
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
      </div>
      </GardenContentWrapper>
    </main>
  )
}
