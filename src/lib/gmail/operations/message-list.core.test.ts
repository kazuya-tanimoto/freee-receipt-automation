/**
 * Gmail Message List Core Tests
 * 
 * Tests for basic message listing functionality
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { MessageListService } from './message-list-service';
import {
  mockGoogleOAuthProvider,
  mockGmailClient,
  setupBasicMocks,
  setupEmptyMocks,
  TEST_ACCESS_TOKEN
} from './message-list-test-setup';

// ============================================================================
// Test Suite
// ============================================================================

describe('MessageListService - Core Functionality', () => {
  let service: MessageListService;

  beforeEach(() => {
    service = new MessageListService(mockGoogleOAuthProvider);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ============================================================================
  // Constructor Tests
  // ============================================================================

  describe('Constructor', () => {
    it('should initialize with default options', () => {
      const defaultService = new MessageListService(mockGoogleOAuthProvider);
      expect(defaultService).toBeInstanceOf(MessageListService);
    });

    it('should accept custom receipt criteria', () => {
      const customCriteria = {
        senderPatterns: [/custom@/i],
        subjectPatterns: [/custom/i]
      };
      
      const customService = new MessageListService(mockGoogleOAuthProvider, {
        receiptCriteria: customCriteria
      });
      
      expect(customService).toBeInstanceOf(MessageListService);
    });

    it('should accept custom batch options', () => {
      const customBatchOptions = {
        batchSize: 25,
        concurrency: 2,
        delayMs: 200
      };
      
      const customService = new MessageListService(mockGoogleOAuthProvider, {
        batchOptions: customBatchOptions
      });
      
      expect(customService).toBeInstanceOf(MessageListService);
    });
  });

  // ============================================================================
  // Basic Message Listing Tests
  // ============================================================================

  describe('listMessages', () => {
    beforeEach(() => {
      setupBasicMocks();
    });

    it('should list messages successfully', async () => {
      const result = await service.listMessages(TEST_ACCESS_TOKEN);
      
      expect(result.messages).toHaveLength(2);
      expect(result.resultSizeEstimate).toBe(2);
      expect(mockGmailClient.listMessages).toHaveBeenCalledWith({
        q: '-in:spam -in:trash',
        maxResults: 50,
        pageToken: undefined
      });
    });

    it('should handle empty message list', async () => {
      setupEmptyMocks();
      
      const result = await service.listMessages(TEST_ACCESS_TOKEN);
      
      expect(result.messages).toHaveLength(0);
      expect(result.resultSizeEstimate).toBe(0);
    });

    it('should apply custom query parameters', async () => {
      const params = {
        query: 'from:amazon.com',
        maxResults: 25,
        pageToken: 'next-page-token',
        includeSpam: true,
        includeTrash: true
      };
      
      await service.listMessages(TEST_ACCESS_TOKEN, params);
      
      expect(mockGmailClient.listMessages).toHaveBeenCalledWith({
        q: 'from:amazon.com',
        maxResults: 25,
        pageToken: 'next-page-token'
      });
    });

    it('should exclude spam and trash by default', async () => {
      await service.listMessages(TEST_ACCESS_TOKEN);
      
      expect(mockGmailClient.listMessages).toHaveBeenCalledWith({
        q: '-in:spam -in:trash',
        maxResults: 50,
        pageToken: undefined
      });
    });

    it('should include spam when requested', async () => {
      await service.listMessages(TEST_ACCESS_TOKEN, { includeSpam: true });
      
      expect(mockGmailClient.listMessages).toHaveBeenCalledWith({
        q: '-in:trash',
        maxResults: 50,
        pageToken: undefined
      });
    });

    it('should handle pagination with nextPageToken', async () => {
      mockGmailClient.listMessages.mockResolvedValue({
        messages: [],
        nextPageToken: 'next-token',
        resultSizeEstimate: 100
      });
      
      const result = await service.listMessages(TEST_ACCESS_TOKEN);
      
      expect(result.nextPageToken).toBe('next-token');
    });
  });

  // ============================================================================
  // Message Processing Tests
  // ============================================================================

  describe('Message Processing', () => {
    beforeEach(() => {
      setupBasicMocks();
    });

    it('should extract message headers correctly', async () => {
      const result = await service.listMessages(TEST_ACCESS_TOKEN);
      const message = result.messages[0];
      
      expect(message.subject).toBe('Your Amazon.com order receipt');
      expect(message.from).toBe('auto-confirm@amazon.com');
      expect(message.to).toBe('user@example.com');
      expect(message.date).toBeInstanceOf(Date);
    });

    it('should detect attachments correctly', async () => {
      const result = await service.listMessages(TEST_ACCESS_TOKEN);
      
      expect(result.messages[0].hasAttachments).toBe(true);
    });

    it('should preserve all label IDs', async () => {
      const result = await service.listMessages(TEST_ACCESS_TOKEN);
      
      expect(result.messages[0].labels).toEqual(['INBOX', 'UNREAD']);
    });
  });
});