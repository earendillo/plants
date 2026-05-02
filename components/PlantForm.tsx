'use client'

import { type ReactNode, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Garden, Plant } from '@/types'
import { type PlantType } from '@/components/PlantIcon'
import { PlantFormFields } from '@/components/PlantFormFields'
import { PlantEditHero } from '@/components/PlantEditHero'
import { PlantDetailTabs } from '@/components/PlantDetailTabs'

type Props = {
  plant?: Plant
  gardenId?: string
  gardens?: Garden[]
  activityContent?: ReactNode
}

export function PlantForm({ plant, gardenId, gardens, activityContent }: Props) {
  const router = useRouter()
  const t = useTranslations('plantForm')
  const [plantType, setPlantType] = useState<PlantType>(plant?.type ?? 'other')
  const [name, setName] = useState(plant?.name ?? '')
  const [waterDays, setWaterDays] = useState(String(plant?.wateringIntervalDays ?? 7))
  const [feedDays, setFeedDays] = useState(String(plant?.feedingIntervalDays ?? 30))
  const [selectedGardenId, setSelectedGardenId] = useState(plant?.gardenId ?? gardenId ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleBack() {
    if (plant) {
      router.back()
    } else {
      const gId = gardenId ?? selectedGardenId
      router.push(gId ? `/plants?garden=${gId}` : '/plants')
    }
  }

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

    const body = plant
      ? {
          type: plantType, name,
          wateringIntervalDays: waterInt, feedingIntervalDays: feedInt,
          lastWateredAt: plant.lastWateredAt, lastFedAt: plant.lastFedAt,
          gardenId: selectedGardenId,
        }
      : {
          gardenId: selectedGardenId || gardenId!,
          type: plantType, name,
          wateringIntervalDays: waterInt, feedingIntervalDays: feedInt,
          lastWateredAt: null, lastFedAt: null,
        }

    try {
      const res = await fetch(
        plant ? `/api/plants/${plant.id}` : '/api/plants',
        { method: plant ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) },
      )
      if (!res.ok) throw new Error(`Server error: ${res.status}`)
      const targetGardenId = selectedGardenId || gardenId || plant?.gardenId
      router.push(targetGardenId ? `/plants?garden=${targetGardenId}` : '/plants')
      router.refresh()
    } catch {
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
      const targetGardenId = gardenId ?? plant?.gardenId
      router.push(targetGardenId ? `/plants?garden=${targetGardenId}` : '/plants')
      router.refresh()
    } catch {
      setError(t('errorDeleteFailed'))
      setLoading(false)
    }
  }

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p className="rounded-xl border border-brand-alert/30 bg-brand-alert/10 px-4 py-3 text-sm text-brand-alert">
          {error}
        </p>
      )}

      <PlantFormFields
        plantType={plantType} name={name} waterDays={waterDays} feedDays={feedDays}
        onPlantTypeChange={setPlantType} onNameChange={setName}
        onWaterDaysChange={setWaterDays} onFeedDaysChange={setFeedDays}
        gardens={gardens} selectedGardenId={selectedGardenId} onGardenChange={setSelectedGardenId}
      />

      <button
        type="submit" disabled={loading}
        className="w-full rounded-2xl bg-brand-cta py-3.5 text-sm font-bold text-brand-cta-fg shadow-[0_4px_20px_rgba(207,238,158,0.2)] transition-[filter] hover:brightness-[0.92] active:brightness-[0.84] disabled:opacity-50"
      >
        {loading ? t('saving') : plant ? t('saveChanges') : t('savePlant')}
      </button>

      {plant && (
        <button
          type="button" onClick={handleDelete} disabled={loading}
          className="w-full rounded-2xl border-[1.5px] border-[rgba(224,85,85,0.40)] bg-[rgba(224,85,85,0.10)] py-3 text-[13px] font-semibold text-[#f07070] disabled:opacity-50"
        >
          {t('deletePlant')}
        </button>
      )}
    </form>
  )

  return (
    <div className="flex h-full flex-col">
      <PlantEditHero plantType={plantType} onBack={handleBack} />

      <div className="flex-1 overflow-y-auto px-5 pt-5 pb-6">
        <h1 className="mb-5 text-[28px] font-normal leading-none tracking-tight">
          {name || t('unnamedPlant')}
        </h1>

        {plant && activityContent ? (
          <PlantDetailTabs
            detailsContent={formContent}
            activityContent={activityContent}
          />
        ) : (
          formContent
        )}
      </div>
    </div>
  )
}
