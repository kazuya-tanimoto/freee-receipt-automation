import { getConfig } from '@/lib/config'
import { FreeeAuthService } from '@/lib/freee-auth'
import { type NextRequest, NextResponse } from 'next/server'

/**
 * freee OAuth callback handler
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error) {
      console.error('freee OAuth error:', error)
      return NextResponse.redirect('/?error=oauth_error')
    }

    if (!code) {
      return NextResponse.redirect('/?error=missing_code')
    }

    const config = getConfig()
    const authService = new FreeeAuthService(config.freee)
    const tokens = await authService.exchangeCodeForToken(code)

    // TODO: Store tokens securely (implement in future PBI)
    console.log('freee authentication successful:', {
      company_id: tokens.company_id,
      expires_in: tokens.expires_in,
    })

    return NextResponse.redirect('/?freee_auth=success')
  } catch (error) {
    console.error('freee callback processing failed:', error)
    return NextResponse.redirect('/?error=callback_failed')
  }
}
