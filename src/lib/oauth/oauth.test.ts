/**
 * OAuth Module Tests
 * 
 * Comprehensive test suite for OAuth2.0 authentication functionality
 * including PKCE implementation and Supabase integration.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { OAuthManager } from './common-oauth';
import { GoogleOAuthProvider } from './providers/google-oauth-provider';
import { OAuthException } from './types';
import type {
  OAuthInitiateRequest,
  OAuthCallbackRequest,
  OAuthTokenResponse,
  OAuthUserInfo
} from './types';

// ============================================================================
// Test Setup and Mocks
// ============================================================================

// Mock Supabase
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      admin: {
        updateUserById: vi.fn(),
        getUserById: vi.fn()
      }
    }
  }))
}));

// Mock crypto for deterministic tests
vi.mock('crypto', () => ({
  randomBytes: vi.fn((size: number) => Buffer.alloc(size, 'a')),
  createHash: vi.fn(() => ({
    update: vi.fn().mockReturnThis(),
    digest: vi.fn(() => Buffer.from('mocked-hash'))
  })),
  createCipher: vi.fn(() => ({
    setAAD: vi.fn(),
    update: vi.fn(() => 'encrypted'),
    final: vi.fn(() => ''),
    getAuthTag: vi.fn(() => Buffer.from('tag'))
  })),
  createDecipher: vi.fn(() => ({
    setAAD: vi.fn(),
    setAuthTag: vi.fn(),
    update: vi.fn(() => 'decrypted'),
    final: vi.fn(() => '')
  })),
  scryptSync: vi.fn(() => Buffer.alloc(32))
}));

// Mock fetch
global.fetch = vi.fn();

// Mock environment variables
const originalEnv = process.env;
beforeEach(() => {
  process.env = {
    ...originalEnv,
    NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
    SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
    GOOGLE_OAUTH_CLIENT_ID: 'test-client-id',
    GOOGLE_OAUTH_CLIENT_SECRET: 'test-client-secret',
    OAUTH_ENCRYPTION_KEY: 'test-encryption-key',
    NEXT_PUBLIC_APP_URL: 'https://test.example.com'
  };
});

afterEach(() => {
  process.env = originalEnv;
  vi.clearAllMocks();
});

// ============================================================================
// OAuth Manager Tests
// ============================================================================

describe('OAuthManager', () => {
  let oauthManager: OAuthManager;
  const testUserId = 'test-user-123';

  beforeEach(() => {
    oauthManager = new OAuthManager();
  });

  describe('OAuth Flow Initiation', () => {
    it('should initiate OAuth flow with PKCE parameters', async () => {
      const request: OAuthInitiateRequest = {
        provider: 'google',
        scopes: ['https://www.googleapis.com/auth/gmail.readonly'],
        redirectUri: 'https://test.example.com/callback'
      };

      const result = await oauthManager.initiateOAuth(testUserId, request);

      expect(result).toMatchObject({
        authorizationUrl: expect.stringContaining('accounts.google.com'),
        state: expect.any(String),
        codeChallenge: expect.any(String),
        codeChallengeMethod: 'S256'
      });

      expect(result.authorizationUrl).toContain('code_challenge=');
      expect(result.authorizationUrl).toContain('code_challenge_method=S256');
      expect(result.authorizationUrl).toContain('state=');
    });

    it('should use default redirect URI if not provided', async () => {
      const request: OAuthInitiateRequest = {
        provider: 'google',
        scopes: ['https://www.googleapis.com/auth/gmail.readonly']
      };

      const result = await oauthManager.initiateOAuth(testUserId, request);

      expect(result.authorizationUrl).toContain(
        encodeURIComponent('https://test.example.com/auth/callback')
      );
    });

    it('should throw error for unsupported provider', async () => {
      const request = {
        provider: 'unsupported' as any,
        scopes: ['test-scope']
      };

      await expect(
        oauthManager.initiateOAuth(testUserId, request)
      ).rejects.toThrow(OAuthException);
    });
  });

  describe('OAuth Callback Handling', () => {
    beforeEach(async () => {
      // First initiate OAuth to set up PKCE parameters
      await oauthManager.initiateOAuth(testUserId, {
        provider: 'google',
        scopes: ['https://www.googleapis.com/auth/gmail.readonly']
      });
    });

    it('should handle OAuth callback successfully', async () => {
      const mockTokenResponse = {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        expires_in: 3600,
        token_type: 'Bearer',
        scope: 'https://www.googleapis.com/auth/gmail.readonly'
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTokenResponse)
      });

      const callbackRequest: OAuthCallbackRequest = {
        code: 'auth-code-123',
        state: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', // Mocked state
        codeVerifier: 'YWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYQ', // Mocked verifier
        redirectUri: 'https://test.example.com/callback'
      };

      const result = await oauthManager.handleOAuthCallback(
        testUserId,
        'google',
        callbackRequest
      );

      expect(result).toMatchObject({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        expiresIn: 3600,
        tokenType: 'Bearer'
      });
    });

    it('should throw error for invalid state parameter', async () => {
      const callbackRequest: OAuthCallbackRequest = {
        code: 'auth-code-123',
        state: 'invalid-state',
        codeVerifier: 'YWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYQ',
        redirectUri: 'https://test.example.com/callback'
      };

      await expect(
        oauthManager.handleOAuthCallback(testUserId, 'google', callbackRequest)
      ).rejects.toThrow('Invalid state parameter');
    });

    it('should throw error for missing PKCE parameters', async () => {
      const callbackRequest: OAuthCallbackRequest = {
        code: 'auth-code-123',
        state: 'unknown-state',
        codeVerifier: 'unknown-verifier',
        redirectUri: 'https://test.example.com/callback'
      };

      await expect(
        oauthManager.handleOAuthCallback('unknown-user', 'google', callbackRequest)
      ).rejects.toThrow('PKCE parameters not found or expired');
    });
  });

  describe('Token Management', () => {
    it('should refresh expired tokens', async () => {
      const mockRefreshResponse = {
        access_token: 'new-access-token',
        expires_in: 3600,
        token_type: 'Bearer'
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockRefreshResponse)
      });

      // Mock getUserTokens to return stored tokens
      const mockSupabase = {
        auth: {
          admin: {
            getUserById: vi.fn().mockResolvedValue({
              data: {
                user: {
                  user_metadata: {
                    google_oauth: {
                      accessToken: 'encrypted-token',
                      refreshToken: 'encrypted-refresh',
                      expiresAt: new Date('2020-01-01'),
                      scope: 'test-scope',
                      tokenType: 'Bearer',
                      provider: 'google'
                    }
                  }
                }
              }
            }),
            updateUserById: vi.fn()
          }
        }
      };

      const result = await oauthManager.refreshToken(testUserId, 'google');

      expect(result.accessToken).toBe('new-access-token');
      expect(result.expiresIn).toBe(3600);
    });

    it('should validate and return stored access token', async () => {
      // Mock valid stored tokens
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 1);

      const mockSupabase = {
        auth: {
          admin: {
            getUserById: vi.fn().mockResolvedValue({
              data: {
                user: {
                  user_metadata: {
                    google_oauth: {
                      accessToken: 'encrypted-token',
                      refreshToken: 'encrypted-refresh',
                      expiresAt: futureDate,
                      scope: 'test-scope',
                      tokenType: 'Bearer',
                      provider: 'google'
                    }
                  }
                }
              }
            })
          }
        }
      };

      const result = await oauthManager.getValidAccessToken(testUserId, 'google');
      expect(typeof result).toBe('string');
    });

    it('should check if user has valid tokens', async () => {
      const mockSupabase = {
        auth: {
          admin: {
            getUserById: vi.fn().mockResolvedValue({
              data: {
                user: {
                  user_metadata: {
                    google_oauth: {
                      accessToken: 'encrypted-token',
                      refreshToken: 'encrypted-refresh',
                      expiresAt: new Date('2025-01-01'),
                      scope: 'test-scope',
                      tokenType: 'Bearer',
                      provider: 'google'
                    }
                  }
                }
              }
            })
          }
        }
      };

      const hasTokens = await oauthManager.hasValidTokens(testUserId, 'google');
      expect(hasTokens).toBe(true);
    });
  });

  describe('Token Revocation', () => {
    it('should revoke tokens successfully', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: true
      });

      const mockSupabase = {
        auth: {
          admin: {
            getUserById: vi.fn().mockResolvedValue({
              data: {
                user: {
                  user_metadata: {
                    google_oauth: {
                      accessToken: 'encrypted-token',
                      scope: 'test-scope'
                    }
                  }
                }
              }
            }),
            updateUserById: vi.fn()
          }
        }
      };

      await expect(
        oauthManager.revokeTokens(testUserId, 'google')
      ).resolves.not.toThrow();
    });
  });
});

// ============================================================================
// Google OAuth Provider Tests
// ============================================================================

describe('GoogleOAuthProvider', () => {
  let provider: GoogleOAuthProvider;

  beforeEach(() => {
    provider = new GoogleOAuthProvider({
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
        new GoogleOAuthProvider({
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
      expect(url).toContain('redirect_uri=https%3A//example.com/callback');
      expect(url).toContain('response_type=code');
      expect(url).toContain('scope=https%3A//www.googleapis.com/auth/gmail.readonly');
      expect(url).toContain('state=test-state');
      expect(url).toContain('code_challenge=test-challenge');
      expect(url).toContain('code_challenge_method=S256');
      expect(url).toContain('access_type=offline');
      expect(url).toContain('prompt=consent');
    });
  });

  describe('Token Exchange', () => {
    it('should exchange authorization code for tokens', async () => {
      const mockResponse = {
        access_token: 'access-token-123',
        refresh_token: 'refresh-token-123',
        expires_in: 3600,
        token_type: 'Bearer',
        scope: 'https://www.googleapis.com/auth/gmail.readonly'
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await provider.exchangeCodeForTokens({
        code: 'auth-code-123',
        redirectUri: 'https://example.com/callback',
        codeVerifier: 'code-verifier-123'
      });

      expect(result).toMatchObject({
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-123',
        expiresIn: 3600,
        tokenType: 'Bearer'
      });
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
      const mockResponse = {
        access_token: 'new-access-token',
        expires_in: 3600,
        token_type: 'Bearer'
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await provider.refreshAccessToken('refresh-token-123');

      expect(result.accessToken).toBe('new-access-token');
      expect(result.expiresIn).toBe(3600);
    });
  });

  describe('Token Validation', () => {
    it('should validate token and return user info', async () => {
      const mockUserInfo = {
        id: '123456789',
        email: 'test@example.com',
        name: 'Test User',
        picture: 'https://example.com/photo.jpg',
        verified_email: true
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUserInfo)
      });

      const result = await provider.validateToken('access-token-123');

      expect(result).toMatchObject({
        id: '123456789',
        email: 'test@example.com',
        name: 'Test User',
        emailVerified: true,
        provider: 'google'
      });
    });

    it('should handle invalid token', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({
          error: 'invalid_token'
        })
      });

      await expect(
        provider.validateToken('invalid-token')
      ).rejects.toThrow(OAuthException);
    });
  });

  describe('API Clients', () => {
    it('should create Gmail API client', () => {
      const client = provider.getGmailApiClient('access-token');
      
      expect(client).toHaveProperty('listMessages');
      expect(client).toHaveProperty('getMessage');
      expect(client).toHaveProperty('getAttachment');
      expect(typeof client.listMessages).toBe('function');
    });

    it('should create Drive API client', () => {
      const client = provider.getDriveApiClient('access-token');
      
      expect(client).toHaveProperty('listFiles');
      expect(client).toHaveProperty('getFile');
      expect(client).toHaveProperty('downloadFile');
      expect(client).toHaveProperty('uploadFile');
      expect(client).toHaveProperty('deleteFile');
      expect(typeof client.listFiles).toBe('function');
    });

    it('should handle API authentication errors', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 401
      });

      const client = provider.getGmailApiClient('invalid-token');
      
      await expect(
        client.listMessages()
      ).rejects.toThrow(OAuthException);
    });
  });

  describe('Scope Validation', () => {
    it('should validate granted scopes', () => {
      const grantedScopes = [
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/userinfo.email'
      ];
      
      const requiredScopes = [
        'https://www.googleapis.com/auth/gmail.readonly'
      ];
      
      const isValid = provider.validateScopes(grantedScopes, requiredScopes);
      expect(isValid).toBe(true);
    });

    it('should reject insufficient scopes', () => {
      const grantedScopes = [
        'https://www.googleapis.com/auth/userinfo.email'
      ];
      
      const requiredScopes = [
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/drive.file'
      ];
      
      const isValid = provider.validateScopes(grantedScopes, requiredScopes);
      expect(isValid).toBe(false);
    });

    it('should provide scope descriptions', () => {
      const scopes = [
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/userinfo.email'
      ];
      
      const descriptions = provider.getScopeDescriptions(scopes);
      
      expect(descriptions).toHaveProperty('https://www.googleapis.com/auth/gmail.readonly');
      expect(descriptions).toHaveProperty('https://www.googleapis.com/auth/userinfo.email');
      expect(typeof descriptions['https://www.googleapis.com/auth/gmail.readonly']).toBe('string');
    });
  });
});

// ============================================================================
// Type Guard Tests
// ============================================================================

describe('Type Guards', () => {
  it('should identify OAuth errors correctly', () => {
    const { isOAuthError } = require('./types');
    
    expect(isOAuthError({ error: 'invalid_grant' })).toBe(true);
    expect(isOAuthError({ error: 'test', description: 'desc' })).toBe(true);
    expect(isOAuthError({ message: 'error' })).toBe(false);
    expect(isOAuthError(null)).toBe(false);
    expect(isOAuthError('error')).toBe(false);
  });

  it('should identify OAuth token responses correctly', () => {
    const { isOAuthTokenResponse } = require('./types');
    
    const validToken = {
      accessToken: 'token',
      expiresIn: 3600,
      tokenType: 'Bearer'
    };
    
    expect(isOAuthTokenResponse(validToken)).toBe(true);
    expect(isOAuthTokenResponse({ accessToken: 'token' })).toBe(false);
    expect(isOAuthTokenResponse({})).toBe(false);
  });

  it('should validate OAuth providers correctly', () => {
    const { isValidOAuthProvider } = require('./types');
    
    expect(isValidOAuthProvider('google')).toBe(true);
    expect(isValidOAuthProvider('facebook')).toBe(false);
    expect(isValidOAuthProvider('')).toBe(false);
  });
});

// ============================================================================
// Integration Tests
// ============================================================================

describe('OAuth Integration', () => {
  it('should handle complete OAuth flow', async () => {
    const oauthManager = new OAuthManager();
    const userId = 'test-user';
    
    // Step 1: Initiate OAuth
    const initiateResult = await oauthManager.initiateOAuth(userId, {
      provider: 'google',
      scopes: ['https://www.googleapis.com/auth/gmail.readonly']
    });
    
    expect(initiateResult.authorizationUrl).toContain('accounts.google.com');
    
    // Step 2: Mock successful callback
    const mockTokenResponse = {
      access_token: 'access-token',
      refresh_token: 'refresh-token',
      expires_in: 3600,
      token_type: 'Bearer'
    };
    
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockTokenResponse)
    });
    
    const callbackResult = await oauthManager.handleOAuthCallback(userId, 'google', {
      code: 'auth-code',
      state: initiateResult.state,
      codeVerifier: 'YWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYQ',
      redirectUri: 'https://test.example.com/auth/callback'
    });
    
    expect(callbackResult.accessToken).toBe('access-token');
    expect(callbackResult.refreshToken).toBe('refresh-token');
  });
});