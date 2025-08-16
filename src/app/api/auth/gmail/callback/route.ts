import { gmailAuthService } from '@/lib/gmail-auth'
import { type NextRequest, NextResponse } from 'next/server'

/**
 * Gmail OAuth callback endpoint
 * Handles authorization code exchange for tokens
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error) {
    console.error('Gmail OAuth error:', error)
    return NextResponse.json({ error: 'Gmail authentication failed' }, { status: 400 })
  }

  if (!code) {
    return NextResponse.json({ error: 'Authorization code not provided' }, { status: 400 })
  }

  try {
    const tokens = await gmailAuthService.exchangeCodeForTokens(code)

    // In a real application, you would store these tokens securely
    // For security reasons, we don't return token information in the response
    return NextResponse.json({
      message: 'Gmail authentication successful',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Token exchange error:', error)
    return NextResponse.json(
      { error: 'Failed to exchange authorization code for tokens' },
      { status: 500 }
    )
  }
}
