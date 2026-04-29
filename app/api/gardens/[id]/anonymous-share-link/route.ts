// app/api/gardens/[id]/anonymous-share-link/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthenticatedUser } from '@/lib/auth'
import { isGardenOwner } from '@/lib/db/gardens'
import {
  getAnonymousShareLinkToken,
  createOrRotateAnonymousLink,
  revokeAnonymousLink,
} from '@/lib/db/anonymous-links'

const postSchema = z.object({
  durationDays: z.number().int().min(1).max(14).default(7),
  label: z.string().max(100).nullable().optional(),
})

function buildGuestUrl(request: NextRequest, token: string): string {
  const origin = request.headers.get('origin') ?? request.nextUrl.origin
  return `${origin}/guest/${token}`
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  if (!(await isGardenOwner(id, user.id))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const result = await getAnonymousShareLinkToken(id)
  if (!result) return NextResponse.json({ url: null })
  return NextResponse.json({ url: buildGuestUrl(request, result.token) })
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  if (!(await isGardenOwner(id, user.id))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const body = await request.json().catch(() => ({}))
  const parsed = postSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
  const { durationDays, label } = parsed.data
  const { token } = await createOrRotateAnonymousLink(id, durationDays, label ?? null)
  return NextResponse.json({ url: buildGuestUrl(request, token) })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  if (!(await isGardenOwner(id, user.id))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  await revokeAnonymousLink(id)
  return new NextResponse(null, { status: 204 })
}
