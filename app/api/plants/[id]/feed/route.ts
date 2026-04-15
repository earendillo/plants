import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { getPlant, updatePlant } from '@/lib/db/plants'
import { MOCK_USER_ID } from '@/lib/auth'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value ?? MOCK_USER_ID
  const plant = await getPlant(id, userId)
  if (!plant) return Response.json({ error: 'Not found' }, { status: 404 })
  const updated = await updatePlant(id, { lastFedAt: new Date().toISOString() })
  return Response.json(updated)
}
