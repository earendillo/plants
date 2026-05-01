'use client'

import { useTranslations } from 'next-intl'
import { Garden } from '@/types'
import { type PlantType, PLANT_TYPE_LABELS } from '@/components/PlantIcon'

type Props = {
  plantType: PlantType
  name: string
  waterDays: string
  feedDays: string
  onPlantTypeChange: (v: PlantType) => void
  onNameChange: (v: string) => void
  onWaterDaysChange: (v: string) => void
  onFeedDaysChange: (v: string) => void
  inputClass: string
  gardens?: Garden[]
  selectedGardenId?: string
  onGardenChange?: (id: string) => void
}

const PLANT_TYPES = Object.keys(PLANT_TYPE_LABELS) as PlantType[]

export function PlantFormFields({
  plantType,
  name,
  waterDays,
  feedDays,
  onPlantTypeChange,
  onNameChange,
  onWaterDaysChange,
  onFeedDaysChange,
  inputClass,
  gardens,
  selectedGardenId,
  onGardenChange,
}: Props) {
  const t = useTranslations('plantFormFields')

  return (
    <>
      <div>
        <label htmlFor="plantType" className="block text-sm font-semibold text-brand-muted">
          {t('typeLabel')}
        </label>
        <select
          id="plantType"
          value={plantType}
          onChange={e => onPlantTypeChange(e.target.value as PlantType)}
          className={inputClass}
        >
          {PLANT_TYPES.map(pt => (
            <option key={pt} value={pt}>
              {PLANT_TYPE_LABELS[pt]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-semibold text-brand-muted">
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

      <div>
        <label htmlFor="waterDays" className="block text-sm font-semibold text-brand-muted">
          {t('waterDaysLabel')}
        </label>
        <input
          id="waterDays"
          type="number"
          value={waterDays}
          onChange={e => onWaterDaysChange(e.target.value)}
          required
          min={1}
          max={365}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="feedDays" className="block text-sm font-semibold text-brand-muted">
          {t('feedDaysLabel')}
        </label>
        <input
          id="feedDays"
          type="number"
          value={feedDays}
          onChange={e => onFeedDaysChange(e.target.value)}
          required
          min={1}
          max={365}
          className={inputClass}
        />
      </div>

      {gardens && gardens.length > 1 && onGardenChange && (
        <div>
          <label htmlFor="garden" className="block text-sm font-semibold text-brand-muted">
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
