import { NextRequest, NextResponse } from 'next/server'
import { getPlant, updatePlant } from '@/lib/db/plants'
import { getAuthenticatedUser } from '@/lib/auth'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const plant = await getPlant(id, user.id)
  if (!plant) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const updated = await updatePlant(id, { lastFedAt: new Date().toISOString() })
  return NextResponse.json(updated)
}
