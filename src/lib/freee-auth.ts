import type { FreeeAuthConfig, FreeeTokens } from '@/types/config'

/**
 * freee OAuth 2.0 authentication service for expense data access
 */
export class FreeeAuthService {
  private config: FreeeAuthConfig

  constructor(config: FreeeAuthConfig) {
    this.config = config
  }

  /** Generate OAuth authorization URL with read_write scope */
  getAuthorizationUrl(): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: 'read_write',
    })
    return `https://secure.freee.co.jp/oauth/authorize?${params}`
  }

  /** Exchange authorization code for access token with company ID */
  async exchangeCodeForToken(code: string): Promise<FreeeTokens> {
    const tokenResponse = await fetch('https://api.freee.co.jp/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        code,
        redirect_uri: this.config.redirectUri,
      }),
    })

    if (!tokenResponse.ok) {
      throw new Error(`Token exchange failed: ${tokenResponse.status}`)
    }

    const tokenData = await tokenResponse.json()

    // Get company ID
    const companyResponse = await fetch('https://api.freee.co.jp/api/1/companies', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    })

    if (!companyResponse.ok) {
      throw new Error('Failed to get company information')
    }

    const companyData = await companyResponse.json()
    const company = companyData.companies?.[0]

    if (!company?.id) {
      throw new Error('No company found')
    }

    return {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_in: tokenData.expires_in,
      company_id: company.id,
    }
  }
}
