/**
 * Google OAuth Provider Tests
 * 
 * Tests for Google OAuth provider functionality
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GoogleOAuthProvider } from './providers/google-oauth-provider';
import { OAuthException } from './types';
import { setupOAuthTestEnv } from './oauth-test-setup';

// Setup test environment
setupOAuthTestEnv();

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

    it('should validate client secret requirement', () => {
      expect(() => {
        new GoogleOAuthProvider({
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
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ 
          id: 'user123',
          name: 'Test User',
          email: 'test@example.com',
          verified_email: true,
          picture: 'https://example.com/pic.jpg'
        })
      });

      const result = await provider.validateToken('access-token-123');
      expect(result.id).toBe('user123');
      expect(result.email).toBe('test@example.com');
      expect(result.provider).toBe('google');
    });

    it('should handle invalid token', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 401
      });

      await expect(provider.validateToken('invalid-token')).rejects.toThrow('token_expired');
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
      expect(client).toHaveProperty('createFile');
      expect(client).toHaveProperty('deleteFile');
      expect(typeof client.listFiles).toBe('function');
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
      expect(typeof descriptions['https://www.googleapis.com/auth/gmail.readonly']).toBe('string');
    });
  });
});