// components/GuestPlantList.tsx
'use client'

import { useState } from 'react'
import { Plant } from '@/types'
import { isDueForWatering, isDueForFeeding } from '@/lib/utils'
import { Button } from '@/components/ui/button'

type Props = {
  initialPlants: Plant[]
}

export function GuestPlantList({ initialPlants }: Props) {
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

  async function handleFeed(plantId: string) {
    const res = await fetch(`/api/guest/plants/${plantId}/feed`, {
      method: 'POST',
    })
    if (!res.ok) return
    const data = (await res.json()) as { updated: boolean }
    if (data.updated) {
      setPlants(prev =>
        prev.map(p =>
          p.id === plantId ? { ...p, lastFedAt: new Date().toISOString() } : p
        )
      )
    }
  }

  if (plants.length === 0) {
    return <p className="text-brand-fg-dim">No plants in this garden.</p>
  }

  return (
    <ul className="space-y-3">
      {plants.map(plant => {
        const waterDue = isDueForWatering(plant, today)
        const feedDue = isDueForFeeding(plant, today)
        return (
          <li
            key={plant.id}
            className="flex items-center gap-3 rounded-lg border border-white/10 bg-brand-surface p-4"
          >
            <span className="text-2xl">{plant.emoji}</span>
            <span className="flex-1 font-medium text-brand-fg">{plant.name}</span>
            <Button
              onClick={() => handleWater(plant.id)}
              disabled={!waterDue}
              size="sm"
              className="bg-brand-cta text-brand-cta-fg hover:brightness-[0.92] disabled:opacity-40"
            >
              Water
            </Button>
            <Button
              onClick={() => handleFeed(plant.id)}
              disabled={!feedDue}
              size="sm"
              variant="outline"
              className="border-white/10 bg-transparent text-brand-fg hover:bg-white/5 disabled:opacity-40"
            >
              Feed
            </Button>
          </li>
        )
      })}
    </ul>
  )
}
