import { NextRequest, NextResponse } from 'next/server'
import { signUp } from '@/lib/auth'
import { z } from 'zod'

const signupSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const validationResult = signupSchema.safeParse(body)
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

    const { email, password, name } = validationResult.data
    const { user, session, error } = await signUp({ email, password, name })

    if (error) {
      const statusCode = error.message.includes('User already registered') ? 409 : 400
      return NextResponse.json(
        { error: error.message },
        { status: statusCode }
      )
    }

    if (!user) {
      return NextResponse.json(
        { error: 'User creation failed' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || null,
        avatar_url: user.user_metadata?.avatar_url || null
      },
      session: session ? {
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_at: session.expires_at,
        expires_in: session.expires_in
      } : null,
      message: session ? 'User created and signed in' : 'User created. Please check your email for verification.'
    })
  } catch (error) {
    console.error('Signup API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}