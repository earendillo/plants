// app/api/gardens/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getGardens, createGarden } from '@/lib/db/gardens'
import { getAuthenticatedUser } from '@/lib/auth'

const createSchema = z.object({
  name: z.string().min(1).max(100),
})

export async function GET() {
  const user = await getAuthenticatedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const gardens = await getGardens(user.id)
  return NextResponse.json(gardens)
}

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body: unknown = await request.json()
  const result = createSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 400 })
  }

  try {
    const garden = await createGarden({ name: result.data.name, userId: user.id })
    return NextResponse.json(garden, { status: 201 })
  } catch (err) {
    // Supabase PostgrestError has a `code` field, not an Error instance
    if ((err as { code?: string }).code === '23505') {
      return NextResponse.json(
        { error: 'A garden with that name already exists' },
        { status: 409 }
      )
    }
    throw err
  }
}
