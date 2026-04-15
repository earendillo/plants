import { Plant } from '@/types'

// In-memory store — intentionally resets on cold start for MVP
// TODO: Replace with Supabase client when ready
const store: Plant[] = [
  {
    id: 'seed-1',
    userId: 'user_1',
    name: 'Monstera',
    emoji: '🌿',
    wateringIntervalDays: 7,
    feedingIntervalDays: 30,
    lastWateredAt: '2026-04-04', // 10 days ago → 3d overdue (interval 7d)
    lastFedAt: '2026-03-01', // 44 days ago → 14d overdue (interval 30d)
    createdAt: '2026-01-01',
  },
  {
    id: 'seed-2',
    userId: 'user_1',
    name: 'Orchid',
    emoji: '🌸',
    wateringIntervalDays: 5,
    feedingIntervalDays: 14,
    lastWateredAt: '2026-04-05', // 9 days ago → 4d overdue (interval 5d)
    lastFedAt: '2026-04-07', // 7 days ago → 7d remaining (interval 14d)
    createdAt: '2026-01-15',
  },
  {
    id: 'seed-3',
    userId: 'user_1',
    name: 'Pothos',
    emoji: '🪴',
    wateringIntervalDays: 3,
    feedingIntervalDays: 14,
    lastWateredAt: '2026-04-12', // 3 days ago → due today (interval 3d)
    lastFedAt: '2026-04-01', // 14 days ago → due today (interval 14d)
    createdAt: '2026-02-01',
  },
  {
    id: 'seed-4',
    userId: 'user_1',
    name: 'Cactus',
    emoji: '🌵',
    wateringIntervalDays: 14,
    feedingIntervalDays: 60,
    lastWateredAt: '2026-04-09', // 5 days ago → 9d remaining (interval 14d)
    lastFedAt: '2026-03-01', // 44 days ago → 16d remaining (interval 60d)
    createdAt: '2026-02-15',
  },
]

export async function getPlants(userId: string): Promise<Plant[]> {
  return store.filter((p) => p.userId === userId)
}

export async function getPlant(
  id: string,
  userId: string
): Promise<Plant | null> {
  return store.find((p) => p.id === id && p.userId === userId) ?? null
}

export async function createPlant(
  data: Omit<Plant, 'id' | 'createdAt'>
): Promise<Plant> {
  const plant: Plant = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  }
  store.push(plant)
  return plant
}

export async function updatePlant(
  id: string,
  data: Partial<Plant>
): Promise<Plant> {
  const idx = store.findIndex((p) => p.id === id)
  if (idx === -1) throw new Error(`Plant ${id} not found`)
  store[idx] = { ...store[idx], ...data }
  return store[idx]
}

export async function deletePlant(id: string): Promise<void> {
  const idx = store.findIndex((p) => p.id === id)
  if (idx !== -1) store.splice(idx, 1)
}
