'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useQueryClient } from '@tanstack/react-query'
import { useGardens, usePlants, usePlantGroups } from '@/hooks/queries'
import { resolveActiveGarden } from '@/lib/gardens'
import { PlantCard } from '@/components/PlantCard'
import { GardenPicker } from '@/components/GardenPicker'
import { GardenHeader } from '@/components/GardenHeader'
import { PlantsPageSkeleton } from '@/components/PlantsPageSkeleton'
import { GardenRowSkeleton } from '@/components/GardenRowSkeleton'
import { PlantGroupSection } from '@/components/PlantGroupSection'
import { ManageGroupsDrawer } from '@/components/ManageGroupsDrawer'

type Props = { gardenParam?: string }

export function PlantsPageContent({ gardenParam }: Props) {
  const router = useRouter()
  const t = useTranslations('plants')
  const queryClient = useQueryClient()
  const { data: gardens, isPending: gardensPending } = useGardens()
  const resolvedId = gardens && gardens.length > 0 ? resolveActiveGarden(gardens, gardenParam) : null
  const { data: plants, isPending: plantsPending } = usePlants(resolvedId)
  const { data: groups } = usePlantGroups(resolvedId)
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  const [manageOpen, setManageOpen] = useState(false)

  const handleMove = useCallback(async (plantId: string, groupId: string | null) => {
    await fetch(`/api/plants/${plantId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ groupId }),
    })
    await queryClient.invalidateQueries({ queryKey: ['plants'] })
  }, [queryClient])

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
  const groupList = groups ?? []
  const today = new Date()

  const toggleGroup = (id: string) => {
    setCollapsed(prev => {
      const next = new Set(prev)
      if (next.has(id)) { next.delete(id) } else { next.add(id) }
      return next
    })
  }

  return (
    <main className="flex-1 pb-28">
      <div className="flex items-center justify-between gap-2 px-5 pb-3 pt-1">
        <GardenPicker gardens={gardens} activeGardenId={resolvedId} basePath="/plants" />
        <GardenHeader
          garden={activeGarden}
          plantCount={plantList.length}
          isLastGarden={ownedGardens.length === 1 && isOwner}
          firstRemainingGardenId={gardens.find(g => g.id !== resolvedId)?.id ?? null}
          onManageGroups={isOwner ? () => setManageOpen(true) : undefined}
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
          ) : groupList.length === 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {plantList.map(plant => (
                <PlantCard key={plant.id} plant={plant} today={today} canEdit={isOwner} />
              ))}
            </div>
          ) : (
            <>
              {groupList.map(group => {
                const plantsInGroup = plantList.filter(p => p.groupId === group.id)
                return (
                  <PlantGroupSection
                    key={group.id}
                    id={group.id}
                    name={group.name}
                    plants={plantsInGroup}
                    today={today}
                    canEdit={isOwner}
                    collapsed={collapsed.has(group.id)}
                    onToggle={toggleGroup}
                    groups={isOwner ? groupList : undefined}
                    onMove={isOwner ? handleMove : undefined}
                  />
                )
              })}
              {(() => {
                const ungrouped = plantList.filter(
                  p => p.groupId === null || !groupList.some(g => g.id === p.groupId)
                )
                return ungrouped.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {ungrouped.map(plant => (
                      <PlantCard
                        key={plant.id}
                        plant={plant}
                        today={today}
                        canEdit={isOwner}
                        groups={isOwner ? groupList : undefined}
                        onMove={isOwner ? handleMove : undefined}
                      />
                    ))}
                  </div>
                ) : null
              })()}
            </>
          )}
        </div>
      )}
      {isOwner && manageOpen && (
        <ManageGroupsDrawer
          open={manageOpen}
          onClose={() => setManageOpen(false)}
          gardenId={resolvedId}
          groups={groupList}
          onGroupsChange={() => queryClient.invalidateQueries({ queryKey: ['plantGroups', resolvedId] })}
        />
      )}
    </main>
  )
}
