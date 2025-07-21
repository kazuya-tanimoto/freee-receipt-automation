/**
 * Google OAuth Provider Tests - Core Tests
 * 
 * Tests for Google OAuth provider core functionality
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GoogleOAuth } from './google-oauth';
import { OAuthException } from './types';
import { setupOAuthTestEnv } from './oauth-test-setup';

// Mock googleapis
vi.mock('googleapis', () => ({
  google: {
    auth: {
      OAuth2: vi.fn().mockImplementation(() => ({
        generateAuthUrl: vi.fn().mockReturnValue('https://accounts.google.com/o/oauth2/v2/auth?client_id=test-client-id&redirect_uri=https%3A%2F%2Fexample.com%2Fcallback&response_type=code&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fgmail.readonly&state=test-state&code_challenge=test-challenge&code_challenge_method=S256&access_type=offline&prompt=consent'),
        getToken: vi.fn(),
        setCredentials: vi.fn(),
        refreshAccessToken: vi.fn(),
        revokeCredentials: vi.fn()
      }))
    },
    oauth2: vi.fn().mockReturnValue({
      userinfo: {
        get: vi.fn()
      }
    }),
    gmail: vi.fn().mockReturnValue({}),
    drive: vi.fn().mockReturnValue({})
  }
}));

// Setup test environment
setupOAuthTestEnv();

// ============================================================================
// Google OAuth Core Tests
// ============================================================================

describe('GoogleOAuth', () => {
  let provider: GoogleOAuth;

  beforeEach(() => {
    provider = new GoogleOAuth({
      name: 'google',
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret',
      authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenEndpoint: 'https://oauth2.googleapis.com/token',
      defaultScopes: ['email'],
      supportedScopes: ['email', 'https://www.googleapis.com/auth/gmail.readonly']
    });
  });

  describe('Configuration Validation', () => {
    it('should validate required configuration', () => {
      expect(() => {
        new GoogleOAuth({
          name: 'google',
          clientId: '',
          clientSecret: 'secret',
          authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
          tokenEndpoint: 'https://oauth2.googleapis.com/token',
          defaultScopes: [],
          supportedScopes: []
        });
      }).toThrow('Google OAuth client ID is required');
    });

    it('should validate client secret requirement', () => {
      expect(() => {
        new GoogleOAuth({
          name: 'google',
          clientId: 'test-id',
          clientSecret: '',
          authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
          tokenEndpoint: 'https://oauth2.googleapis.com/token',
          defaultScopes: [],
          supportedScopes: []
        });
      }).toThrow('Google OAuth client secret is required');
    });
  });

  describe('Authorization URL Generation', () => {
    it('should generate correct authorization URL', () => {
      const url = provider.generateAuthorizationUrl({
        scopes: ['https://www.googleapis.com/auth/gmail.readonly'],
        redirectUri: 'https://example.com/callback',
        state: 'test-state',
        codeChallenge: 'test-challenge',
        codeChallengeMethod: 'S256'
      });

      expect(url).toContain('accounts.google.com/o/oauth2/v2/auth');
      expect(url).toContain('client_id=test-client-id');
      expect(url).toContain('redirect_uri=https%3A%2F%2Fexample.com%2Fcallback');
      expect(url).toContain('response_type=code');
      expect(url).toContain('scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fgmail.readonly');
      expect(url).toContain('state=test-state');
      expect(url).toContain('code_challenge=test-challenge');
      expect(url).toContain('code_challenge_method=S256');
      expect(url).toContain('access_type=offline');
      expect(url).toContain('prompt=consent');
    });
  });

  describe('Token Exchange', () => {
    it('should exchange authorization code for tokens', async () => {
      const mockTokens = {
        access_token: 'access-token-123',
        refresh_token: 'refresh-token-123',
        expiry_date: Date.now() + 3600000,
        token_type: 'Bearer',
        scope: 'https://www.googleapis.com/auth/gmail.readonly'
      };

      // Mock the OAuth2Client getToken method
      const mockOAuth2Client = (provider as any).oauth2Client;
      mockOAuth2Client.getToken = vi.fn().mockResolvedValue({ tokens: mockTokens });

      const result = await provider.exchangeCodeForTokens({
        code: 'auth-code-123',
        redirectUri: 'https://example.com/callback',
        codeVerifier: 'code-verifier-123'
      });

      expect(result).toMatchObject({
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-123',
        tokenType: 'Bearer'
      });
      expect(result.expiresIn).toBeGreaterThan(0);
    });

    it('should handle token exchange errors', async () => {
      const mockError = {
        error: 'invalid_grant',
        error_description: 'Authorization code has expired'
      };

      (fetch as any).mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve(mockError)
      });

      await expect(
        provider.exchangeCodeForTokens({
          code: 'invalid-code',
          redirectUri: 'https://example.com/callback',
          codeVerifier: 'code-verifier-123'
        })
      ).rejects.toThrow(OAuthException);
    });
  });

  describe('Token Refresh', () => {
    it('should refresh access token', async () => {
      const mockCredentials = {
        access_token: 'new-access-token',
        expiry_date: Date.now() + 3600000,
        token_type: 'Bearer'
      };

      const mockOAuth2Client = (provider as any).oauth2Client;
      mockOAuth2Client.refreshAccessToken = vi.fn().mockResolvedValue({ credentials: mockCredentials });

      const result = await provider.refreshAccessToken('refresh-token-123');

      expect(result.accessToken).toBe('new-access-token');
      expect(result.expiresIn).toBeGreaterThan(0);
    });
  });
});