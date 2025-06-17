import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { Database } from '@/types/supabase'

const PUBLIC_ROUTES = [
  '/',
  '/auth/signin',
  '/auth/signup',
  '/auth/reset-password',
  '/auth/callback',
  '/api/auth/callback'
]

const AUTH_ROUTES = [
  '/auth/signin',
  '/auth/signup',
  '/auth/reset-password'
]

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => {
    if (route === '/') return pathname === '/'
    return pathname.startsWith(route)
  })
}

function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some(route => pathname.startsWith(route))
}

function isApiRoute(pathname: string): boolean {
  return pathname.startsWith('/api/')
}

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const pathname = req.nextUrl.pathname

  if (isApiRoute(pathname)) {
    const supabase = createMiddlewareClient<Database>({ req, res })
    await supabase.auth.getSession()
    return res
  }

  const supabase = createMiddlewareClient<Database>({ req, res })

  try {
    const {
      data: { session },
      error
    } = await supabase.auth.getSession()

    if (error) {
      console.error('Middleware auth error:', {
        message: error.message,
        code: error.code,
        pathname,
        timestamp: new Date().toISOString()
      })
      
      if (!isPublicRoute(pathname)) {
        const redirectUrl = new URL('/auth/signin', req.url)
        redirectUrl.searchParams.set('redirectedFrom', pathname)
        return NextResponse.redirect(redirectUrl)
      }
      
      return res
    }

    const isAuthenticated = !!session
    const isOnPublicRoute = isPublicRoute(pathname)
    const isOnAuthRoute = isAuthRoute(pathname)

    if (!isAuthenticated && !isOnPublicRoute) {
      const redirectUrl = new URL('/auth/signin', req.url)
      redirectUrl.searchParams.set('redirectedFrom', pathname)
      return NextResponse.redirect(redirectUrl)
    }

    if (isAuthenticated && isOnAuthRoute) {
      const redirectUrl = new URL('/dashboard', req.url)
      return NextResponse.redirect(redirectUrl)
    }

    if (isAuthenticated && session.expires_at) {
      const now = Math.floor(Date.now() / 1000)
      const expiresIn = session.expires_at - now
      
      if (expiresIn < 300) {
        try {
          await supabase.auth.refreshSession()
        } catch (refreshError) {
          console.error('Session refresh failed in middleware:', refreshError)
          
          if (!isOnPublicRoute) {
            const redirectUrl = new URL('/auth/signin', req.url)
            redirectUrl.searchParams.set('redirectedFrom', pathname)
            return NextResponse.redirect(redirectUrl)
          }
        }
      }
    }

    return res
  } catch (error) {
    console.error('Middleware error:', error)
    
    if (!isPublicRoute(pathname)) {
      const redirectUrl = new URL('/auth/signin', req.url)
      redirectUrl.searchParams.set('redirectedFrom', pathname)
      return NextResponse.redirect(redirectUrl)
    }
    
    return res
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}