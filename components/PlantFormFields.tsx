'use client'

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
        <div>
          <label htmlFor="garden" className={labelClass}>
            {t('gardenLabel')}
          </label>
          <select
            id="garden"
            value={selectedGardenId}
            onChange={e => onGardenChange(e.target.value)}
            className={inputClass}
          >
            {gardens.map(g => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>
      )}
    </>
  )
}
