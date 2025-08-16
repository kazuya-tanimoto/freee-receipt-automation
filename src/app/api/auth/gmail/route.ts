import { gmailAuthService } from '@/lib/gmail-auth'
import { NextResponse } from 'next/server'

/**
 * Gmail OAuth authentication endpoint
 * Redirects to Google OAuth consent screen
 */
export async function GET() {
  try {
    const authUrl = gmailAuthService.generateAuthUrl()
    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error('Gmail auth error:', error)
    return NextResponse.json({ error: 'Failed to initiate Gmail authentication' }, { status: 500 })
  }
}
