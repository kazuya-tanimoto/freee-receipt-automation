import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database } from '@/types/supabase'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({
      cookies
    })

    const { data, error } = await supabase.auth.refreshSession()

    if (error) {
      console.error('Session refresh error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      )
    }

    if (!data.session || !data.user) {
      return NextResponse.json(
        { error: 'Failed to refresh session' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name || null,
        avatar_url: data.user.user_metadata?.avatar_url || null
      },
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
        expires_in: data.session.expires_in
      }
    })
  } catch (error) {
    console.error('Refresh API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}