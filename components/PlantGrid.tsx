'use client'

import { Plant, PlantGroup } from '@/types'
import { PlantCard } from '@/components/PlantCard'
import { PlantGroupSection } from '@/components/PlantGroupSection'

type Props = {
  plants: Plant[]
  groups: PlantGroup[]
  today: Date
  isOwner: boolean
  panelOpen: boolean
  collapsed: Set<string>
  onToggleGroup: (id: string) => void
  onMove: (plantId: string, groupId: string | null) => void
  onSelect?: (plantId: string) => void
}

export function PlantGrid({
  plants, groups, today, isOwner, panelOpen, collapsed, onToggleGroup, onMove, onSelect,
}: Props) {
  const gridClass = `grid gap-3 ${panelOpen ? 'grid-cols-2' : 'grid-cols-2 lg:grid-cols-3'}`

  if (groups.length === 0) {
    return (
      <div className={gridClass}>
        {plants.map(plant => (
          <PlantCard
            key={plant.id}
            plant={plant}
            today={today}
            canEdit={isOwner}
            onSelect={onSelect ? () => onSelect(plant.id) : undefined}
          />
        ))}
      </div>
    )
  }

  const ungrouped = plants.filter(
    p => p.groupId === null || !groups.some(g => g.id === p.groupId)
  )

  return (
    <>
      {groups.map(group => (
        <PlantGroupSection
          key={group.id}
          id={group.id}
          name={group.name}
          plants={plants.filter(p => p.groupId === group.id)}
          today={today}
          canEdit={isOwner}
          collapsed={collapsed.has(group.id)}
          onToggle={onToggleGroup}
          groups={isOwner ? groups : undefined}
          onMove={isOwner ? onMove : undefined}
          onSelect={onSelect}
        />
      ))}
      {ungrouped.length > 0 && (
        <div className={gridClass}>
          {ungrouped.map(plant => (
            <PlantCard
              key={plant.id}
              plant={plant}
              today={today}
              canEdit={isOwner}
              groups={isOwner ? groups : undefined}
              onMove={isOwner ? onMove : undefined}
              onSelect={onSelect ? () => onSelect(plant.id) : undefined}
            />
          ))}
        </div>
      )}
    </>
  )
}
