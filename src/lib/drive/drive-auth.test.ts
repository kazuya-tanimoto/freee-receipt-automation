/**
 * Tests for Drive authentication manager
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DriveAuthManager } from './drive-auth';
import { DriveErrorType } from './types';

// Mock OAuth provider
vi.mock('../oauth/providers/google-oauth-provider', () => ({
  GoogleOAuthProvider: vi.fn().mockImplementation(() => ({
    initialize: vi.fn().mockResolvedValue(undefined)
  }))
}));

describe('DriveAuthManager', () => {
  let authManager: DriveAuthManager;

  beforeEach(() => {
    // Clear singleton instance
    (DriveAuthManager as any).instance = null;
    authManager = DriveAuthManager.getInstance();
  });

  describe('singleton pattern', () => {
    it('should return same instance', () => {
      const instance1 = DriveAuthManager.getInstance();
      const instance2 = DriveAuthManager.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('initialize', () => {
    it('should initialize successfully', async () => {
      // Set required environment variables
      process.env.GOOGLE_CLIENT_ID = 'test_client_id';
      process.env.GOOGLE_CLIENT_SECRET = 'test_client_secret';
      process.env.GOOGLE_REDIRECT_URI = 'test_redirect_uri';
      
      await expect(authManager.initialize()).resolves.not.toThrow();
    });

    it('should handle initialization errors when missing env vars', async () => {
      // Clear environment variables to trigger error
      const originalEnv = process.env;
      process.env = {};

      try {
        await authManager.initialize();
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeDefined();
      }
      
      process.env = originalEnv;
    });
  });

  describe('authenticate', () => {
    beforeEach(async () => {
      process.env.GOOGLE_CLIENT_ID = 'test_client_id';
      process.env.GOOGLE_CLIENT_SECRET = 'test_client_secret';
      process.env.GOOGLE_REDIRECT_URI = 'test_redirect_uri';
      await authManager.initialize();
    });

    it('should authenticate successfully', async () => {
      await expect(authManager.authenticate()).resolves.not.toThrow();
      expect(authManager.getAccessToken()).toBeTruthy();
    });

    it('should throw error when not initialized', async () => {
      const newManager = new (DriveAuthManager as any)();
      await expect(newManager.authenticate()).rejects.toThrow();
    });
  });

  describe('verifyAuthentication', () => {
    beforeEach(async () => {
      process.env.GOOGLE_CLIENT_ID = 'test_client_id';
      process.env.GOOGLE_CLIENT_SECRET = 'test_client_secret';
      process.env.GOOGLE_REDIRECT_URI = 'test_redirect_uri';
      await authManager.initialize();
    });

    it('should return true for valid authentication', async () => {
      await authManager.authenticate();
      const isValid = await authManager.verifyAuthentication();
      expect(isValid).toBe(true);
    });

    it('should return false when not authenticated', async () => {
      const isValid = await authManager.verifyAuthentication();
      expect(isValid).toBe(false);
    });
  });

  describe('getAccessToken', () => {
    it('should return null when not authenticated', () => {
      expect(authManager.getAccessToken()).toBeNull();
    });

    it('should return token when authenticated', async () => {
      process.env.GOOGLE_CLIENT_ID = 'test_client_id';
      process.env.GOOGLE_CLIENT_SECRET = 'test_client_secret';
      process.env.GOOGLE_REDIRECT_URI = 'test_redirect_uri';
      await authManager.initialize();
      await authManager.authenticate();
      expect(authManager.getAccessToken()).toBe('mock_access_token');
    });
  });

  describe('refreshTokens', () => {
    beforeEach(async () => {
      process.env.GOOGLE_CLIENT_ID = 'test_client_id';
      process.env.GOOGLE_CLIENT_SECRET = 'test_client_secret';
      process.env.GOOGLE_REDIRECT_URI = 'test_redirect_uri';
      await authManager.initialize();
      await authManager.authenticate();
    });

    it('should refresh tokens successfully', async () => {
      await expect(authManager.refreshTokens()).resolves.not.toThrow();
    });

    it('should throw error when no provider', async () => {
      authManager.clear();
      await expect(authManager.refreshTokens()).rejects.toThrow();
    });
  });

  describe('clear', () => {
    it('should clear authentication state', async () => {
      process.env.GOOGLE_CLIENT_ID = 'test_client_id';
      process.env.GOOGLE_CLIENT_SECRET = 'test_client_secret';
      process.env.GOOGLE_REDIRECT_URI = 'test_redirect_uri';
      await authManager.initialize();
      await authManager.authenticate();
      
      authManager.clear();
      
      expect(authManager.getAccessToken()).toBeNull();
    });
  });

  describe('createDriveError', () => {
    it('should create error with correct type', () => {
      const error = authManager['createDriveError'](
        DriveErrorType.AUTH_ERROR,
        'Test error'
      );
      
      expect(error.type).toBe(DriveErrorType.AUTH_ERROR);
      expect(error.message).toBe('Test error');
      expect(error.retryable).toBe(false);
    });

    it('should handle retryable errors', () => {
      const error = authManager['createDriveError'](
        DriveErrorType.NETWORK_ERROR,
        'Network error'
      );
      
      expect(error.retryable).toBe(true);
    });

    it('should include original error details', () => {
      const originalError = new Error('Original');
      const error = authManager['createDriveError'](
        DriveErrorType.AUTH_ERROR,
        'Test error',
        originalError
      );
      
      expect(error.details).toBeDefined();
      expect(error.details!.originalError).toBe(originalError);
    });
  });
});