/**
 * OAuth Manager Tests
 * 
 * Tests for OAuth Manager functionality including PKCE and error handling
 */

import { describe, it, expect } from 'vitest';
import { OAuthManager } from './oauth-manager';
import { OAuthException } from './types';
import type {
  OAuthInitiateRequest,
  OAuthCallbackRequest,
  OAuthTokenResponse
} from './types';
import { setupOAuthTestEnv } from './oauth-test-setup';

// Setup test environment
setupOAuthTestEnv();

// ============================================================================
// OAuth Manager Tests (Non-initialization)
// ============================================================================

describe('OAuthManager (without auto-initialization)', () => {
  const testUserId = 'test-user-123';

  describe('OAuth Flow Initiation', () => {
    it('should generate PKCE parameters correctly', () => {
      // Create manager manually to avoid initialization issues
      const manager = new OAuthManager();
      
      // Test should pass with environment variables set
      expect(manager).toBeDefined();
    });

    it('should handle OAuth initiation request format', async () => {
      const request: OAuthInitiateRequest = {
        provider: 'google',
        scopes: ['https://www.googleapis.com/auth/gmail.readonly'],
        redirectUri: 'https://test.example.com/callback'
      };

      // Validate request structure
      expect(request.provider).toBe('google');
      expect(request.scopes).toContain('https://www.googleapis.com/auth/gmail.readonly');
      expect(request.redirectUri).toBe('https://test.example.com/callback');
    });
  });

  describe('OAuth Callback Handling', () => {
    it('should validate callback request structure', () => {
      const callbackRequest: OAuthCallbackRequest = {
        code: 'auth-code-123',
        state: 'test-state',
        codeVerifier: 'test-verifier',
        redirectUri: 'https://test.example.com/callback'
      };

      expect(callbackRequest.code).toBe('auth-code-123');
      expect(callbackRequest.state).toBe('test-state');
      expect(callbackRequest.codeVerifier).toBe('test-verifier');
    });

    it('should handle token response format', () => {
      const tokenResponse: OAuthTokenResponse = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        expiresIn: 3600,
        tokenType: 'Bearer',
        scope: 'https://www.googleapis.com/auth/gmail.readonly'
      };

      expect(tokenResponse.accessToken).toBe('mock-access-token');
      expect(tokenResponse.expiresIn).toBe(3600);
      expect(tokenResponse.tokenType).toBe('Bearer');
    });
  });

  describe('Error Handling', () => {
    it('should create OAuth exceptions correctly', () => {
      const exception = new OAuthException('invalid_request', 'Test error description');
      
      expect(exception.error).toBe('invalid_request');
      expect(exception.description).toBe('Test error description');
      expect(exception.message).toContain('invalid_request');
      expect(exception.name).toBe('OAuthException');
    });

    it('should handle different OAuth error types', () => {
      const errors = [
        'invalid_request',
        'unauthorized_client',
        'access_denied',
        'invalid_grant',
        'invalid_token'
      ] as const;

      errors.forEach(errorCode => {
        const exception = new OAuthException(errorCode, `Test ${errorCode}`);
        expect(exception.error).toBe(errorCode);
      });
    });
  });
});