'use client'

import { useTranslations } from 'next-intl'
import { Garden } from '@/types'

type Props = {
  emoji: string
  name: string
  waterDays: string
  feedDays: string
  onEmojiChange: (v: string) => void
  onNameChange: (v: string) => void
  onWaterDaysChange: (v: string) => void
  onFeedDaysChange: (v: string) => void
  inputClass: string
  gardens?: Garden[]
  selectedGardenId?: string
  onGardenChange?: (id: string) => void
}

export function PlantFormFields({
  emoji,
  name,
  waterDays,
  feedDays,
  onEmojiChange,
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
        <label htmlFor="emoji" className="block text-sm font-semibold text-brand-muted">
          {t('emojiLabel')}
        </label>
        <input
          id="emoji"
          value={emoji}
          onChange={e => onEmojiChange(e.target.value)}
          required
          maxLength={4}
          className="mt-1 w-16 rounded-lg border border-white/10 bg-brand-surface px-3 py-3 text-center text-2xl text-brand-fg focus:border-brand-cta focus:outline-none focus:ring-1 focus:ring-brand-cta/20"
        />
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
