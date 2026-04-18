import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getPlant, updatePlant, deletePlant } from '@/lib/db/plants'
import { getAuthenticatedUser } from '@/lib/auth'

const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  emoji: z.string().min(1).max(4).optional(),
  wateringIntervalDays: z.number().int().min(1).max(365).optional(),
  feedingIntervalDays: z.number().int().min(1).max(365).optional(),
  lastWateredAt: z.string().nullable().optional(),
  lastFedAt: z.string().nullable().optional(),
  gardenId: z.string().min(1).optional(),
})

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const plant = await getPlant(id, user.id)
  if (!plant) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(plant)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const existing = await getPlant(id, user.id)
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const body: unknown = await request.json()
  const result = updateSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 400 })
  }
  const updated = await updatePlant(id, result.data)
  return NextResponse.json(updated)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const existing = await getPlant(id, user.id)
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  await deletePlant(id)
  return new Response(null, { status: 204 })
}
