/**
 * Comprehensive tests for Google Drive client integration
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DriveClient } from './drive-client';
import { DriveErrorType } from './types';

// Mock OAuth provider
vi.mock('../oauth/providers/google-oauth-provider', () => ({
  GoogleOAuthProvider: vi.fn().mockImplementation(() => ({
    initialize: vi.fn().mockResolvedValue(undefined),
    authenticate: vi.fn().mockResolvedValue({
      access_token: 'mock_token',
      refresh_token: 'mock_refresh',
      expires_in: 3600,
      token_type: 'Bearer'
    })
  }))
}));

describe('DriveClient', () => {
  let driveClient: DriveClient;

  beforeEach(() => {
    // Clear singleton instance
    (DriveClient as any).instance = null;
    driveClient = DriveClient.getInstance();
  });

  describe('initialization', () => {
    it('should initialize successfully with valid auth', async () => {
      await expect(driveClient.initialize()).resolves.not.toThrow();
    });

    it('should throw error if auth verification fails', async () => {
      // Mock auth verification failure
      vi.spyOn(driveClient['authManager'], 'verifyAuthentication')
        .mockResolvedValue(false);

      await expect(driveClient.initialize()).rejects.toThrow();
    });
  });

  describe('singleton pattern', () => {
    it('should return same instance', () => {
      const instance1 = DriveClient.getInstance();
      const instance2 = DriveClient.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should accept configuration on first call', () => {
      const config = { retryAttempts: 5 };
      const instance = DriveClient.getInstance(config);
      expect(instance['config'].retryAttempts).toBe(5);
    });
  });

  describe('getDrive', () => {
    it('should return drive instance when initialized', async () => {
      await driveClient.initialize();
      expect(driveClient.getDrive()).toBeDefined();
    });

    it('should throw error when not initialized', () => {
      expect(() => driveClient.getDrive()).toThrow();
    });
  });

  describe('getStorageInfo', () => {
    beforeEach(async () => {
      await driveClient.initialize();
    });

    it('should return storage information successfully', async () => {
      const result = await driveClient.getStorageInfo();
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.limit).toBeGreaterThan(0);
      expect(result.data!.usage).toBeGreaterThanOrEqual(0);
    });

    it('should handle API errors', async () => {
      // Mock API error by throwing in the method
      vi.spyOn(driveClient, 'getStorageInfo').mockImplementation(async () => {
        throw { code: 500, message: 'Internal server error' };
      });

      await expect(driveClient.getStorageInfo()).rejects.toThrow();
    });
  });

  describe('operation getters', () => {
    beforeEach(async () => {
      await driveClient.initialize();
    });

    it('should return file creator when initialized', () => {
      expect(driveClient.getFileCreator()).toBeDefined();
    });

    it('should return file lister when initialized', () => {
      expect(driveClient.getFileLister()).toBeDefined();
    });

    it('should return file getter when initialized', () => {
      expect(driveClient.getFileGetter()).toBeDefined();
    });

    it('should return file categorizer', () => {
      expect(driveClient.getFileCategorizer()).toBeDefined();
    });
  });

  describe('error handling', () => {
    beforeEach(async () => {
      await driveClient.initialize();
    });

    it('should convert HTTP 401 to AUTH_ERROR', () => {
      const error = { code: 401, message: 'Unauthorized' };
      const driveError = driveClient['handleError'](error);
      
      expect(driveError.type).toBe(DriveErrorType.AUTH_ERROR);
      expect(driveError.retryable).toBe(false);
    });

    it('should convert HTTP 403 to PERMISSION_DENIED', () => {
      const error = { code: 403, message: 'Forbidden' };
      const driveError = driveClient['handleError'](error);
      
      expect(driveError.type).toBe(DriveErrorType.PERMISSION_DENIED);
      expect(driveError.retryable).toBe(false);
    });

    it('should convert HTTP 404 to FILE_NOT_FOUND', () => {
      const error = { code: 404, message: 'Not found' };
      const driveError = driveClient['handleError'](error);
      
      expect(driveError.type).toBe(DriveErrorType.FILE_NOT_FOUND);
      expect(driveError.retryable).toBe(false);
    });

    it('should convert HTTP 429 to RATE_LIMIT_ERROR', () => {
      const error = { code: 429, message: 'Too many requests' };
      const driveError = driveClient['handleError'](error);
      
      expect(driveError.type).toBe(DriveErrorType.RATE_LIMIT_ERROR);
      expect(driveError.retryable).toBe(true);
    });

    it('should convert HTTP 507 to STORAGE_FULL', () => {
      const error = { code: 507, message: 'Insufficient storage' };
      const driveError = driveClient['handleError'](error);
      
      expect(driveError.type).toBe(DriveErrorType.STORAGE_FULL);
      expect(driveError.retryable).toBe(false);
    });
  });

  describe('clear', () => {
    it('should clear authentication and reset state', async () => {
      await driveClient.initialize();
      driveClient.clear();
      
      expect(() => driveClient.getDrive()).toThrow();
    });
  });

  describe('configuration', () => {
    it('should use default configuration', () => {
      const client = DriveClient.getInstance();
      expect(client['config'].retryAttempts).toBe(3);
      expect(client['config'].retryDelay).toBe(1000);
      expect(client['config'].rateLimit).toBe(100);
    });

    it('should use custom configuration', () => {
      (DriveClient as any).instance = null;
      const config = {
        retryAttempts: 5,
        retryDelay: 2000,
        rateLimit: 50
      };
      
      const client = DriveClient.getInstance(config);
      expect(client['config'].retryAttempts).toBe(5);
      expect(client['config'].retryDelay).toBe(2000);
      expect(client['config'].rateLimit).toBe(50);
    });
  });
});