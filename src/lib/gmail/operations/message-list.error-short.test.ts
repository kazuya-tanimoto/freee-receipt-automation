/**
 * Gmail Message List Error Handling Tests
 * 
 * Tests for error handling and retry mechanisms
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { MessageListService } from './message-list-service';
import { OAuthException } from '../../oauth/types';
import {
  mockGoogleOAuth,
  mockGmailClient,
  sampleMessages,
  sampleMessageDetails,
  nonReceiptMessage,
  setupErrorMocks,
  TEST_ACCESS_TOKEN
} from './message-list-test-setup';

// ============================================================================
// Test Suite
// ============================================================================

describe('MessageListService - Error Handling', () => {
  let service: MessageListService;

  beforeEach(() => {
    service = new MessageListService(mockGoogleOAuth);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ============================================================================
  // Error Handling Tests
  // ============================================================================

  describe('Error Handling', () => {
    it('should handle authentication errors immediately', async () => {
      const authError = new OAuthException('token_expired', 'Token has expired');
      setupErrorMocks(authError);
      
      await expect(service.listMessages(TEST_ACCESS_TOKEN))
        .rejects.toThrow(OAuthException);
      
      expect(mockGmailClient.listMessages).toHaveBeenCalledTimes(1);
    });

    it('should retry on transient errors', async () => {
      const networkError = new Error('Network error');
      mockGoogleOAuth.getGmailClient = vi.fn().mockReturnValue(mockGmailClient);
      mockGmailClient.listMessages
        .mockRejectedValueOnce(networkError)
        .mockRejectedValueOnce(networkError)
        .mockResolvedValueOnce({
          messages: sampleMessages,
          resultSizeEstimate: 2
        });
      
      mockGmailClient.getMessage
        .mockResolvedValueOnce(sampleMessageDetails)
        .mockResolvedValueOnce(nonReceiptMessage);
      
      const result = await service.listMessages(TEST_ACCESS_TOKEN);
      
      expect(result.messages).toHaveLength(2);
      expect(mockGmailClient.listMessages).toHaveBeenCalledTimes(3);
    });

    it('should fail after max retries', async () => {
      const persistentError = new Error('Persistent error');
      setupErrorMocks(persistentError);
      
      await expect(service.listMessages(TEST_ACCESS_TOKEN))
        .rejects.toThrow('Persistent error');
      
      expect(mockGmailClient.listMessages).toHaveBeenCalledTimes(4); // 1 + 3 retries
    }, 10000); // 10 second timeout

    it('should handle individual message fetch failures gracefully', async () => {
      mockGoogleOAuth.getGmailClient = vi.fn().mockReturnValue(mockGmailClient);
      mockGmailClient.listMessages.mockResolvedValue({
        messages: [
          { id: 'msg1', threadId: 'thread1' },
          { id: 'msg2', threadId: 'thread2' },
          { id: 'msg3', threadId: 'thread3' }
        ],
        resultSizeEstimate: 3
      });
      
      mockGmailClient.getMessage
        .mockResolvedValueOnce(sampleMessageDetails)
        .mockRejectedValueOnce(new Error('Message not found'))
        .mockResolvedValueOnce(nonReceiptMessage);
      
      const result = await service.listMessages(TEST_ACCESS_TOKEN);
      
      expect(result.messages).toHaveLength(3); // All messages (errors handled gracefully)
      expect(result.resultSizeEstimate).toBe(3); // Original estimate preserved
    }, 10000); // 10 second timeout
  });

  // ============================================================================
  // Custom Configuration Tests
  // ============================================================================

  describe('Custom Configuration', () => {
    it('should use custom retry options', async () => {
      const customService = new MessageListService(mockGoogleOAuth, {
        retryOptions: {
          maxRetries: 1,
          initialDelayMs: 100,
          maxDelayMs: 1000,
          backoffMultiplier: 1.5
        }
      });

      const persistentError = new Error('Persistent error');
      mockGoogleOAuth.getGmailClient = vi.fn().mockReturnValue(mockGmailClient);
      mockGmailClient.listMessages.mockRejectedValue(persistentError);
      
      await expect(customService.listMessages(TEST_ACCESS_TOKEN))
        .rejects.toThrow('Persistent error');
      
      expect(mockGmailClient.listMessages).toHaveBeenCalledTimes(2); // 1 + 1 retry
    });
  });
});