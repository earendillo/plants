'use client'

import { PlantType } from '@/types'
import { PlantTypeSelector } from '@/components/PlantTypeSelector'

const INPUT_CLS = 'w-full rounded-[11px] border border-white/[0.09] bg-brand-surface px-3 py-2.5 text-sm text-brand-fg placeholder:text-brand-fg-dim focus:border-brand-cta focus:outline-none'
const LABEL_CLS = 'mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.07em] text-brand-fg-dim'

type Props = {
  name: string
  type: PlantType
  waterDays: string
  feedDays: string
  saving: boolean
  onNameChange: (value: string) => void
  onTypeChange: (value: PlantType) => void
  onWaterDaysChange: (value: string) => void
  onFeedDaysChange: (value: string) => void
  onSave: () => void
  onDelete: () => void
}

export function PlantDetailForm({
  name, type, waterDays, feedDays, saving,
  onNameChange, onTypeChange, onWaterDaysChange, onFeedDaysChange, onSave, onDelete,
}: Props) {
  return (
    <>
      <p className="mb-4 font-heading text-2xl leading-none text-brand-fg" style={{ fontWeight: 400, letterSpacing: '-0.025em' }}>
        {name || 'Unnamed plant'}
      </p>
      <div className="mb-3">
        <label className={LABEL_CLS}>Name</label>
        <input className={INPUT_CLS} value={name} onChange={e => onNameChange(e.target.value)} placeholder="Plant name" />
      </div>
      <div className="mb-3.5 grid grid-cols-2 gap-2.5">
        <div>
          <label className={LABEL_CLS}>Water every</label>
          <div className="relative">
            <input type="number" className={`${INPUT_CLS} pr-7`} value={waterDays} onChange={e => onWaterDaysChange(e.target.value)} min="1" />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-brand-fg-dim">d</span>
          </div>
        </div>
        <div>
          <label className={LABEL_CLS}>Feed every</label>
          <div className="relative">
            <input type="number" className={`${INPUT_CLS} pr-7`} value={feedDays} onChange={e => onFeedDaysChange(e.target.value)} min="1" />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-brand-fg-dim">d</span>
          </div>
        </div>
      </div>
      <div className="mb-5">
        <PlantTypeSelector value={type} onChange={onTypeChange} />
      </div>
      <button
        onClick={onSave}
        disabled={saving}
        className="mb-2 w-full rounded-[13px] bg-brand-cta py-3 text-sm font-bold text-brand-cta-fg shadow-[0_4px_18px_rgba(207,238,158,0.18)] transition-[filter] hover:brightness-90 disabled:opacity-60"
      >
        {saving ? '…' : 'Save changes'}
      </button>
      <button
        onClick={onDelete}
        className="w-full rounded-[13px] border border-brand-alert/35 bg-brand-alert/[0.09] py-3 text-sm font-semibold text-[#f07070]"
      >
        Delete plant
      </button>
    </>
  )
}
