// app/api/gardens/[id]/groups/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthenticatedUser } from '@/lib/auth'
import { isGardenOwner } from '@/lib/db/gardens'
import { getPlantGroups, createPlantGroup } from '@/lib/db/plant-groups'
import { uuidParam } from '@/lib/validation'
import { handleApiError } from '@/lib/api-error'

const createSchema = z.object({
  name: z.string().min(1).max(50),
  position: z.number().int().optional().default(0),
})

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id } = await params
    if (!uuidParam.safeParse(id).success) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }
    const groups = await getPlantGroups(id)
    return NextResponse.json(groups)
  } catch (err) {
    return handleApiError(err)
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id } = await params
    if (!uuidParam.safeParse(id).success) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }
    if (!(await isGardenOwner(id, user.id))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    const body: unknown = await request.json()
    const result = createSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 })
    }
    const group = await createPlantGroup({
      gardenId: id,
      name: result.data.name,
      position: result.data.position,
    })
    return NextResponse.json(group, { status: 201 })
  } catch (err) {
    return handleApiError(err)
  }
}
