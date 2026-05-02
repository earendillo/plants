'use client'

import { useState, useRef, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Garden } from '@/types'
import { type PlantType } from '@/components/PlantIcon'
import { PlantTypeSelector } from '@/components/PlantTypeSelector'

type Props = {
  plantType: PlantType
  name: string
  waterDays: string
  feedDays: string
  onPlantTypeChange: (v: PlantType) => void
  onNameChange: (v: string) => void
  onWaterDaysChange: (v: string) => void
  onFeedDaysChange: (v: string) => void
  gardens?: Garden[]
  selectedGardenId?: string
  onGardenChange?: (id: string) => void
}

const labelClass =
  'block text-[11px] font-medium uppercase tracking-[0.07em] text-brand-fg-dim mb-1.5'

const inputClass =
  'block w-full rounded-[14px] border border-white/[0.09] bg-brand-surface2 px-3.5 py-3 ' +
  'text-sm text-brand-fg placeholder:text-brand-fg-dim ' +
  'focus:border-brand-cta focus:outline-none focus:ring-1 focus:ring-brand-cta/20'

export function PlantFormFields({
  plantType,
  name,
  waterDays,
  feedDays,
  onPlantTypeChange,
  onNameChange,
  onWaterDaysChange,
  onFeedDaysChange,
  gardens,
  selectedGardenId,
  onGardenChange,
}: Props) {
  const t = useTranslations('plantFormFields')

  return (
    <>
      <div>
        <label htmlFor="name" className={labelClass}>
          {t('nameLabel')}
        </label>
        <input
          id="name"
          value={name}
          onChange={e => onNameChange(e.target.value)}
          required
          maxLength={100}
          placeholder={t('namePlaceholder')}
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="waterDays" className={labelClass}>
            {t('waterDaysLabel')}
          </label>
          <div className="relative">
            <input
              id="waterDays"
              type="number"
              value={waterDays}
              onChange={e => onWaterDaysChange(e.target.value)}
              required
              min={1}
              max={365}
              className={`${inputClass} pr-8`}
            />
            <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-brand-fg-dim">
              d
            </span>
          </div>
        </div>
        <div>
          <label htmlFor="feedDays" className={labelClass}>
            {t('feedDaysLabel')}
          </label>
          <div className="relative">
            <input
              id="feedDays"
              type="number"
              value={feedDays}
              onChange={e => onFeedDaysChange(e.target.value)}
              required
              min={1}
              max={365}
              className={`${inputClass} pr-8`}
            />
            <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-brand-fg-dim">
              d
            </span>
          </div>
        </div>
      </div>

      <PlantTypeSelector value={plantType} onChange={onPlantTypeChange} />

      {gardens && gardens.length > 1 && onGardenChange && (
        <GardenSelect
          gardens={gardens}
          selectedGardenId={selectedGardenId ?? ''}
          onGardenChange={onGardenChange}
          label={t('gardenLabel')}
        />
      )}
    </>
  )
}

function GardenSelect({
  gardens,
  selectedGardenId,
  onGardenChange,
  label,
}: {
  gardens: Garden[]
  selectedGardenId: string
  onGardenChange: (id: string) => void
  label: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const selected = gardens.find(g => g.id === selectedGardenId)

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  return (
    <div ref={ref} className="relative">
      <span className={labelClass}>{label}</span>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`${inputClass} flex items-center justify-between text-left`}
      >
        <div className="flex items-center gap-2">
          <span className="size-1.5 flex-shrink-0 rounded-full bg-brand-cta" />
          <span>{selected?.name ?? '—'}</span>
        </div>
        <svg
          width="10" height="10" viewBox="0 0 10 10" fill="none"
          className={`opacity-45 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
        >
          <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+6px)] z-50 w-full rounded-2xl border border-white/7 bg-brand-surface2 p-1 shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
          {gardens.map(g => (
            <button
              key={g.id}
              type="button"
              onClick={() => {
                onGardenChange(g.id)
                setOpen(false)
              }}
              className={[
                'flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm transition-colors',
                g.id === selectedGardenId
                  ? 'bg-white/7 font-medium text-brand-fg'
                  : 'text-brand-fg-sub hover:bg-white/5',
              ].join(' ')}
            >
              <span className="size-1.5 flex-shrink-0 rounded-full bg-brand-cta" />
              {g.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
