// lib/db/anonymous-links.ts
import { createClient } from '@/lib/supabase/server'
import { randomUUID } from 'crypto'

export async function getAnonymousShareLinkToken(
  gardenId: string
): Promise<{ token: string; expiresAt: string } | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('garden_share_links')
    .select('token, expires_at')
    .eq('garden_id', gardenId)
    .eq('allow_anonymous', true)
    .is('revoked_at', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  if (error) return null
  return {
    token: (data as { token: string; expires_at: string }).token,
    expiresAt: (data as { token: string; expires_at: string }).expires_at,
  }
}

export async function createOrRotateAnonymousLink(
  gardenId: string,
  durationDays: number,
  label: string | null
): Promise<{ token: string; expiresAt: string }> {
  const supabase = await createClient()
  // Revoke existing anonymous links for this garden only
  await supabase
    .from('garden_share_links')
    .update({ revoked_at: new Date().toISOString() })
    .eq('garden_id', gardenId)
    .eq('allow_anonymous', true)
    .is('revoked_at', null)

  const token = randomUUID()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + durationDays)

  const { data: { user } } = await supabase.auth.getUser()
  const { error } = await supabase
    .from('garden_share_links')
    .insert({
      garden_id: gardenId,
      token,
      role: 'limited_editor',
      created_by: user!.id,
      allow_anonymous: true,
      label: label ?? null,
      duration_days: durationDays,
      expires_at: expiresAt.toISOString(),
    })
  if (error) throw new Error(error.message)
  return { token, expiresAt: expiresAt.toISOString() }
}

export async function revokeAnonymousLink(gardenId: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('garden_share_links')
    .update({ revoked_at: new Date().toISOString() })
    .eq('garden_id', gardenId)
    .eq('allow_anonymous', true)
    .is('revoked_at', null)
  if (error) throw new Error(error.message)
}
