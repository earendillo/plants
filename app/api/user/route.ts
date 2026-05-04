import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'
import { getAuthenticatedUser } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { handleApiError } from '@/lib/api-error'

const deleteSchema = z.object({
  password: z.string().min(1).optional(),
})

export async function DELETE(request: NextRequest) {
  const user = await getAuthenticatedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body: unknown = await request.json().catch(() => ({}))
  const result = deleteSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 400 })
  }

  const providers: string[] = user.app_metadata?.providers ?? []
  const hasEmailProvider = providers.includes('email')

  if (hasEmailProvider) {
    const { password } = result.data
    if (!password) {
      return NextResponse.json({ error: 'Password required' }, { status: 400 })
    }

    // Use an isolated client to verify password without overriding the current session
    const verifyClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } }
    )
    const { error: signInError } = await verifyClient.auth.signInWithPassword({
      email: user.email!,
      password,
    })
    if (signInError) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 403 })
    }
  }

  try {
    const admin = createAdminClient()
    const { error } = await admin.auth.admin.deleteUser(user.id)
    if (error) throw error
    return new NextResponse(null, { status: 204 })
  } catch (err) {
    return handleApiError(err)
  }
}
