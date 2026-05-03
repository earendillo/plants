// app/api/gardens/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { updateGarden, deleteGarden, getGardens } from '@/lib/db/gardens'
import { getPlants } from '@/lib/db/plants'
import { getAuthenticatedUser } from '@/lib/auth'
import { uuidParam } from '@/lib/validation'

const patchSchema = z.object({
  name: z.string().min(1).max(100),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  if (!uuidParam.safeParse(id).success) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
  }
  const body: unknown = await request.json()
  const result = patchSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 400 })
  }

  try {
    const garden = await updateGarden(id, result.data.name, user.id)
    return NextResponse.json(garden)
  } catch (err) {
    if ((err as { code?: string }).code === '23505') {
      return NextResponse.json(
        { error: 'A garden with that name already exists' },
        { status: 409 }
      )
    }
    throw err
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  if (!uuidParam.safeParse(id).success) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
  }

  const [plants, gardens] = await Promise.all([
    getPlants(user.id, id),
    getGardens(user.id),
  ])

  // Only owned gardens count toward the "last garden" and target garden checks
  const ownedGardens = gardens.filter(g => g.role === 'owner')
  const targetGarden = ownedGardens.find(g => g.id === id)
  if (!targetGarden) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  if (plants.length > 0) {
    return NextResponse.json({ error: 'Garden is not empty' }, { status: 409 })
  }
  if (ownedGardens.length <= 1) {
    return NextResponse.json({ error: 'Cannot delete last garden' }, { status: 409 })
  }

  try {
    await deleteGarden(id, user.id)
  } catch {
    return NextResponse.json({ error: 'Failed to delete garden' }, { status: 500 })
  }
  return new NextResponse(null, { status: 204 })
}
