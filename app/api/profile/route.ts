// app/api/profile/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getProfile, upsertProfile } from '@/lib/db/profiles'
import { getAuthenticatedUser } from '@/lib/auth'

const updateSchema = z.object({
  displayName: z.string().max(100).nullable().optional(),
})

export async function GET() {
  const user = await getAuthenticatedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const profile = await getProfile(user.id)
  if (!profile) {
    // Return empty profile shape — row doesn't exist yet
    return NextResponse.json({ id: user.id, displayName: null, avatarUrl: null, timezone: 'UTC', createdAt: null })
  }
  return NextResponse.json(profile)
}

export async function PUT(request: NextRequest) {
  const user = await getAuthenticatedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body: unknown = await request.json()
  const result = updateSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 400 })
  }

  const profile = await upsertProfile(user.id, {
    displayName: result.data.displayName ?? undefined,
  })
  return NextResponse.json(profile)
}
