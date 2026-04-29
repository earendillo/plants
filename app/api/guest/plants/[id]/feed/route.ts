// app/api/guest/plants/[id]/feed/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { decodeGuestJwtClaims } from '@/lib/guest-jwt'
import { createGuestClient } from '@/lib/supabase/guest'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guestJwt = request.cookies.get('guest_jwt')?.value
  if (!guestJwt) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const claims = decodeGuestJwtClaims(guestJwt)
  if (!claims) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const client = createGuestClient(guestJwt)

  const { data, error } = await client.rpc('feed_plant_guest', {
    p_plant_id: id,
    p_token: claims.guestToken,
  })

  if (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }

  return NextResponse.json({ updated: data === 1 })
}
