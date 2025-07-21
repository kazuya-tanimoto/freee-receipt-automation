/**
 * Gmail Message List Receipt Detection Tests
 * 
 * Tests for receipt detection functionality and filtering
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { MessageListService } from './message-list-service';
import {
  mockGoogleOAuth,
  mockGmailClient,
  receiptMessageFromSender,
  receiptMessageFromSubject,
  receiptMessageFromBody,
  japaneseReceipt,
  nonReceiptMessage,
  setupReceiptMocks,
  setupBasicMocks,
  TEST_ACCESS_TOKEN
} from './message-list-test-setup';

// ============================================================================
// Test Suite
// ============================================================================

describe('MessageListService - Receipt Detection', () => {
  let service: MessageListService;

  beforeEach(() => {
    service = new MessageListService(mockGoogleOAuth);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ============================================================================
  // Receipt Detection Tests
  // ============================================================================

  describe('Receipt Detection', () => {
    it('should detect receipt from sender patterns', async () => {
      setupReceiptMocks(receiptMessageFromSender);
      
      const result = await service.listMessages(TEST_ACCESS_TOKEN);
      
      expect(result.messages[0].isReceiptCandidate).toBe(true);
      expect(result.messages[0].confidenceScore).toBeGreaterThan(0.3);
    });

    it('should detect receipt from subject patterns', async () => {
      setupReceiptMocks(receiptMessageFromSubject);
      
      const result = await service.listMessages(TEST_ACCESS_TOKEN);
      
      expect(result.messages[0].isReceiptCandidate).toBe(true);
      expect(result.messages[0].confidenceScore).toBeGreaterThan(0.3);
    });

    it('should detect receipt from body patterns', async () => {
      setupReceiptMocks(receiptMessageFromBody);
      
      const result = await service.listMessages(TEST_ACCESS_TOKEN);
      
      expect(result.messages[0].isReceiptCandidate).toBe(true);
      expect(result.messages[0].confidenceScore).toBeGreaterThan(0.1);
    });

    it('should handle Japanese receipt patterns', async () => {
      setupReceiptMocks(japaneseReceipt);
      
      const result = await service.listMessages(TEST_ACCESS_TOKEN);
      
      expect(result.messages[0].isReceiptCandidate).toBe(true);
      expect(result.messages[0].confidenceScore).toBeGreaterThan(0.5);
    });

    it('should not detect receipt in regular messages', async () => {
      setupReceiptMocks(nonReceiptMessage);
      
      const result = await service.listMessages(TEST_ACCESS_TOKEN);
      
      expect(result.messages[0].isReceiptCandidate).toBe(false);
      expect(result.messages[0].confidenceScore).toBeLessThanOrEqual(0.3);
    });

    it('should validate confidence scores are within bounds', async () => {
      setupReceiptMocks(japaneseReceipt);
      
      const result = await service.listMessages(TEST_ACCESS_TOKEN);
      
      expect(result.messages[0].confidenceScore).toBeGreaterThanOrEqual(0);
      expect(result.messages[0].confidenceScore).toBeLessThanOrEqual(1);
    });
  });

  // ============================================================================
  // Filtering Tests
  // ============================================================================

  describe('filterReceiptCandidates', () => {
    beforeEach(() => {
      // セットアップ：非レシートメッセージのみ
      setupReceiptMocks(nonReceiptMessage);
    });

    it('should filter only receipt candidates', async () => {
      const result = await service.filterReceiptCandidates(TEST_ACCESS_TOKEN);
      
      expect(result.messages).toHaveLength(0);
    });

    it('should preserve pagination info', async () => {
      vi.clearAllMocks();
      mockGoogleOAuth.getGmailClient = vi.fn().mockReturnValue(mockGmailClient);
      mockGmailClient.listMessages.mockResolvedValue({
        messages: [{ id: 'msg1', threadId: 'thread1' }],
        nextPageToken: 'next-token',
        resultSizeEstimate: 100
      });
      mockGmailClient.getMessage.mockResolvedValue(japaneseReceipt);
      
      const result = await service.filterReceiptCandidates(TEST_ACCESS_TOKEN);
      
      expect(result.nextPageToken).toBe('next-token');
      expect(result.resultSizeEstimate).toBe(100);
    });

    it('should return empty array when no receipts found', async () => {
      // Already set up in beforeEach with non-receipt message
      
      const result = await service.filterReceiptCandidates(TEST_ACCESS_TOKEN);
      
      expect(result.messages).toHaveLength(0);
    });
  });

  // ============================================================================
  // Custom Criteria Tests
  // ============================================================================

  describe('Custom Receipt Criteria', () => {
    it('should use custom sender patterns', async () => {
      const customService = new MessageListService(mockGoogleOAuth, {
        receiptCriteria: {
          senderPatterns: [/test-sender@/i]
        }
      });

      const customReceiptMessage = {
        ...receiptMessageFromSender,
        payload: {
          ...receiptMessageFromSender.payload,
          headers: [
            { name: 'From', value: 'test-sender@custom.com' },
            { name: 'Subject', value: 'Regular message' }
          ]
        }
      };

      setupReceiptMocks(customReceiptMessage);
      
      const result = await customService.listMessages(TEST_ACCESS_TOKEN);
      
      expect(result.messages[0].isReceiptCandidate).toBe(true);
    });

    it('should use custom subject patterns', async () => {
      const customService = new MessageListService(mockGoogleOAuth, {
        receiptCriteria: {
          subjectPatterns: [/custom-receipt/i]
        }
      });

      const customReceiptMessage = {
        ...receiptMessageFromSubject,
        payload: {
          ...receiptMessageFromSubject.payload,
          headers: [
            { name: 'From', value: 'regular@example.com' },
            { name: 'Subject', value: 'Your custom-receipt from store' }
          ]
        }
      };

      setupReceiptMocks(customReceiptMessage);
      
      const result = await customService.listMessages(TEST_ACCESS_TOKEN);
      
      expect(result.messages[0].isReceiptCandidate).toBe(true);
    });

    it('should use custom body patterns', async () => {
      const customService = new MessageListService(mockGoogleOAuth, {
        receiptCriteria: {
          bodyPatterns: [/custom-total[:\s]*\$\d+/i]
        }
      });

      const customReceiptMessage = {
        ...receiptMessageFromBody,
        snippet: 'Your custom-total: $99.99 has been processed'
      };

      setupReceiptMocks(customReceiptMessage);
      
      const result = await customService.listMessages(TEST_ACCESS_TOKEN);
      
      expect(result.messages[0].isReceiptCandidate).toBe(true);
    });
  });

  // ============================================================================
  // Edge Cases
  // ============================================================================

  describe('Receipt Detection Edge Cases', () => {
    it('should handle messages with multiple receipt indicators', async () => {
      const multiIndicatorMessage = {
        ...japaneseReceipt,
        payload: {
          ...japaneseReceipt.payload,
          headers: [
            { name: 'From', value: 'no-reply@amazon.com' },
            { name: 'Subject', value: 'Receipt for your order' }
          ]
        }
      };

      setupReceiptMocks(multiIndicatorMessage);
      
      const result = await service.listMessages(TEST_ACCESS_TOKEN);
      
      expect(result.messages[0].isReceiptCandidate).toBe(true);
      expect(result.messages[0].confidenceScore).toBeGreaterThan(0.7);
    });
  });
});