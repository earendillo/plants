// app/api/guest/token/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { signGuestJwt } from '@/lib/guest-jwt'
import { z } from 'zod'

const bodySchema = z.object({ token: z.string().min(1) })

// Anon client — no auth. Used only to call validate_anonymous_share_link.
function anonClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
  const { token } = parsed.data

  const supabase = anonClient()
  const { data, error } = await supabase.rpc('validate_anonymous_share_link', {
    p_token: token,
  })

  if (error || !data || data.length === 0) {
    return NextResponse.json({ error: 'Invalid or expired link' }, { status: 401 })
  }

  const { garden_id: gardenId, expires_at: expiresAtStr } = data[0] as {
    garden_id: string
    expires_at: string
  }
  const expiresAt = new Date(expiresAtStr)

  const jwt = await signGuestJwt(token, gardenId, expiresAt)

  const response = NextResponse.json({ gardenId })
  response.cookies.set('guest_jwt', jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  })
  return response
}
