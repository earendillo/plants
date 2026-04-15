import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const isAuthenticated =
    request.cookies.get('isAuthenticated')?.value === 'true'

  if (!isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  // Protect all routes except /login and Next.js internals
  matcher: ['/((?!login|_next/static|_next/image|favicon.ico).*)'],
}
