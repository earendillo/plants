'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Plant, PlantGroup } from '@/types'
import { daysUntilDue } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { PlantIcon, PLANT_TINTS } from '@/components/PlantIcon'
import { PlantCardContextMenu } from '@/components/PlantCardContextMenu'

type Props = {
  plant: Plant
  today: Date
  canEdit: boolean
  groups?: PlantGroup[]
  onMove?: (plantId: string, groupId: string | null) => void
}

type Status = 'overdue' | 'due-today' | 'ok'

function getWorstStatus(waterDays: number, feedDays: number): Status {
  const worst = Math.min(waterDays, feedDays)
  if (worst < 0) return 'overdue'
  if (worst === 0) return 'due-today'
  return 'ok'
}

export function PlantCard({ plant, today, canEdit, groups, onMove }: Props) {
  const t = useTranslations('plantCard')
  const [menuOpen, setMenuOpen] = useState(false)
  const [pressing, setPressing] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const longPressedRef = useRef(false)

  const waterDays = daysUntilDue(plant.lastWateredAt, plant.wateringIntervalDays, today)
  const feedDays = daysUntilDue(plant.lastFedAt, plant.feedingIntervalDays, today)
  const status = getWorstStatus(waterDays, feedDays)
  const bestDays = Math.min(waterDays, feedDays)

  const tint = PLANT_TINTS[plant.type]
  const borderColor = status === 'overdue' ? 'rgba(224,85,85,0.22)' : 'rgba(255,255,255,0.07)'
  const boxShadow = status === 'overdue' ? '0 4px 24px rgba(224,85,85,0.08)' : '0 2px 12px rgba(0,0,0,0.2)'

  const showMenu = groups !== undefined && groups.length > 0

  function handlePointerDown() {
    if (!showMenu) return
    longPressedRef.current = false
    setPressing(true)
    timerRef.current = setTimeout(() => {
      longPressedRef.current = true
      setPressing(false)
      setMenuOpen(true)
    }, 600)
  }

  function cancelTimer() {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    setPressing(false)
  }

  function handlePointerUp() { cancelTimer() }
  const handlePointerLeave = cancelTimer
  const handlePointerCancel = cancelTimer

  function handleClick(e: React.MouseEvent) {
    if (longPressedRef.current) {
      e.preventDefault()
      longPressedRef.current = false
    }
  }

  const longPressHandlers = {
    onPointerDown: handlePointerDown,
    onPointerUp: handlePointerUp,
    onPointerLeave: handlePointerLeave,
    onPointerCancel: handlePointerCancel,
    onClick: handleClick,
  } as const

  const card = (
    <div
      className={`relative overflow-hidden rounded-[22px] bg-brand-surface transition-[scale,box-shadow] duration-300 ease-out hover:scale-[0.97] hover:shadow-[0_2px_8px_rgba(0,0,0,0.25)] ${pressing ? 'scale-[0.94]' : ''}`}
      style={{ border: `1px solid ${borderColor}`, boxShadow }}
    >
      <div className="grain-overlay" />

      {/* Illustration zone */}
      <div
        className="relative flex h-[104px] items-center justify-center"
        style={{ background: `${tint}18`, borderBottom: '1px solid rgba(255,255,255,0.04)' }}
      >
        <div
          className="absolute size-[72px] rounded-full"
          style={{ background: `${tint}12` }}
        />
        <PlantIcon type={plant.type} color={tint} size={50} />
        {status !== 'ok' && (
          <div
            className="absolute right-2.5 top-2.5 size-2 rounded-full"
            style={{
              background: status === 'overdue' ? '#e05555' : '#E8C86A',
              boxShadow: `0 0 0 3px #222820`,
            }}
          />
        )}
      </div>

      {/* Info zone */}
      <div className="px-3 pb-3 pt-2.5">
        <p
          className="font-heading text-base leading-tight text-brand-fg"
          style={{ letterSpacing: '-0.015em', fontWeight: 400 }}
        >
          {plant.name}
        </p>
        <p className="mt-1 font-sans text-[11px] tracking-[0.01em] text-brand-fg-dim">
          W·{plant.wateringIntervalDays}d &nbsp;F·{plant.feedingIntervalDays}d
        </p>
        <div className="mt-2">
          {status === 'ok' ? (
            <span className="text-[11px] text-brand-fg-dim">
              {t('statusOk', { days: bestDays })}
            </span>
          ) : (
            <Badge variant={status === 'overdue' ? 'overdue-verbose' : 'due-today-verbose'}>
              {status === 'overdue' ? t('statusOverdue') : t('statusDueToday')}
            </Badge>
          )}
        </div>
      </div>
    </div>
  )

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
      <div {...longPressHandlers}>
        {card}
        {menu}
      </div>
    )
  }

  return (
    <>
      <Link href={`/plants/${plant.id}`} className="block" {...longPressHandlers}>
        {card}
      </Link>
      {menu}
    </>
  )
}
