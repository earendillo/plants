'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Plant } from '@/types'
import { PlantFormFields } from '@/components/PlantFormFields'

type Props = {
  plant?: Plant
}

export function PlantForm({ plant }: Props) {
  const router = useRouter()
  const t = useTranslations('plantForm')
  const [emoji, setEmoji] = useState(plant?.emoji ?? '🌿')
  const [name, setName] = useState(plant?.name ?? '')
  const [waterDays, setWaterDays] = useState(
    String(plant?.wateringIntervalDays ?? 7)
  )
  const [feedDays, setFeedDays] = useState(
    String(plant?.feedingIntervalDays ?? 30)
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const waterInt = parseInt(waterDays, 10)
    const feedInt = parseInt(feedDays, 10)
    if (isNaN(waterInt) || isNaN(feedInt)) {
      setError(t('errorInvalidNumbers'))
      setLoading(false)
      return
    }

    const body = {
      emoji,
      name,
      wateringIntervalDays: waterInt,
      feedingIntervalDays: feedInt,
      lastWateredAt: plant?.lastWateredAt ?? null,
      lastFedAt: plant?.lastFedAt ?? null,
    }

    try {
      const res = await fetch(
        plant ? `/api/plants/${plant.id}` : '/api/plants',
        {
          method: plant ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }
      )

      if (!res.ok) throw new Error(`Server error: ${res.status}`)

      router.push('/plants')
      router.refresh()
    } catch (err) {
      console.error('Save failed', err)
      setError(t('errorSaveFailed'))
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!plant) return
    setLoading(true)
    try {
      const res = await fetch(`/api/plants/${plant.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error(`Server error: ${res.status}`)
      router.push('/plants')
      router.refresh()
    } catch (err) {
      console.error('Delete failed', err)
      setError(t('errorDeleteFailed'))
      setLoading(false)
    }
  }

  const inputClass =
    'mt-1 block w-full rounded-lg border border-white/10 bg-brand-surface px-4 py-3 ' +
    'text-brand-fg placeholder:text-brand-fg-dim focus:border-brand-cta ' +
    'focus:outline-none focus:ring-1 focus:ring-brand-cta/20'

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <p className="rounded-lg border border-brand-alert/30 bg-brand-alert/10 px-4 py-3 text-sm text-brand-alert">
          {error}
        </p>
      )}

      <PlantFormFields
        emoji={emoji}
        name={name}
        waterDays={waterDays}
        feedDays={feedDays}
        onEmojiChange={setEmoji}
        onNameChange={setName}
        onWaterDaysChange={setWaterDays}
        onFeedDaysChange={setFeedDays}
        inputClass={inputClass}
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-brand-cta py-4 text-base font-semibold text-brand-cta-fg transition-[filter] hover:brightness-[0.92] active:brightness-[0.84] disabled:opacity-50"
      >
        {loading ? t('saving') : plant ? t('saveChanges') : t('savePlant')}
      </button>

      {plant && (
        <button
          type="button"
          onClick={handleDelete}
          disabled={loading}
          className="w-full rounded-lg border border-brand-alert/35 py-3 text-base font-semibold text-brand-alert hover:bg-brand-alert/10 active:bg-brand-alert/15 disabled:opacity-50"
        >
          {t('deletePlant')}
        </button>
      )}
    </form>
  )
}
