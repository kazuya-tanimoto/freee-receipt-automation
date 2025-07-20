/**
 * Gmail Message List Batch Processing Tests
 * 
 * Tests for batch processing functionality
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { MessageListService } from './message-list-service';
import {
  mockGoogleOAuthProvider,
  mockGmailClient,
  nonReceiptMessage,
  TEST_ACCESS_TOKEN
} from './message-list-test-setup';

// ============================================================================
// Test Suite
// ============================================================================

describe('MessageListService - Batch Processing', () => {
  let service: MessageListService;

  beforeEach(() => {
    service = new MessageListService(mockGoogleOAuthProvider);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ============================================================================
  // Batch Processing Tests
  // ============================================================================

  describe('Batch Processing', () => {
    it('should process messages in batches', async () => {
      const largeBatch = Array.from({ length: 50 }, (_, i) => ({
        id: `msg${i}`,
        threadId: `thread${i}`
      }));
      
      mockGoogleOAuthProvider.getGmailApiClient = vi.fn().mockReturnValue(mockGmailClient);
      mockGmailClient.listMessages.mockResolvedValue({
        messages: largeBatch,
        resultSizeEstimate: 50
      });
      
      mockGmailClient.getMessage.mockResolvedValue(nonReceiptMessage);
      
      const customService = new MessageListService(mockGoogleOAuthProvider, {
        batchOptions: { batchSize: 25, concurrency: 2, delayMs: 1 }
      });
      
      const result = await customService.listMessages(TEST_ACCESS_TOKEN);
      
      expect(result.messages).toHaveLength(50);
      expect(mockGmailClient.getMessage).toHaveBeenCalledTimes(50);
    });

    it('should respect batch size limits', async () => {
      const customService = new MessageListService(mockGoogleOAuthProvider, {
        batchOptions: { batchSize: 10, concurrency: 1, delayMs: 1 }
      });
      
      const messages = Array.from({ length: 10 }, (_, i) => ({
        id: `msg${i}`,
        threadId: `thread${i}`
      }));
      
      mockGoogleOAuthProvider.getGmailApiClient = vi.fn().mockReturnValue(mockGmailClient);
      mockGmailClient.listMessages.mockResolvedValue({
        messages,
        resultSizeEstimate: 10
      });
      
      mockGmailClient.getMessage.mockResolvedValue(nonReceiptMessage);
      
      await customService.listMessages(TEST_ACCESS_TOKEN);
      
      expect(mockGmailClient.getMessage).toHaveBeenCalledTimes(10);
    });

    it('should handle concurrent processing errors', async () => {
      const messages = Array.from({ length: 5 }, (_, i) => ({
        id: `msg${i}`,
        threadId: `thread${i}`
      }));
      
      mockGoogleOAuthProvider.getGmailApiClient = vi.fn().mockReturnValue(mockGmailClient);
      mockGmailClient.listMessages.mockResolvedValue({
        messages,
        resultSizeEstimate: 5
      });
      
      // Simulate some failures in concurrent processing
      mockGmailClient.getMessage
        .mockResolvedValueOnce(nonReceiptMessage)
        .mockRejectedValueOnce(new Error('Concurrent error 1'))
        .mockResolvedValueOnce(nonReceiptMessage)
        .mockRejectedValueOnce(new Error('Concurrent error 2'))
        .mockResolvedValueOnce(nonReceiptMessage);
      
      const result = await service.listMessages(TEST_ACCESS_TOKEN);
      
      expect(result.messages).toHaveLength(5); // All messages including failed ones (errors handled gracefully)
    }, 10000); // 10 second timeout

    it('should handle null or undefined message details', async () => {
      mockGoogleOAuthProvider.getGmailApiClient = vi.fn().mockReturnValue(mockGmailClient);
      mockGmailClient.listMessages.mockResolvedValue({
        messages: [{ id: 'msg1', threadId: 'thread1' }],
        resultSizeEstimate: 1
      });
      mockGmailClient.getMessage.mockResolvedValue(null);
      
      const result = await service.listMessages(TEST_ACCESS_TOKEN);
      
      expect(result.messages).toHaveLength(0);
    });

    it('should handle malformed message data', async () => {
      const malformedMessage = {
        id: 'msg1',
        threadId: 'thread1',
        // Missing required fields
      };
      
      mockGoogleOAuthProvider.getGmailApiClient = vi.fn().mockReturnValue(mockGmailClient);
      mockGmailClient.listMessages.mockResolvedValue({
        messages: [{ id: 'msg1', threadId: 'thread1' }],
        resultSizeEstimate: 1
      });
      mockGmailClient.getMessage.mockResolvedValue(malformedMessage);
      
      const result = await service.listMessages(TEST_ACCESS_TOKEN);
      const message = result.messages[0];
      
      expect(message.id).toBe('msg1');
      expect(message.snippet).toBe('');
      expect(message.hasAttachments).toBe(false);
    });
  });
});