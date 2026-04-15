'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plant } from '@/types'
import { PlantFormFields } from '@/components/PlantFormFields'

type Props = {
  plant?: Plant
}

export function PlantForm({ plant }: Props) {
  const router = useRouter()
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
      setError('Please enter valid numbers for watering and feeding intervals.')
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
      setError('Failed to save. Please try again.')
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
      setError('Failed to delete. Please try again.')
      setLoading(false)
    }
  }

  const inputClass =
    'mt-1 block w-full rounded-lg border border-slate-200 px-4 py-3 text-slate-900 ' +
    'placeholder:text-slate-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500'

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
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
        className="w-full rounded-lg bg-green-600 py-4 text-base font-semibold text-white hover:bg-green-700 active:bg-green-800 disabled:opacity-50"
      >
        {loading ? 'Saving…' : plant ? 'Save Changes' : 'Save Plant'}
      </button>

      {plant && (
        <button
          type="button"
          onClick={handleDelete}
          disabled={loading}
          className="w-full rounded-lg border border-red-300 py-3 text-base font-semibold text-red-500 hover:bg-red-50 active:bg-red-100 disabled:opacity-50"
        >
          Delete Plant
        </button>
      )}
    </form>
  )
}
