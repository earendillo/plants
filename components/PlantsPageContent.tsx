'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useGardens, usePlants } from '@/hooks/queries'
import { resolveActiveGarden } from '@/lib/gardens'
import { PlantCard } from '@/components/PlantCard'
import { GardenPicker } from '@/components/GardenPicker'
import { GardenHeader } from '@/components/GardenHeader'
import { PlantsPageSkeleton } from '@/components/PlantsPageSkeleton'
import { GardenRowSkeleton } from '@/components/GardenRowSkeleton'

type Props = {
  gardenParam?: string
}

export function PlantsPageContent({ gardenParam }: Props) {
  const router = useRouter()
  const t = useTranslations('plants')
  const { data: gardens, isPending: gardensPending } = useGardens()
  const resolvedId = gardens && gardens.length > 0
    ? resolveActiveGarden(gardens, gardenParam)
    : null
  const { data: plants, isPending: plantsPending } = usePlants(resolvedId)

  useEffect(() => {
    if (resolvedId && gardenParam !== resolvedId) {
      router.replace(`/plants?garden=${resolvedId}`)
    }
  }, [resolvedId, gardenParam, router])

  if (gardensPending || !gardens || !resolvedId) {
    return (
      <main className="flex-1 pb-28">
        <GardenRowSkeleton />
        <PlantsPageSkeleton />
      </main>
    )
  }

  const activeGarden = gardens.find(g => g.id === resolvedId)!
  const isOwner = activeGarden.role === 'owner'
  const ownedGardens = gardens.filter(g => g.role === 'owner')
  const plantList = plants ?? []
  const today = new Date()

  return (
    <main className="flex-1 pb-28">
      <div className="flex items-center justify-between gap-2 px-5 pb-3 pt-1">
        <GardenPicker gardens={gardens} activeGardenId={resolvedId} basePath="/plants" />
        <GardenHeader
          garden={activeGarden}
          plantCount={plantList.length}
          isLastGarden={ownedGardens.length === 1 && isOwner}
          firstRemainingGardenId={gardens.find(g => g.id !== resolvedId)?.id ?? null}
        />
      </div>

      {plantsPending ? (
        <PlantsPageSkeleton />
      ) : (
        <div className="px-5">
          <p className="mb-3 text-xs text-brand-fg-dim">
            {t('count', { count: plantList.length })}
          </p>
          {plantList.length === 0 ? (
            <p className="py-16 text-center text-brand-fg-dim">{t('empty')}</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {plantList.map(plant => (
                <PlantCard key={plant.id} plant={plant} today={today} canEdit={isOwner} />
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  )
}
