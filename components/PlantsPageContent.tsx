'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useQueryClient } from '@tanstack/react-query'
import { useGardens, usePlants, usePlantGroups } from '@/hooks/queries'
import { useIsDesktop } from '@/hooks/useIsDesktop'
import { resolveActiveGarden } from '@/lib/gardens'
import { PlantCard } from '@/components/PlantCard'
import { GardenPicker } from '@/components/GardenPicker'
import { GardenHeader } from '@/components/GardenHeader'
import { PlantsPageSkeleton } from '@/components/PlantsPageSkeleton'
import { GardenRowSkeleton } from '@/components/GardenRowSkeleton'
import { PlantGroupSection } from '@/components/PlantGroupSection'
import { ManageGroupsDrawer } from '@/components/ManageGroupsDrawer'
import { PlantDetailPanel } from '@/components/PlantDetailPanel'

type Props = {
  gardenParam?: string
  plantParam?: string
}

export function PlantsPageContent({ gardenParam, plantParam }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const t = useTranslations('plants')
  const queryClient = useQueryClient()
  const isDesktop = useIsDesktop()
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

  function handlePlantSelect(plantId: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('plant', plantId)
    router.push(`/plants?${params.toString()}`)
  }

  function handlePanelClose() {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('plant')
    router.push(`/plants?${params.toString()}`)
  }

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
  const selectedPlant = isDesktop && plantParam ? plantList.find(p => p.id === plantParam) : null
  const panelOpen = !!selectedPlant

  const toggleGroup = (id: string) => {
    setCollapsed(prev => {
      const next = new Set(prev)
      if (next.has(id)) { next.delete(id) } else { next.add(id) }
      return next
    })
  }

  const plantCardOnSelect = isOwner && isDesktop
    ? (plantId: string) => handlePlantSelect(plantId)
    : undefined

  const gridClass = `grid gap-3 ${panelOpen ? 'grid-cols-2' : 'grid-cols-2 lg:grid-cols-3'}`

  return (
    <main className={`flex-1 pb-28 lg:pb-4 transition-[margin] duration-200 ${panelOpen ? 'lg:mr-[340px]' : ''}`}>
      {/* Garden row — mobile only */}
      <div className="flex items-center justify-between gap-2 px-5 pb-3 pt-1 lg:hidden">
        <GardenPicker gardens={gardens} activeGardenId={resolvedId} basePath="/plants" />
        <GardenHeader
          garden={activeGarden}
          plantCount={plantList.length}
          isLastGarden={ownedGardens.length === 1 && isOwner}
          firstRemainingGardenId={gardens.find(g => g.id !== resolvedId)?.id ?? null}
          onManageGroups={isOwner ? () => setManageOpen(true) : undefined}
        />
      </div>

      {/* Desktop manage groups button */}
      {isOwner && (
        <div className="hidden items-center justify-end px-7 pb-2 pt-1 lg:flex">
          <button
            onClick={() => setManageOpen(true)}
            className="text-[11px] font-medium text-brand-fg-dim hover:text-brand-fg-sub transition-colors"
          >
            Manage groups
          </button>
        </div>
      )}

      {plantsPending ? (
        <PlantsPageSkeleton />
      ) : (
        <div className="px-5 lg:px-7">
          <p className="mb-3 text-xs text-brand-fg-dim">
            {t('count', { count: plantList.length })}
          </p>
          {plantList.length === 0 ? (
            <p className="py-16 text-center text-brand-fg-dim">{t('empty')}</p>
          ) : groupList.length === 0 ? (
            <div className={gridClass}>
              {plantList.map(plant => (
                <PlantCard
                  key={plant.id}
                  plant={plant}
                  today={today}
                  canEdit={isOwner}
                  onSelect={plantCardOnSelect ? () => plantCardOnSelect(plant.id) : undefined}
                />
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
                    onSelect={plantCardOnSelect}
                  />
                )
              })}
              {(() => {
                const ungrouped = plantList.filter(
                  p => p.groupId === null || !groupList.some(g => g.id === p.groupId)
                )
                return ungrouped.length > 0 ? (
                  <div className={gridClass}>
                    {ungrouped.map(plant => (
                      <PlantCard
                        key={plant.id}
                        plant={plant}
                        today={today}
                        canEdit={isOwner}
                        groups={isOwner ? groupList : undefined}
                        onMove={isOwner ? handleMove : undefined}
                        onSelect={plantCardOnSelect ? () => plantCardOnSelect(plant.id) : undefined}
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

      {selectedPlant && (
        <PlantDetailPanel plant={selectedPlant} onClose={handlePanelClose} />
      )}
    </main>
  )
}
