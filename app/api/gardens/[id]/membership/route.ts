// app/api/gardens/[id]/membership/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth'
import { leaveGarden, isGardenOwner } from '@/lib/db/gardens'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  // Owners cannot leave their own garden via this endpoint
  if (await isGardenOwner(id, user.id)) {
    return NextResponse.json({ error: 'Owners cannot leave their own garden' }, { status: 403 })
  }

  await leaveGarden(id, user.id)
  return new NextResponse(null, { status: 204 })
}
