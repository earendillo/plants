// lib/db/plants.ts
import { Plant } from '@/types'
import { createClient } from '@/lib/supabase/server'
import type { PlantType } from '@/types'

export type DbPlant = {
  id: string
  user_id: string
  garden_id: string
  group_id: string | null
  name: string
  plant_type: string
  watering_interval_days: number
  feeding_interval_days: number
  last_watered_at: string | null
  last_fed_at: string | null
  created_at: string
}

export function toPlant(row: DbPlant): Plant {
  return {
    id: row.id,
    userId: row.user_id,
    gardenId: row.garden_id,
    groupId: row.group_id,
    name: row.name,
    type: row.plant_type as PlantType,
    wateringIntervalDays: row.watering_interval_days,
    feedingIntervalDays: row.feeding_interval_days,
    lastWateredAt: row.last_watered_at,
    lastFedAt: row.last_fed_at,
    createdAt: row.created_at,
  }
}

type DbPlantUpdate = {
  name?: string
  plant_type?: string
  watering_interval_days?: number
  feeding_interval_days?: number
  last_watered_at?: string | null
  last_fed_at?: string | null
  garden_id?: string
  group_id?: string | null
}

function toDbUpdate(data: Partial<Plant>): DbPlantUpdate {
  const update: DbPlantUpdate = {}
  if (data.name !== undefined) update.name = data.name
  if (data.type !== undefined) update.plant_type = data.type
  if (data.wateringIntervalDays !== undefined) update.watering_interval_days = data.wateringIntervalDays
  if (data.feedingIntervalDays !== undefined) update.feeding_interval_days = data.feedingIntervalDays
  if (data.lastWateredAt !== undefined) update.last_watered_at = data.lastWateredAt
  if (data.lastFedAt !== undefined) update.last_fed_at = data.lastFedAt
  if (data.gardenId !== undefined) update.garden_id = data.gardenId
  if (data.groupId !== undefined) update.group_id = data.groupId
  return update
}

// userId param kept for interface compatibility — RLS enforces the filter via JWT
export async function getPlants(_userId: string, gardenId: string): Promise<Plant[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('plants')
    .select('*')
    .eq('garden_id', gardenId)
    .order('created_at', { ascending: true })
  if (error) throw new Error(error.message)
  return (data as DbPlant[]).map(toPlant)
}

export async function getPlant(id: string, _userId: string): Promise<Plant | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('plants')
    .select('*')
    .eq('id', id)
    .single()
  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(error.message)
  }
  return toPlant(data as DbPlant)
}

export async function createPlant(
  data: Omit<Plant, 'id' | 'createdAt'>
): Promise<Plant> {
  const supabase = await createClient()
  const { data: row, error } = await supabase
    .from('plants')
    .insert({
      user_id: data.userId,
      garden_id: data.gardenId,
      group_id: data.groupId ?? null,
      name: data.name,
      plant_type: data.type,
      watering_interval_days: data.wateringIntervalDays,
      feeding_interval_days: data.feedingIntervalDays,
      last_watered_at: data.lastWateredAt,
      last_fed_at: data.lastFedAt,
    })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return toPlant(row as DbPlant)
}

export async function updatePlant(
  id: string,
  data: Partial<Plant>
): Promise<Plant> {
  const supabase = await createClient()
  const { data: row, error } = await supabase
    .from('plants')
    .update(toDbUpdate(data))
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return toPlant(row as DbPlant)
}

export async function deletePlant(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.from('plants').delete().eq('id', id)
  if (error) throw new Error(error.message)
}
