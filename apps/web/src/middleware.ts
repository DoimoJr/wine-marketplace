import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    // Add any custom middleware logic here
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Define which paths require authentication
        const { pathname } = req.nextUrl
        
        // Protected routes that require authentication
        if (pathname.startsWith('/sell')) {
          return !!token
        }
        
        if (pathname.startsWith('/profile')) {
          return !!token
        }
        
        if (pathname.startsWith('/dashboard')) {
          return !!token
        }
        
        if (pathname.startsWith('/orders')) {
          return !!token
        }
        
        // Allow access to all other routes
        return true
      },
    },
    pages: {
      signIn: '/login',
    },
  }
)

export const config = {
  matcher: [
    // Match all paths except static files and API routes
    '/((?!_next/static|_next/image|favicon.ico|api/).*)',
  ],
}