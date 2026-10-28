'use client'

import { useState, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { Plant, PlantType } from '@/types'
import { PlantDetailHeader } from '@/components/PlantDetailHeader'
import { PlantDetailForm } from '@/components/PlantDetailForm'
import { ActivityTimeline } from '@/components/ActivityTimeline'
import { DeletePlantDialog } from '@/components/DeletePlantDialog'
import { supabase } from '@/lib/supabase/client'

type Props = {
  plant: Plant
  onClose: () => void
}

export function PlantDetailPanel({ plant, onClose }: Props) {
  const queryClient = useQueryClient()
  const t = useTranslations('plantEdit')
  const tTimeline = useTranslations('activityTimeline')
  const [tab, setTab] = useState<'details' | 'activity'>('details')
  const [name, setName] = useState(plant.name)
  const [type, setType] = useState<PlantType>(plant.type)
  const [waterDays, setWaterDays] = useState(String(plant.wateringIntervalDays))
  const [feedDays, setFeedDays] = useState(String(plant.feedingIntervalDays))
  const [saving, setSaving] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [currentUserId, setCurrentUserId] = useState('')

  useEffect(() => {
    setName(plant.name)
    setType(plant.type)
    setWaterDays(String(plant.wateringIntervalDays))
    setFeedDays(String(plant.feedingIntervalDays))
    setTab('details')
    // Intentionally only reset when plant ID changes (not on every field update)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plant.id])

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setCurrentUserId(data.user.id)
    })
  }, [])

  async function handleSave() {
    const wInt = parseInt(waterDays, 10)
    const fInt = parseInt(feedDays, 10)
    if (isNaN(wInt) || isNaN(fInt)) return
    setSaving(true)
    try {
      await fetch(`/api/plants/${plant.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, type,
          wateringIntervalDays: wInt,
          feedingIntervalDays: fInt,
          lastWateredAt: plant.lastWateredAt,
          lastFedAt: plant.lastFedAt,
          gardenId: plant.gardenId,
          groupId: plant.groupId,
        }),
      })
      await queryClient.invalidateQueries({ queryKey: ['plants'] })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await fetch(`/api/plants/${plant.id}`, { method: 'DELETE' })
      await queryClient.invalidateQueries({ queryKey: ['plants'] })
      setDeleteOpen(false)
      onClose()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="slide-in-right fixed bottom-0 right-0 top-[54px] z-30 hidden w-[340px] flex-col border-l border-white/[0.07] bg-brand-surface lg:flex">
      <div className="grain-overlay" />

      <PlantDetailHeader type={type} onClose={onClose} />

      {/* Tabs */}
      <div className="flex shrink-0 gap-1 px-3.5 pt-2.5">
        {(['details', 'activity'] as const).map(key => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={[
              'flex-1 rounded-[9px] py-2 text-xs capitalize transition-colors',
              tab === key ? 'bg-white/[0.08] font-semibold text-brand-fg' : 'font-normal text-brand-fg-dim hover:text-brand-fg-sub',
            ].join(' ')}
          >
            {key === 'details' ? t('tabDetails') : t('tabActivity')}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-3.5 pb-5 pt-3.5">
        {tab === 'details' ? (
          <PlantDetailForm
            name={name}
            type={type}
            waterDays={waterDays}
            feedDays={feedDays}
            saving={saving}
            onNameChange={setName}
            onTypeChange={setType}
            onWaterDaysChange={setWaterDays}
            onFeedDaysChange={setFeedDays}
            onSave={handleSave}
            onDelete={() => setDeleteOpen(true)}
          />
        ) : (
          <>
            <p className="mb-3.5 text-[11px] font-bold uppercase tracking-[0.07em] text-brand-fg-dim">{tTimeline('title')}</p>
            {currentUserId && <ActivityTimeline plantId={plant.id} currentUserId={currentUserId} />}
          </>
        )}
      </div>

      <DeletePlantDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  )
}
