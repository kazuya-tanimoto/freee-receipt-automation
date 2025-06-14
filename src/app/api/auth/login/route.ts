import { NextRequest, NextResponse } from 'next/server'
import { signIn } from '@/lib/auth'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const validationResult = loginSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validationResult.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message
          }))
        },
        { status: 400 }
      )
    }

    const { email, password } = validationResult.data
    const { user, session, error } = await signIn({ email, password })

    if (error) {
      const statusCode = error.message.includes('Invalid login credentials') ? 401 : 400
      return NextResponse.json(
        { error: error.message },
        { status: statusCode }
      )
    }

    if (!user || !session) {
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || null,
        avatar_url: user.user_metadata?.avatar_url || null
      },
      session: {
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_at: session.expires_at,
        expires_in: session.expires_in
      }
    })
  } catch (error) {
    console.error('Login API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}