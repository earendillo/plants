import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { getPlants, createPlant } from '@/lib/db/plants'
import { MOCK_USER_ID } from '@/lib/auth'

const createSchema = z.object({
  name: z.string().min(1).max(100),
  emoji: z.string().min(1).max(4),
  wateringIntervalDays: z.number().int().min(1).max(365),
  feedingIntervalDays: z.number().int().min(1).max(365),
  lastWateredAt: z.string().nullable(),
  lastFedAt: z.string().nullable(),
})

export async function GET() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value ?? MOCK_USER_ID
  const plants = await getPlants(userId)
  return Response.json(plants)
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value ?? MOCK_USER_ID
  const body: unknown = await request.json()
  const result = createSchema.safeParse(body)
  if (!result.success) {
    return Response.json({ error: result.error.flatten() }, { status: 400 })
  }
  const plant = await createPlant({ ...result.data, userId })
  return Response.json(plant, { status: 201 })
}
