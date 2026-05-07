'use client'

import { useState, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Plant, PlantType } from '@/types'
import { PlantIcon, PLANT_TINTS } from '@/components/PlantIcon'
import { PlantTypeSelector } from '@/components/PlantTypeSelector'
import { ActivityTimeline } from '@/components/ActivityTimeline'
import { DeletePlantDialog } from '@/components/DeletePlantDialog'
import { supabase } from '@/lib/supabase/client'

type Props = {
  plant: Plant
  onClose: () => void
}

const INPUT_CLS = 'w-full rounded-[11px] border border-white/[0.09] bg-brand-surface px-3 py-2.5 text-sm text-brand-fg placeholder:text-brand-fg-dim focus:border-brand-cta focus:outline-none'
const LABEL_CLS = 'mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.07em] text-brand-fg-dim'

export function PlantDetailPanel({ plant, onClose }: Props) {
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<'details' | 'activity'>('details')
  const [name, setName] = useState(plant.name)
  const [type, setType] = useState<PlantType>(plant.type)
  const [waterDays, setWaterDays] = useState(String(plant.wateringIntervalDays))
  const [feedDays, setFeedDays] = useState(String(plant.feedingIntervalDays))
  const [saving, setSaving] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [currentUserId, setCurrentUserId] = useState('')
  const tint = PLANT_TINTS[type]

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

      {/* Illustration header */}
      <div
        className="relative flex h-[150px] shrink-0 items-center justify-center border-b border-white/[0.05]"
        style={{ background: `${tint}17` }}
      >
        <div className="flex size-[88px] items-center justify-center rounded-full" style={{ background: `${tint}12` }}>
          <PlantIcon type={type} color={tint} size={58} />
        </div>
        <button
          onClick={onClose}
          className="absolute right-3 top-3 flex size-[30px] items-center justify-center rounded-lg border border-white/[0.12] bg-black/25 text-brand-fg-sub transition-colors hover:bg-black/40"
        >
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
            <path d="M2 2L12 12M12 2L2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex shrink-0 gap-1 px-3.5 pt-2.5">
        {(['details', 'activity'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={[
              'flex-1 rounded-[9px] py-2 text-xs capitalize transition-colors',
              tab === t ? 'bg-white/[0.08] font-semibold text-brand-fg' : 'font-normal text-brand-fg-dim hover:text-brand-fg-sub',
            ].join(' ')}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-3.5 pb-5 pt-3.5">
        {tab === 'details' ? (
          <>
            <p className="mb-4 font-heading text-2xl leading-none text-brand-fg" style={{ fontWeight: 400, letterSpacing: '-0.025em' }}>
              {name || 'Unnamed plant'}
            </p>
            <div className="mb-3">
              <label className={LABEL_CLS}>Name</label>
              <input className={INPUT_CLS} value={name} onChange={e => setName(e.target.value)} placeholder="Plant name" />
            </div>
            <div className="mb-3.5 grid grid-cols-2 gap-2.5">
              <div>
                <label className={LABEL_CLS}>Water every</label>
                <div className="relative">
                  <input type="number" className={`${INPUT_CLS} pr-7`} value={waterDays} onChange={e => setWaterDays(e.target.value)} min="1" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-brand-fg-dim">d</span>
                </div>
              </div>
              <div>
                <label className={LABEL_CLS}>Feed every</label>
                <div className="relative">
                  <input type="number" className={`${INPUT_CLS} pr-7`} value={feedDays} onChange={e => setFeedDays(e.target.value)} min="1" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-brand-fg-dim">d</span>
                </div>
              </div>
            </div>
            <div className="mb-5">
              <PlantTypeSelector value={type} onChange={setType} />
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="mb-2 w-full rounded-[13px] bg-brand-cta py-3 text-sm font-bold text-brand-cta-fg shadow-[0_4px_18px_rgba(207,238,158,0.18)] transition-[filter] hover:brightness-90 disabled:opacity-60"
            >
              {saving ? '…' : 'Save changes'}
            </button>
            <button
              onClick={() => setDeleteOpen(true)}
              className="w-full rounded-[13px] border border-brand-alert/35 bg-brand-alert/[0.09] py-3 text-sm font-semibold text-[#f07070]"
            >
              Delete plant
            </button>
          </>
        ) : (
          <>
            <p className="mb-3.5 text-[11px] font-bold uppercase tracking-[0.07em] text-brand-fg-dim">Recent activity</p>
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
