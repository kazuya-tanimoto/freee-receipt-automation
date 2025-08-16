import { createHash, randomBytes } from 'node:crypto'
import { getConfig } from '@/lib/config'
import { CodeChallengeMethod, OAuth2Client } from 'google-auth-library'

export interface GmailTokens {
  access_token: string
  refresh_token?: string
  expires_in: number
}

class GmailAuthService {
  private oauth2Client: OAuth2Client | null = null
  private codeVerifier: string | null = null

  private getClient(): OAuth2Client {
    if (this.oauth2Client) return this.oauth2Client
    const { gmail } = getConfig()
    const redirectUri = process.env.NEXT_PUBLIC_APP_URL
      ? `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/gmail/callback`
      : 'http://localhost:3000/api/auth/gmail/callback'
    this.oauth2Client = new OAuth2Client(gmail.clientId, gmail.clientSecret, redirectUri)
    return this.oauth2Client
  }

  private generatePKCE(): { codeVerifier: string; codeChallenge: string } {
    const codeVerifier = randomBytes(32).toString('base64url')
    return {
      codeVerifier,
      codeChallenge: createHash('sha256').update(codeVerifier).digest('base64url'),
    }
  }

  generateAuthUrl(): string {
    const { codeVerifier, codeChallenge } = this.generatePKCE()
    this.codeVerifier = codeVerifier
    return this.getClient().generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/gmail.readonly'],
      prompt: 'consent',
      code_challenge: codeChallenge,
      code_challenge_method: CodeChallengeMethod.S256,
    })
  }

  async exchangeCodeForTokens(code: string): Promise<GmailTokens> {
    if (!this.codeVerifier) throw new Error('Code verifier not found')
    try {
      const { tokens } = await this.getClient().getToken({ code, codeVerifier: this.codeVerifier })
      if (!tokens.access_token) throw new Error('Failed to obtain access token')
      return {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token || undefined,
        expires_in: tokens.expiry_date
          ? Math.max(0, Math.floor((tokens.expiry_date - Date.now()) / 1000))
          : 3600,
      }
    } catch (error) {
      throw new Error(
        `Token exchange failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    } finally {
      this.codeVerifier = null
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<GmailTokens> {
    const client = this.getClient()
    client.setCredentials({ refresh_token: refreshToken })
    try {
      const { credentials } = await client.refreshAccessToken()
      if (!credentials.access_token) throw new Error('Failed to refresh access token')
      return {
        access_token: credentials.access_token,
        refresh_token: credentials.refresh_token || refreshToken,
        expires_in: credentials.expiry_date
          ? Math.max(0, Math.floor((credentials.expiry_date - Date.now()) / 1000))
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
