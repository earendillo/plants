'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useGardens, usePlants } from '@/hooks/queries'
import { resolveActiveGarden } from '@/lib/gardens'
import { collectDueItems } from '@/lib/due-items'
import { DueCard } from '@/components/DueCard'
import { GardenPicker } from '@/components/GardenPicker'
import { GardenHeader } from '@/components/GardenHeader'
import { PlantIcon } from '@/components/PlantIcon'
import { TodayPageSkeleton } from '@/components/TodayPageSkeleton'
import { GardenRowSkeleton } from '@/components/GardenRowSkeleton'

type Props = {
  gardenParam?: string
  locale: string
}

export function TodayPageContent({ gardenParam, locale }: Props) {
  const router = useRouter()
  const t = useTranslations('today')
  const { data: gardens, isPending: gardensPending } = useGardens()
  const resolvedId = gardens && gardens.length > 0
    ? resolveActiveGarden(gardens, gardenParam)
    : null
  const { data: plants, isPending: plantsPending } = usePlants(resolvedId)

  useEffect(() => {
    if (resolvedId && gardenParam !== resolvedId) {
      router.replace(`/today?garden=${resolvedId}`)
    }
  }, [resolvedId, gardenParam, router])

  if (gardensPending || !gardens || !resolvedId) {
    return (
      <main className="flex-1 pb-28">
        <GardenRowSkeleton />
        <div className="px-5 pb-4 pt-0">
          <div className="h-3 w-32 animate-pulse rounded-full bg-white/6" />
        </div>
        <TodayPageSkeleton />
      </main>
    )
  }

  const activeGarden = gardens.find(g => g.id === resolvedId)!
  const isOwner = activeGarden.role === 'owner'
  const ownedGardens = gardens.filter(g => g.role === 'owner')
  const plantList = plants ?? []
  const today = new Date()

  const dueItems = collectDueItems(plantList, today)
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
      <div className="flex items-center justify-between gap-2 px-5 pb-3 pt-1 lg:hidden">
        <GardenPicker gardens={gardens} activeGardenId={resolvedId} basePath="/today" />
        <GardenHeader
          garden={activeGarden}
          plantCount={plantList.length}
          isLastGarden={ownedGardens.length === 1 && isOwner}
          firstRemainingGardenId={gardens.find(g => g.id !== resolvedId)?.id ?? null}
        />
      </div>

      <p className="px-5 pb-4 text-xs text-brand-fg-dim">{dateStr}</p>

      {plantsPending ? (
        <TodayPageSkeleton />
      ) : (
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
      )}
    </main>
  )
}
