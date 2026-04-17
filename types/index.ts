export type Plant = {
  id: string
  userId: string
  gardenId: string
  name: string
  emoji: string
  wateringIntervalDays: number
  feedingIntervalDays: number
  lastWateredAt: string | null  // ISO date string, e.g. "2026-04-14"
  lastFedAt: string | null      // ISO date string
  createdAt: string             // ISO date string
}

export type Garden = {
  id: string
  name: string
  userId: string
  createdAt: string
}
