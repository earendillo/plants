// app/api/gardens/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { updateGarden } from '@/lib/db/gardens'
import { getAuthenticatedUser } from '@/lib/auth'

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
