// app/api/gardens/[id]/groups/[groupId]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthenticatedUser } from '@/lib/auth'
import { isGardenOwner } from '@/lib/db/gardens'
import { updatePlantGroup, deletePlantGroup } from '@/lib/db/plant-groups'
import { uuidParam } from '@/lib/validation'
import { handleApiError } from '@/lib/api-error'

const updateSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  position: z.number().int().optional(),
})

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; groupId: string }> }
) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id, groupId } = await params
    if (!uuidParam.safeParse(id).success) {
      return NextResponse.json({ error: 'Invalid garden ID' }, { status: 400 })
    }
    if (!uuidParam.safeParse(groupId).success) {
      return NextResponse.json({ error: 'Invalid group ID' }, { status: 400 })
    }
    if (!(await isGardenOwner(id, user.id))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    const body: unknown = await request.json()
    const result = updateSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 })
    }
    const updated = await updatePlantGroup(groupId, result.data)
    return NextResponse.json(updated)
  } catch (err) {
    return handleApiError(err)
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; groupId: string }> }
) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id, groupId } = await params
    if (!uuidParam.safeParse(id).success) {
      return NextResponse.json({ error: 'Invalid garden ID' }, { status: 400 })
    }
    if (!uuidParam.safeParse(groupId).success) {
      return NextResponse.json({ error: 'Invalid group ID' }, { status: 400 })
    }
    if (!(await isGardenOwner(id, user.id))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    await deletePlantGroup(groupId)
    return new Response(null, { status: 204 })
  } catch (err) {
    return handleApiError(err)
  }
}
