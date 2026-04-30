// lib/db/profiles.ts
import { Profile } from '@/types'
import { createClient } from '@/lib/supabase/server'

type DbProfile = {
  id: string
  display_name: string | null
  avatar_url: string | null
  timezone: string
  created_at: string
}

function toProfile(row: DbProfile): Profile {
  return {
    id: row.id,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    timezone: row.timezone,
    createdAt: row.created_at,
  }
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (error) return null
  return toProfile(data as DbProfile)
}

export async function upsertProfile(
  userId: string,
  data: { displayName?: string }
): Promise<Profile> {
  const supabase = await createClient()
  const { data: row, error } = await supabase
    .from('profiles')
    .upsert({ id: userId, display_name: data.displayName ?? null })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return toProfile(row as DbProfile)
}
