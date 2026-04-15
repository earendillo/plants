import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getPlants, createPlant } from '@/lib/db/plants'
import { getAuthenticatedUser } from '@/lib/auth'

const createSchema = z.object({
  name: z.string().min(1).max(100),
  emoji: z.string().min(1).max(4),
  wateringIntervalDays: z.number().int().min(1).max(365),
  feedingIntervalDays: z.number().int().min(1).max(365),
  lastWateredAt: z.string().nullable(),
  lastFedAt: z.string().nullable(),
})

export async function GET() {
  const user = await getAuthenticatedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const plants = await getPlants(user.id)
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
  const plant = await createPlant({ ...result.data, userId: user.id })
  return NextResponse.json(plant, { status: 201 })
}
