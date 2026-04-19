import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAuthenticatedUser } from '@/lib/auth'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const user = await getAuthenticatedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { token } = await params
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('accept_garden_share_link', {
    p_token: token,
  })

  if (error || !data) {
    return NextResponse.json({ error: 'Invalid or expired link' }, { status: 400 })
  }

  return NextResponse.json({ gardenId: data })
}

