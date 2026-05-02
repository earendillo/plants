// Frontend types (camelCase). Do NOT use Supabase Row types here.
// Translation between snake_case DB and these types happens in /lib/db/.

import type { PlantType } from '@/components/PlantIcon'

export type Plant = {
  id: string
  userId: string
  gardenId: string
  name: string
  type: PlantType
  wateringIntervalDays: number
  feedingIntervalDays: number
  lastWateredAt: string | null
  lastFedAt: string | null
  createdAt: string | null
}

export type PlantInsert = Omit<Plant, 'id' | 'createdAt'>
export type PlantUpdate = Partial<Omit<Plant, 'id' | 'createdAt'>>

export type Garden = {
  id: string
  name: string
  userId: string
  createdAt: string
  role: GardenRole
}

export type ActivityLog = {
  id: string
  plantId: string
  activityType: ActivityType
  performedAt: string | null
  performedByUserId: string | null
  performedByName: string | null
}

export type Profile = {
  id: string
  displayName: string | null
  avatarUrl: string | null
  timezone: string | null
  createdAt: string | null
}

export type GardenMember = {
  gardenId: string
  userId: string
  role: GardenRole
  createdAt: string
}

export type GardenRole = 'owner' | 'limited_editor'
export type ActivityType = 'water' | 'feed'
