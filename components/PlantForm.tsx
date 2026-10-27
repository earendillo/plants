'use client'

import { type ReactNode, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useQueryClient } from '@tanstack/react-query'
import { usePlantGroups } from '@/hooks/queries'
import { Garden, Plant } from '@/types'
import type { PlantType } from '@/types'
import { PlantFormFields } from '@/components/PlantFormFields'
import { PlantEditHero } from '@/components/PlantEditHero'
import { PlantDetailTabs } from '@/components/PlantDetailTabs'
import { PlantFormActions } from '@/components/PlantFormActions'

type Props = {
  plant?: Plant
  gardenId?: string
  gardens?: Garden[]
  activityContent?: ReactNode
}

export function PlantForm({ plant, gardenId, gardens, activityContent }: Props) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const t = useTranslations('plantForm')
  const [plantType, setPlantType] = useState<PlantType>(plant?.type ?? 'other')
  const [name, setName] = useState(plant?.name ?? '')
  const [waterDays, setWaterDays] = useState(String(plant?.wateringIntervalDays ?? 7))
  const [feedDays, setFeedDays] = useState(String(plant?.feedingIntervalDays ?? 30))
  const [selectedGardenId, setSelectedGardenId] = useState(plant?.gardenId ?? gardenId ?? '')
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(plant?.groupId ?? null)
  const { data: groups } = usePlantGroups(selectedGardenId || gardenId || null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleGardenChange(id: string) {
    setSelectedGardenId(id)
    setSelectedGroupId(null)
  }

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

    const shared = { type: plantType, name, wateringIntervalDays: waterInt, feedingIntervalDays: feedInt }
    const body = plant
      ? { ...shared, lastWateredAt: plant.lastWateredAt, lastFedAt: plant.lastFedAt, gardenId: selectedGardenId, groupId: selectedGroupId }
      : { ...shared, gardenId: selectedGardenId || gardenId!, lastWateredAt: null, lastFedAt: null, groupId: selectedGroupId }

    try {
      const res = await fetch(plant ? `/api/plants/${plant.id}` : '/api/plants', {
        method: plant ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error(`Server error: ${res.status}`)
      await queryClient.invalidateQueries({ queryKey: ['plants'] })
      const targetGardenId = selectedGardenId || gardenId || plant?.gardenId
      router.push(targetGardenId ? `/plants?garden=${targetGardenId}` : '/plants')
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
      await queryClient.invalidateQueries({ queryKey: ['plants'] })
      const targetGardenId = gardenId ?? plant?.gardenId
      router.push(targetGardenId ? `/plants?garden=${targetGardenId}` : '/plants')
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
        gardens={gardens} selectedGardenId={selectedGardenId} onGardenChange={handleGardenChange}
        groups={groups ?? []} selectedGroupId={selectedGroupId} onGroupChange={setSelectedGroupId}
      />

      <PlantFormActions isEdit={!!plant} loading={loading} onDelete={handleDelete} />
    </form>
  )

  return (
    <div className="flex h-full flex-col">
      <PlantEditHero plantType={plantType} onBack={handleBack} />

      <div className="flex-1 overflow-x-hidden overflow-y-auto px-5 pt-5 pb-28">
        <div className="mx-auto w-full max-w-lg">
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
    </div>
  )
}
