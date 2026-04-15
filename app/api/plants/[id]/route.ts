import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { getPlant, updatePlant, deletePlant } from '@/lib/db/plants'
import { MOCK_USER_ID } from '@/lib/auth'

const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  emoji: z.string().min(1).max(4).optional(),
  wateringIntervalDays: z.number().int().min(1).max(365).optional(),
  feedingIntervalDays: z.number().int().min(1).max(365).optional(),
  lastWateredAt: z.string().nullable().optional(),
  lastFedAt: z.string().nullable().optional(),
})

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value ?? MOCK_USER_ID
  const plant = await getPlant(id, userId)
  if (!plant) return Response.json({ error: 'Not found' }, { status: 404 })
  return Response.json(plant)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value ?? MOCK_USER_ID
  const existing = await getPlant(id, userId)
  if (!existing) return Response.json({ error: 'Not found' }, { status: 404 })
  const body: unknown = await request.json()
  const result = updateSchema.safeParse(body)
  if (!result.success) {
    return Response.json({ error: result.error.flatten() }, { status: 400 })
  }
  const updated = await updatePlant(id, result.data)
  return Response.json(updated)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value ?? MOCK_USER_ID
  const existing = await getPlant(id, userId)
  if (!existing) return Response.json({ error: 'Not found' }, { status: 404 })
  await deletePlant(id)
  return new Response(null, { status: 204 })
}
