// app/api/plants/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getPlants, createPlant } from '@/lib/db/plants'
import { getAuthenticatedUser } from '@/lib/auth'
import { isGardenOwner } from '@/lib/db/gardens'
import type { PlantType } from '@/components/PlantIcon'

const createSchema = z.object({
  gardenId: z.string().uuid(),
  name: z.string().min(1).max(100),
  type: z.string().min(1),
  wateringIntervalDays: z.number().int().min(1).max(365),
  feedingIntervalDays: z.number().int().min(1).max(365),
  lastWateredAt: z.string().nullable(),
  lastFedAt: z.string().nullable(),
})

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const gardenId = new URL(request.url).searchParams.get('gardenId')
  if (!gardenId) {
    return NextResponse.json({ error: 'gardenId query param required' }, { status: 400 })
  }
  const plants = await getPlants(user.id, gardenId)
  return NextResponse.json(plants)
}

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body: unknown = await request.json()
  const result = createSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 400 })
  }
  if (!(await isGardenOwner(result.data.gardenId, user.id))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const plant = await createPlant({
    ...result.data,
    type: result.data.type as PlantType,
    userId: user.id,
  })
  return NextResponse.json(plant, { status: 201 })
}
