// lib/db/plant-groups.ts
import { PlantGroup, PlantGroupInsert } from '@/types'
import { createClient } from '@/lib/supabase/server'

type DbPlantGroup = {
  id: string
  garden_id: string
  name: string
  position: number
  created_at: string
}

function toPlantGroup(row: DbPlantGroup): PlantGroup {
  return {
    id: row.id,
    gardenId: row.garden_id,
    name: row.name,
    position: row.position,
    createdAt: row.created_at,
  }
}

export async function getPlantGroups(gardenId: string): Promise<PlantGroup[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('plant_groups')
    .select('*')
    .eq('garden_id', gardenId)
    .order('position', { ascending: true })
    .order('created_at', { ascending: true })
  if (error) throw new Error(error.message)
  return (data as DbPlantGroup[]).map(toPlantGroup)
}

export async function createPlantGroup(data: PlantGroupInsert): Promise<PlantGroup> {
  const supabase = await createClient()
  const { data: row, error } = await supabase
    .from('plant_groups')
    .insert({
      garden_id: data.gardenId,
      name: data.name,
      position: data.position,
    })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return toPlantGroup(row as DbPlantGroup)
}

export async function updatePlantGroup(
  id: string,
  data: Partial<Pick<PlantGroup, 'name' | 'position'>>
): Promise<PlantGroup> {
  const supabase = await createClient()
  const update: Partial<Pick<DbPlantGroup, 'name' | 'position'>> = {}
  if (data.name !== undefined) update.name = data.name
  if (data.position !== undefined) update.position = data.position
  const { data: row, error } = await supabase
    .from('plant_groups')
    .update(update)
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return toPlantGroup(row as DbPlantGroup)
}

export async function deletePlantGroup(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.from('plant_groups').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function reorderPlantGroups(
  gardenId: string,
  orderedIds: string[]
): Promise<void> {
  const supabase = await createClient()
  await Promise.all(
    orderedIds.map((id, index) =>
      supabase
        .from('plant_groups')
        .update({ position: index })
        .eq('id', id)
        .eq('garden_id', gardenId)
    )
  )
}
