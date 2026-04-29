// lib/supabase/guest.ts
import { createClient } from '@supabase/supabase-js'

/**
 * Creates a Supabase client that sends the guest JWT as the Authorization header.
 * PostgREST verifies the JWT and makes auth.jwt() available to RLS and RPCs.
 * Uses the anon key — the JWT overrides the effective Postgres role to 'anon'
 * with the guest_token claim that unlocks the guest RLS branches.
 */
export function createGuestClient(guestJwt: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: { headers: { Authorization: `Bearer ${guestJwt}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    }
  )
}
