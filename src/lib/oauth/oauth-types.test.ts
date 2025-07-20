/**
 * OAuth Type Guards Tests
 * 
 * Tests for OAuth type validation functions
 */

import { describe, it, expect } from 'vitest';
import { isOAuthError, isOAuthTokenResponse, isValidOAuthProvider } from './types';
import { setupOAuthTestEnv } from './oauth-test-setup';

// Setup test environment
setupOAuthTestEnv();

// ============================================================================
// Type Guard Tests
// ============================================================================

describe('Type Guards', () => {
  it('should identify OAuth errors correctly', () => {
    expect(isOAuthError({ error: 'invalid_grant' })).toBe(true);
    expect(isOAuthError({ error: 'test', description: 'desc' })).toBe(true);
    expect(isOAuthError({ message: 'error' })).toBe(false);
    expect(isOAuthError(null)).toBe(false);
    expect(isOAuthError('error')).toBe(false);
  });

  it('should identify OAuth token responses correctly', () => {
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
    expect(isValidOAuthProvider('google')).toBe(true);
    expect(isValidOAuthProvider('facebook')).toBe(false);
    expect(isValidOAuthProvider('')).toBe(false);
  });
});