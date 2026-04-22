// lib/db/gardens.ts
import { Garden } from '@/types'
import { createClient } from '@/lib/supabase/server'
import { randomUUID } from 'crypto'

type DbGarden = {
  id: string
  name: string
  owner_id: string
  created_at: string
}

function toGarden(row: DbGarden, userId: string): Garden {
  return {
    id: row.id,
    name: row.name,
    userId: row.owner_id,
    createdAt: row.created_at,
    role: row.owner_id === userId ? 'owner' : 'limited_editor',
  }
}

export async function getGardens(userId: string): Promise<Garden[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('gardens')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) throw new Error(error.message)
  return (data as DbGarden[]).map(row => toGarden(row, userId))
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
  return toGarden(row as DbGarden, data.userId)
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
  return toGarden(row as DbGarden, userId)
}

export async function ensureDefaultGarden(userId: string): Promise<Garden> {
  const supabase = await createClient()
  const { data: existing } = await supabase
    .from('gardens')
    .select('*')
    .eq('owner_id', userId)
    .limit(1)
  if (existing && existing.length > 0) return toGarden(existing[0] as DbGarden, userId)
  const { data: row, error } = await supabase
    .from('gardens')
    .insert({ name: 'My Garden', owner_id: userId })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return toGarden(row as DbGarden, userId)
}

export async function deleteGarden(id: string, userId: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('gardens')
    .delete()
    .eq('id', id)
    .eq('owner_id', userId)
  if (error) throw error
}

export async function isGardenOwner(gardenId: string, userId: string): Promise<boolean> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('gardens')
    .select('owner_id')
    .eq('id', gardenId)
    .eq('owner_id', userId)
    .single()
  if (error) return false
  return data !== null
}

export async function getActiveShareLinkToken(gardenId: string): Promise<string | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('garden_share_links')
    .select('token')
    .eq('garden_id', gardenId)
    .is('revoked_at', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  if (error) return null
  return (data as { token: string }).token
}

export async function createOrRotateShareLink(gardenId: string): Promise<string> {
  const supabase = await createClient()
  // Revoke any existing active links
  await supabase
    .from('garden_share_links')
    .update({ revoked_at: new Date().toISOString() })
    .eq('garden_id', gardenId)
    .is('revoked_at', null)

  const token = randomUUID()
  const { data: { user } } = await supabase.auth.getUser()
  const { error } = await supabase
    .from('garden_share_links')
    .insert({
      garden_id: gardenId,
      token,
      role: 'limited_editor',
      created_by: user!.id,
    })
  if (error) throw new Error(error.message)
  return token
}

export async function revokeShareLink(gardenId: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('garden_share_links')
    .update({ revoked_at: new Date().toISOString() })
    .eq('garden_id', gardenId)
    .is('revoked_at', null)
  if (error) throw new Error(error.message)
}
