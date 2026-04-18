// lib/db/gardens.ts
import { Garden } from '@/types'
import { createClient } from '@/lib/supabase/server'

type DbGarden = {
  id: string
  name: string
  owner_id: string
  created_at: string
}

function toGarden(row: DbGarden): Garden {
  return {
    id: row.id,
    name: row.name,
    userId: row.owner_id,
    createdAt: row.created_at,
  }
}

export async function getGardens(userId: string): Promise<Garden[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('gardens')
    .select('*')
    .eq('owner_id', userId)
    .order('created_at', { ascending: true })
  if (error) throw new Error(error.message)
  return (data as DbGarden[]).map(toGarden)
}

export async function createGarden(data: {
  name: string
  userId: string
}): Promise<Garden> {
  const supabase = await createClient()
  const { data: row, error } = await supabase
    .from('gardens')
    .insert({ name: data.name, owner_id: data.userId })
    .select()
    .single()
  if (error) throw error
  return toGarden(row as DbGarden)
}

export async function updateGarden(id: string, name: string, userId: string): Promise<Garden> {
  const supabase = await createClient()
  const { data: row, error } = await supabase
    .from('gardens')
    .update({ name })
    .eq('id', id)
    .eq('owner_id', userId)
    .select()
    .single()
  if (error) throw error
  return toGarden(row as DbGarden)
}

/**
 * Idempotent. Creates "My Garden" only if the user has none.
 * Must only be called from the auth callback — never from page render paths.
 */
export async function ensureDefaultGarden(userId: string): Promise<Garden> {
  const supabase = await createClient()
  const { data: existing } = await supabase
    .from('gardens')
    .select('*')
    .eq('owner_id', userId)
    .limit(1)
  if (existing && existing.length > 0) return toGarden(existing[0] as DbGarden)
  const { data: row, error } = await supabase
    .from('gardens')
    .insert({ name: 'My Garden', owner_id: userId })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return toGarden(row as DbGarden)
}

export async function deleteGarden(id: string, userId: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('gardens')
    .delete()
    .eq('id', id)
    .eq('owner_id', userId)
  if (error) throw new Error(error.message)
}
