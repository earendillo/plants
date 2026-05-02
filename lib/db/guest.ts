// lib/db/guest.ts
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Plant } from '@/types'
import { type DbPlant, toPlant } from '@/lib/db/plants'

type GuestGarden = { id: string; name: string }

export async function getGuestGarden(
  client: SupabaseClient,
  gardenId: string
): Promise<GuestGarden | null> {
  const { data, error } = await client
    .from('gardens')
    .select('id, name')
    .eq('id', gardenId)
    .single()
  if (error || !data) return null
  return data as GuestGarden
}

export async function getGuestPlants(
  client: SupabaseClient,
  gardenId: string
): Promise<Plant[]> {
  const { data, error } = await client
    .from('plants')
    .select('*')
    .eq('garden_id', gardenId)
    .order('created_at', { ascending: true })
  if (error) throw new Error(error.message)
  return (data as DbPlant[]).map(toPlant)
}
