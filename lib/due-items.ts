import { Plant } from '@/types'
import { isDueForWatering, isDueForFeeding, daysUntilDue } from '@/lib/utils'

export type DueItem = {
  plant: Plant
  action: 'water' | 'feed'
  daysUntil: number
}

export function collectDueItems(plants: Plant[], today: Date): DueItem[] {
  const items: DueItem[] = []
  for (const plant of plants) {
    if (isDueForWatering(plant, today)) {
      items.push({
        plant,
        action: 'water',
        daysUntil: daysUntilDue(plant.lastWateredAt, plant.wateringIntervalDays, today),
      })
    }
    if (isDueForFeeding(plant, today)) {
      items.push({
        plant,
        action: 'feed',
        daysUntil: daysUntilDue(plant.lastFedAt, plant.feedingIntervalDays, today),
      })
    }
  }
  return items
}
