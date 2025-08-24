import { getConfig } from '@/lib/config'
import { FreeeAuthService } from '@/lib/freee-auth'
import { NextResponse } from 'next/server'

/**
 * freee OAuth authentication initiation endpoint
 */
export async function GET() {
  try {
    const config = getConfig()
    const authService = new FreeeAuthService(config.freee)
    const authUrl = authService.getAuthorizationUrl()
    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error('freee auth initialization failed:', error)
    return NextResponse.json({ error: 'Authentication initialization failed' }, { status: 500 })
  }
}
