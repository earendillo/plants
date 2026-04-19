import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { getPlant } from '@/lib/db/plants'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const supabase = await createClient()

  const { error } = await supabase.rpc('feed_plant', { p_plant_id: id })
  if (error) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const plant = await getPlant(id, user.id)
  if (!plant) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(plant)
}
