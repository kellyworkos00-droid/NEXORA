import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/app/api/data/auth-store'

// Routes that don't require authentication
const publicRoutes = ['/login', '/register', '/privacy', '/terms', '/', '/preview']
const apiPublicRoutes = ['/api/auth/login', '/api/auth/register', '/api/health']

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Check if route is public
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith('/api') && apiPublicRoutes.some(apiRoute => pathname === apiRoute))
  
  // If it's a public route, allow access
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // For dashboard and other protected routes, check authentication
  if (pathname.startsWith('/dashboard')) {
    const token = request.cookies.get('access_token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) {
      // Store the intended destination
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('from', pathname)
      return NextResponse.redirect(url)
    }

    // Verify token
    const decoded = verifyToken(token)
    if (!decoded) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('expired', 'true')
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
