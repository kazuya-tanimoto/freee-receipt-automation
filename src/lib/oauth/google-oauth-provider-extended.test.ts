/**
 * Google OAuth Provider Tests - Extended Tests
 * 
 * Additional tests for API clients and scope validation
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { GoogleOAuth } from './google-oauth';
import { setupOAuthTestEnv } from './oauth-test-setup';

// Setup test environment
setupOAuthTestEnv();

// ============================================================================
// Google OAuth Extended Tests
// ============================================================================

describe('GoogleOAuth - Extended Tests', () => {
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

  describe('API Clients', () => {
    it('should return Gmail client', () => {
      const client = provider.getGmailClient('test-token');
      expect(client).toBeDefined();
    });

    it('should return Drive client', () => {
      const client = provider.getDriveClient('test-token');
      expect(client).toBeDefined();
    });

    it('should have Gmail client methods', () => {
      const client = provider.getGmailClient('test-token');
      expect(typeof client.listMessages).toBe('function');
      expect(typeof client.getMessage).toBe('function');
      expect(typeof client.getAttachment).toBe('function');
    });

    it('should have Drive client methods', () => {
      const client = provider.getDriveClient('test-token');
      expect(typeof client.listFiles).toBe('function');
      expect(typeof client.getFile).toBe('function');
      expect(typeof client.downloadFile).toBe('function');
    });
  });

  describe('Scope Validation', () => {
    it('should validate scopes correctly', () => {
      const grantedScopes = [
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/userinfo.email'
      ];
      const requiredScopes = ['https://www.googleapis.com/auth/gmail.readonly'];

      const result = provider.validateScopes(grantedScopes, requiredScopes);
      expect(result).toBe(true);
    });

    it('should reject insufficient scopes', () => {
      const grantedScopes = ['https://www.googleapis.com/auth/userinfo.email'];
      const requiredScopes = [
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/drive.readonly'
      ];

      const result = provider.validateScopes(grantedScopes, requiredScopes);
      expect(result).toBe(false);
    });

    it('should get scope descriptions', () => {
      const scopes = [
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/userinfo.email'
      ];

      const descriptions = provider.getScopeDescriptions(scopes);
      expect(descriptions).toEqual({
        'https://www.googleapis.com/auth/gmail.readonly': 'Read Gmail messages',
        'https://www.googleapis.com/auth/userinfo.email': 'Access email address'
      });
    });
  });
});