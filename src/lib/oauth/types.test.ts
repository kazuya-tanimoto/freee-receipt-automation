/**
 * OAuth Types Test
 * 
 * Tests for OAuth type definitions and constants
 */

import { describe, it, expect } from 'vitest';
import {
  GMAIL_SCOPES,
  DRIVE_SCOPES,
  OAUTH_CONFIG,
  GOOGLE_ENDPOINTS
} from './types';

describe('OAuth Constants', () => {
  describe('GMAIL_SCOPES', () => {
    it('should have readonly scope', () => {
      expect(GMAIL_SCOPES.READONLY).toBe('https://www.googleapis.com/auth/gmail.readonly');
    });
  });

  describe('DRIVE_SCOPES', () => {
    it('should have readonly scope', () => {
      expect(DRIVE_SCOPES.READONLY).toBe('https://www.googleapis.com/auth/drive.readonly');
    });
  });

  describe('OAUTH_CONFIG', () => {
    it('should have correct code verifier length', () => {
      expect(OAUTH_CONFIG.CODE_VERIFIER_LENGTH).toBe(64);
    });

    it('should have correct state length', () => {
      expect(OAUTH_CONFIG.STATE_LENGTH).toBe(32);
    });

    it('should have correct token refresh buffer', () => {
      expect(OAUTH_CONFIG.TOKEN_REFRESH_BUFFER).toBe(300);
    });

    it('should have correct PKCE storage duration', () => {
      expect(OAUTH_CONFIG.PKCE_STORAGE_DURATION).toBe(600);
    });
  });

  describe('GOOGLE_ENDPOINTS', () => {
    it('should have correct authorization endpoint', () => {
      expect(GOOGLE_ENDPOINTS.AUTHORIZATION).toBe('https://accounts.google.com/o/oauth2/v2/auth');
    });

    it('should have correct token endpoint', () => {
      expect(GOOGLE_ENDPOINTS.TOKEN).toBe('https://oauth2.googleapis.com/token');
    });

    it('should have correct revoke endpoint', () => {
      expect(GOOGLE_ENDPOINTS.REVOKE).toBe('https://oauth2.googleapis.com/revoke');
    });
  });
});