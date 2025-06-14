import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import type { Database } from '@/types/supabase'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = createRouteHandlerClient<Database>({
      cookies
    })

    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Auth callback error:', error)
        return NextResponse.redirect(
          new URL(`/auth/signin?error=${encodeURIComponent(error.message)}`, requestUrl.origin)
        )
      }
    } catch (error) {
      console.error('Auth callback exception:', error)
      return NextResponse.redirect(
        new URL('/auth/signin?error=Authentication failed', requestUrl.origin)
      )
    }
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin))
}