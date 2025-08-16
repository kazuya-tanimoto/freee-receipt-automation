import { getConfig } from '@/lib/config'
import { OAuth2Client } from 'google-auth-library'

/**
 * Gmail OAuth configuration interface
 */
export interface GmailAuthConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
}

/**
 * Gmail OAuth tokens interface
 */
export interface GmailTokens {
  access_token: string
  refresh_token?: string
  expires_in: number
}

/**
 * Gmail OAuth authentication service
 */
class GmailAuthService {
  private oauth2Client: OAuth2Client | null = null

  /**
   * Get OAuth2 client instance
   */
  private getClient(): OAuth2Client {
    if (this.oauth2Client) {
      return this.oauth2Client
    }

    const config = getConfig()
    const redirectUri = process.env.NEXT_PUBLIC_APP_URL
      ? `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/gmail/callback`
      : 'http://localhost:3000/api/auth/gmail/callback'

    this.oauth2Client = new OAuth2Client(
      config.gmail.clientId,
      config.gmail.clientSecret,
      redirectUri
    )

    return this.oauth2Client
  }

  /**
   * Generate OAuth authorization URL with PKCE
   */
  generateAuthUrl(): string {
    const client = this.getClient()

    return client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/gmail.readonly'],
      prompt: 'consent',
    })
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForTokens(code: string): Promise<GmailTokens> {
    const client = this.getClient()

    try {
      const { tokens } = await client.getToken(code)

      if (!tokens.access_token) {
        throw new Error('Failed to obtain access token')
      }

      return {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token || undefined,
        expires_in: tokens.expiry_date
          ? Math.floor((tokens.expiry_date - Date.now()) / 1000)
          : 3600,
      }
    } catch (error) {
      throw new Error(
        `Token exchange failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<GmailTokens> {
    const client = this.getClient()
    client.setCredentials({ refresh_token: refreshToken })

    try {
      const { credentials } = await client.refreshAccessToken()

      if (!credentials.access_token) {
        throw new Error('Failed to refresh access token')
      }

      return {
        access_token: credentials.access_token,
        refresh_token: credentials.refresh_token || refreshToken,
        expires_in: credentials.expiry_date
          ? Math.floor((credentials.expiry_date - Date.now()) / 1000)
          : 3600,
      }
    } catch (error) {
      throw new Error(
        `Token refresh failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }
}

export const gmailAuthService = new GmailAuthService()
