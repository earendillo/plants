// app/api/plants/[id]/history/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthenticatedUser } from '@/lib/auth'
import { getActivityLogs } from '@/lib/db/plants'

const limitSchema = z.coerce.number().int().min(1).max(50).default(10)

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const limitParam = req.nextUrl.searchParams.get('limit')
  const parsed = limitSchema.safeParse(limitParam ?? undefined)
  const limit = parsed.success ? parsed.data : 10

  const logs = await getActivityLogs(id, limit)
  return NextResponse.json(logs)
}
