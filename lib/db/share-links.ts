// lib/db/share-links.ts — member-invite links (anonymous links live in anonymous-links.ts)
import { createClient } from '@/lib/supabase/server'
import { randomUUID } from 'crypto'

export async function getActiveShareLinkToken(gardenId: string): Promise<string | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('garden_share_links')
    .select('token')
    .eq('garden_id', gardenId)
    .eq('allow_anonymous', false)
    .is('revoked_at', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  if (error) return null
  return (data as { token: string }).token
}

export async function createOrRotateShareLink(gardenId: string): Promise<string> {
  const supabase = await createClient()
  // Revoke active member-invite links only (not anonymous links)
  await supabase
    .from('garden_share_links')
    .update({ revoked_at: new Date().toISOString() })
    .eq('garden_id', gardenId)
    .eq('allow_anonymous', false)
    .is('revoked_at', null)

  const token = randomUUID()
  const { data: { user } } = await supabase.auth.getUser()
  const expiresAt = new Date()
  expiresAt.setMonth(expiresAt.getMonth() + 6)
  const { error } = await supabase
    .from('garden_share_links')
    .insert({
      garden_id: gardenId,
      token,
      role: 'limited_editor',
      created_by: user!.id,
      allow_anonymous: false,
      expires_at: expiresAt.toISOString(),
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
    .eq('allow_anonymous', false)
    .is('revoked_at', null)
  if (error) throw new Error(error.message)
}
