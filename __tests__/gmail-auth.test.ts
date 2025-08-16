import { gmailAuthService } from '@/lib/gmail-auth'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock google-auth-library
vi.mock('google-auth-library', () => ({
  OAuth2Client: vi.fn().mockImplementation(() => ({
    generateAuthUrl: vi.fn().mockReturnValue('https://accounts.google.com/oauth2/auth?test=true'),
    getToken: vi.fn().mockResolvedValue({
      tokens: {
        access_token: 'mock_access_token',
        refresh_token: 'mock_refresh_token',
        expiry_date: Date.now() + 3600000, // 1 hour from now
      },
    }),
    refreshAccessToken: vi.fn().mockResolvedValue({
      credentials: {
        access_token: 'mock_refreshed_token',
        refresh_token: 'mock_refresh_token',
        expiry_date: Date.now() + 3600000,
      },
    }),
    setCredentials: vi.fn(),
  })),
  CodeChallengeMethod: {
    S256: 'S256',
  },
}))

// Mock crypto
vi.mock('node:crypto', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    randomBytes: vi.fn().mockReturnValue({
      toString: vi.fn().mockReturnValue('mock_code_verifier'),
    }),
    createHash: vi.fn().mockReturnValue({
      update: vi.fn().mockReturnThis(),
      digest: vi.fn().mockReturnValue('mock_code_challenge'),
    }),
  }
})

// Mock config
vi.mock('@/lib/config', () => ({
  getConfig: vi.fn().mockReturnValue({
    gmail: {
      clientId: 'test_client_id',
      clientSecret: 'test_client_secret',
    },
  }),
}))

describe('GmailAuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('generateAuthUrl', () => {
    it('should generate OAuth authorization URL with PKCE', () => {
      const authUrl = gmailAuthService.generateAuthUrl()

      expect(authUrl).toBe('https://accounts.google.com/oauth2/auth?test=true')
      expect(authUrl).toContain('https://accounts.google.com')
    })
  })

  describe('exchangeCodeForTokens', () => {
    it('should exchange authorization code for tokens', async () => {
      // First generate auth URL to set code verifier
      gmailAuthService.generateAuthUrl()

      const tokens = await gmailAuthService.exchangeCodeForTokens('test_code')

      expect(tokens).toEqual({
        access_token: 'mock_access_token',
        refresh_token: 'mock_refresh_token',
        expires_in: expect.any(Number),
      })
      expect(tokens.expires_in).toBeGreaterThan(0)
    })

    it('should throw error if code verifier not found', async () => {
      await expect(gmailAuthService.exchangeCodeForTokens('test_code')).rejects.toThrow(
        'Code verifier not found'
      )
    })

    it('should handle expires_in correctly', async () => {
      gmailAuthService.generateAuthUrl()
      const tokens = await gmailAuthService.exchangeCodeForTokens('test_code')
      expect(tokens.expires_in).toBeGreaterThanOrEqual(0)
    })
  })

  describe('refreshAccessToken', () => {
    it('should refresh access token using refresh token', async () => {
      const tokens = await gmailAuthService.refreshAccessToken('mock_refresh_token')

      expect(tokens).toEqual({
        access_token: 'mock_refreshed_token',
        refresh_token: 'mock_refresh_token',
        expires_in: expect.any(Number),
      })
      expect(tokens.expires_in).toBeGreaterThan(0)
    })
  })
})
