'use client'

import { FolderIcon, ChevronDownIcon } from 'lucide-react'
import { PlantCard } from '@/components/PlantCard'
import type { Plant, PlantGroup } from '@/types'

type Props = {
  id: string
  name: string
  plants: Plant[]
  today: Date
  canEdit: boolean
  collapsed: boolean
  onToggle: (id: string) => void
  groups?: PlantGroup[]
  onMove?: (plantId: string, groupId: string | null) => void
}

export function PlantGroupSection({ id, name, plants, today, canEdit, collapsed, onToggle, groups, onMove }: Props) {
  return (
    <div
      className="mb-4 rounded-[24px] border p-3"
      style={{ borderColor: 'rgba(255,255,255,0.09)', background: 'rgba(255,255,255,0.025)' }}
    >
      <button
        className="flex w-full items-center gap-2 pb-3"
        onClick={() => onToggle(id)}
      >
        <FolderIcon className="size-3.5 text-brand-fg-dim" />
        <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-brand-fg-dim">
          {name}
        </span>
        <span className="ml-1 text-[10px] text-brand-fg-dim/60">
          {plants.length}
        </span>
        <ChevronDownIcon
          className={`ml-auto size-3.5 text-brand-fg-dim transition-transform ${collapsed ? 'rotate-180' : ''}`}
        />
      </button>
      {!collapsed && (
        <div className="grid grid-cols-2 gap-[10px]">
          {plants.map(plant => (
            <PlantCard key={plant.id} plant={plant} today={today} canEdit={canEdit} groups={groups} onMove={onMove} />
          ))}
        </div>
      )}
    </div>
  )
}
