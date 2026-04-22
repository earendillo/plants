// app/api/gardens/[id]/share-link/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth'
import {
  getActiveShareLinkToken,
  createOrRotateShareLink,
  revokeShareLink,
  isGardenOwner,
} from '@/lib/db/gardens'

function buildShareUrl(request: NextRequest, token: string): string {
  const origin = request.headers.get('origin') ?? request.nextUrl.origin
  return `${origin}/share/${token}`
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
  const token = await getActiveShareLinkToken(id)
  if (!token) return NextResponse.json({ url: null })
  return NextResponse.json({ url: buildShareUrl(request, token) })
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
  const token = await createOrRotateShareLink(id)
  return NextResponse.json({ url: buildShareUrl(request, token) })
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
  await revokeShareLink(id)
  return new NextResponse(null, { status: 204 })
}
