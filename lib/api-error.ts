import { NextResponse } from 'next/server'

export function handleApiError(err: unknown): NextResponse {
  console.error(err)
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
}
