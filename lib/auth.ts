import { createClient } from './supabase/server'

// TODO: Add role-based access control when needed
export async function getAuthenticatedUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}
