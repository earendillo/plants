'use client'

import Link from 'next/link'
import { Plant, PlantGroup } from '@/types'
import { daysUntilDue } from '@/lib/utils'
import { useLongPress } from '@/hooks/useLongPress'
import { PlantCardBody, PlantCardStatus } from '@/components/PlantCardBody'
import { PlantCardContextMenu } from '@/components/PlantCardContextMenu'

type Props = {
  plant: Plant
  today: Date
  canEdit: boolean
  groups?: PlantGroup[]
  onMove?: (plantId: string, groupId: string | null) => void
  onSelect?: () => void
}

function getWorstStatus(waterDays: number, feedDays: number): PlantCardStatus {
  const worst = Math.min(waterDays, feedDays)
  if (worst < 0) return 'overdue'
  if (worst === 0) return 'due-today'
  return 'ok'
}

export function PlantCard({ plant, today, canEdit, groups, onMove, onSelect }: Props) {
  const showMenu = groups !== undefined && groups.length > 0
  const { menuOpen, setMenuOpen, pressing, longPressedRef, handlers } = useLongPress(showMenu)

  const waterDays = daysUntilDue(plant.lastWateredAt, plant.wateringIntervalDays, today)
  const feedDays = daysUntilDue(plant.lastFedAt, plant.feedingIntervalDays, today)
  const status = getWorstStatus(waterDays, feedDays)
  const bestDays = Math.min(waterDays, feedDays)

  // Suppresses iOS Safari's native link callout which fires pointercancel before our timer
  const iosSuppressStyle = showMenu
    ? ({ WebkitTouchCallout: 'none', WebkitUserSelect: 'none', userSelect: 'none' } as React.CSSProperties)
    : undefined

  const card = <PlantCardBody plant={plant} status={status} bestDays={bestDays} pressing={pressing} />

  const menu = showMenu ? (
    <PlantCardContextMenu
      plant={plant}
      groups={groups}
      open={menuOpen}
      onClose={() => setMenuOpen(false)}
      onMove={(groupId) => onMove?.(plant.id, groupId)}
    />
  ) : null

  if (!canEdit) {
    return (
      <div {...handlers} style={iosSuppressStyle}>
        {card}
        {menu}
      </div>
    )
  }

  if (onSelect) {
    return (
      <>
        <button
          className="block w-full text-left"
          style={iosSuppressStyle}
          {...handlers}
          onClick={(e) => { handlers.onClick(e); if (!longPressedRef.current) onSelect() }}
        >
          {card}
        </button>
        {menu}
      </>
    )
  }

  return (
    <>
      <Link href={`/plants/${plant.id}`} className="block" style={iosSuppressStyle} {...handlers}>
        {card}
      </Link>
      {menu}
    </>
  )
}
