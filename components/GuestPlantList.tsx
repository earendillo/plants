// components/GuestPlantList.tsx
'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Plant } from '@/types'
import { isDueForWatering } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { PlantIcon, PLANT_TINTS } from '@/components/PlantIcon'

type Props = {
  initialPlants: Plant[]
}

export function GuestPlantList({ initialPlants }: Props) {
  const t = useTranslations('guestPlantList')
  const [plants, setPlants] = useState<Plant[]>(initialPlants)
  const today = new Date()

  async function handleWater(plantId: string) {
    const res = await fetch(`/api/guest/plants/${plantId}/water`, {
      method: 'POST',
    })
    if (!res.ok) return
    const data = (await res.json()) as { updated: boolean }
    if (data.updated) {
      setPlants(prev =>
        prev.map(p =>
          p.id === plantId ? { ...p, lastWateredAt: new Date().toISOString() } : p
        )
      )
    }
  }


  if (plants.length === 0) {
    return <p className="text-brand-fg-dim">{t('empty')}</p>
  }

  return (
    <ul className="space-y-3">
      {plants.map(plant => {
        const waterDue = isDueForWatering(plant, today)
        return (
          <li
            key={plant.id}
            className="flex items-center gap-3 rounded-lg border border-white/10 bg-brand-surface p-4"
          >
            <PlantIcon type={plant.type} color={PLANT_TINTS[plant.type]} size={32} />
            <span className="flex-1 font-medium text-brand-fg">{plant.name}</span>
            <Button
              onClick={() => handleWater(plant.id)}
              disabled={!waterDue}
              size="sm"
              className="bg-brand-cta text-brand-cta-fg hover:brightness-[0.92] disabled:opacity-40"
            >
              {t('water')}
            </Button>
          </li>
        )
      })}
    </ul>
  )
}
