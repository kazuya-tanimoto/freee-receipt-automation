/**
 * Gmail Message List Search Tests
 * 
 * Tests for search and filtering functionality
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { MessageListService } from './message-list-service';
import {
  mockGoogleOAuthProvider,
  mockGmailClient,
  setupBasicMocks,
  TEST_ACCESS_TOKEN
} from './message-list-test-setup';

// ============================================================================
// Test Suite
// ============================================================================

describe('MessageListService - Search Functionality', () => {
  let service: MessageListService;

  beforeEach(() => {
    service = new MessageListService(mockGoogleOAuthProvider);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ============================================================================
  // Search and Filter Tests
  // ============================================================================

  describe('searchMessages', () => {
    beforeEach(() => {
      setupBasicMocks();
    });

    it('should search with custom query', async () => {
      const searchQuery = 'from:amazon.com subject:receipt';
      
      await service.searchMessages(TEST_ACCESS_TOKEN, searchQuery);
      
      expect(mockGmailClient.listMessages).toHaveBeenCalledWith({
        q: 'from:amazon.com subject:receipt -in:spam -in:trash',
        maxResults: 50,
        pageToken: undefined
      });
    });

    it('should combine search query with filters', async () => {
      const searchQuery = 'has:attachment';
      const params = { maxResults: 25, includeSpam: true };
      
      await service.searchMessages(TEST_ACCESS_TOKEN, searchQuery, params);
      
      expect(mockGmailClient.listMessages).toHaveBeenCalledWith({
        q: 'has:attachment -in:trash',
        maxResults: 25,
        pageToken: undefined
      });
    });
  });

  describe('getMessagesInDateRange', () => {
    beforeEach(() => {
      setupBasicMocks();
    });

    it('should format date range query correctly', async () => {
      const startDate = new Date('2025-07-01');
      const endDate = new Date('2025-07-31');
      
      await service.getMessagesInDateRange(TEST_ACCESS_TOKEN, startDate, endDate);
      
      expect(mockGmailClient.listMessages).toHaveBeenCalledWith({
        q: 'after:2025/07/01 before:2025/07/31 -in:spam -in:trash',
        maxResults: 50,
        pageToken: undefined
      });
    });

    it('should handle single digit dates correctly', async () => {
      const startDate = new Date('2025-01-05');
      const endDate = new Date('2025-01-09');
      
      await service.getMessagesInDateRange(TEST_ACCESS_TOKEN, startDate, endDate);
      
      expect(mockGmailClient.listMessages).toHaveBeenCalledWith({
        q: 'after:2025/01/05 before:2025/01/09 -in:spam -in:trash',
        maxResults: 50,
        pageToken: undefined
      });
    });
  });

  describe('getRecentReceipts', () => {
    beforeEach(() => {
      setupBasicMocks();
    });

    it('should get recent receipts with default 7 days', async () => {
      const mockDate = new Date('2025-07-20T10:00:00.000Z');
      vi.setSystemTime(mockDate);
      
      const result = await service.getRecentReceipts(TEST_ACCESS_TOKEN);
      
      expect(mockGmailClient.listMessages).toHaveBeenCalledWith({
        q: 'after:2025/07/13 before:2025/07/20 -in:spam -in:trash',
        maxResults: 100,
        pageToken: undefined
      });
    });

    it('should accept custom days back parameter', async () => {
      const mockDate = new Date('2025-07-20T10:00:00.000Z');
      vi.setSystemTime(mockDate);
      
      mockGmailClient.listMessages.mockResolvedValue({
        messages: [],
        resultSizeEstimate: 0
      });
      
      await service.getRecentReceipts(TEST_ACCESS_TOKEN, 30, 50);
      
      expect(mockGmailClient.listMessages).toHaveBeenCalledWith({
        q: 'after:2025/06/20 before:2025/07/20 -in:spam -in:trash',
        maxResults: 50,
        pageToken: undefined
      });
    });
  });
});