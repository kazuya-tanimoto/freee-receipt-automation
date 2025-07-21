/**
 * Gmail Message List Test Setup
 * 
 * Common test fixtures, mocks, and setup for message list tests
 */

import { vi } from 'vitest';
import { GoogleOAuth } from '../../oauth/google-oauth';

// ============================================================================
// Test Mocks
// ============================================================================

export const mockGoogleOAuth = {
  getGmailClient: vi.fn(),
  config: {
    clientId: 'test-client-id',
    clientSecret: 'test-client-secret',
    authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenEndpoint: 'https://oauth2.googleapis.com/token'
  }
} as unknown as GoogleOAuth;

export const mockGmailClient = {
  listMessages: vi.fn(),
  getMessage: vi.fn()
};

// ============================================================================
// Test Fixtures
// ============================================================================

export const sampleMessages = [
  {
    id: 'msg1',
    threadId: 'thread1'
  },
  {
    id: 'msg2', 
    threadId: 'thread2'
  }
];

export const sampleMessageDetails = {
  id: 'msg1',
  threadId: 'thread1',
  snippet: 'Thank you for your purchase at Amazon. Total: $29.99',
  payload: {
    headers: [
      { name: 'Subject', value: 'Your Amazon.com order receipt' },
      { name: 'From', value: 'auto-confirm@amazon.com' },
      { name: 'To', value: 'user@example.com' },
      { name: 'Date', value: 'Wed, 20 Jul 2025 10:00:00 +0000' }
    ],
    parts: [
      {
        filename: 'receipt.pdf',
        mimeType: 'application/pdf',
        body: {
          attachmentId: 'att1',
          size: 12345
        }
      }
    ]
  },
  labelIds: ['INBOX', 'UNREAD']
};

export const nonReceiptMessage = {
  id: 'msg2',
  threadId: 'thread2',
  snippet: 'Hey, how are you doing today?',
  payload: {
    headers: [
      { name: 'Subject', value: 'Casual chat' },
      { name: 'From', value: 'friend@example.com' },
      { name: 'To', value: 'user@example.com' },
      { name: 'Date', value: 'Wed, 20 Jul 2025 11:00:00 +0000' }
    ]
  },
  labelIds: ['INBOX']
};

// ============================================================================
// Receipt Test Messages
// ============================================================================

export const receiptMessageFromSender = {
  ...sampleMessageDetails,
  payload: {
    ...sampleMessageDetails.payload,
    headers: [
      { name: 'From', value: 'no-reply@amazon.com' },
      { name: 'Subject', value: 'Regular message' },
      { name: 'Date', value: 'Wed, 20 Jul 2025 10:00:00 +0000' }
    ]
  }
};

export const receiptMessageFromSubject = {
  ...sampleMessageDetails,
  payload: {
    ...sampleMessageDetails.payload,
    headers: [
      { name: 'From', value: 'regular@example.com' },
      { name: 'Subject', value: 'Your receipt from Store' },
      { name: 'Date', value: 'Wed, 20 Jul 2025 10:00:00 +0000' }
    ]
  }
};

export const receiptMessageFromBody = {
  ...sampleMessageDetails,
  snippet: 'Your purchase total: $99.99 has been processed',
  payload: {
    ...sampleMessageDetails.payload,
    headers: [
      { name: 'From', value: 'regular@example.com' },
      { name: 'Subject', value: 'Transaction completed' },
      { name: 'Date', value: 'Wed, 20 Jul 2025 10:00:00 +0000' }
    ]
  }
};

export const japaneseReceipt = {
  ...sampleMessageDetails,
  snippet: '購入ありがとうございます。合計￥2999',
  payload: {
    ...sampleMessageDetails.payload,
    headers: [
      { name: 'From', value: 'store@example.jp' },
      { name: 'Subject', value: '領収書 - 注文完了' },
      { name: 'Date', value: 'Wed, 20 Jul 2025 10:00:00 +0000' }
    ]
  }
};

// ============================================================================
// Test Utilities
// ============================================================================

export function setupBasicMocks() {
  vi.clearAllMocks();
  mockGoogleOAuth.getGmailClient = vi.fn().mockReturnValue(mockGmailClient);
  mockGmailClient.listMessages.mockResolvedValue({
    messages: sampleMessages,
    resultSizeEstimate: 2
  });
  mockGmailClient.getMessage
    .mockResolvedValueOnce(sampleMessageDetails)
    .mockResolvedValueOnce(nonReceiptMessage);
}

export function setupEmptyMocks() {
  vi.clearAllMocks();
  mockGoogleOAuth.getGmailClient = vi.fn().mockReturnValue(mockGmailClient);
  mockGmailClient.listMessages.mockResolvedValue({
    messages: null,
    resultSizeEstimate: 0
  });
}

export function setupReceiptMocks(receiptMessage: any) {
  vi.clearAllMocks();
  mockGoogleOAuth.getGmailClient = vi.fn().mockReturnValue(mockGmailClient);
  mockGmailClient.listMessages.mockResolvedValue({
    messages: [{ id: 'msg1', threadId: 'thread1' }],
    resultSizeEstimate: 1
  });
  mockGmailClient.getMessage.mockResolvedValue(receiptMessage);
}

export function setupErrorMocks(error: Error) {
  vi.clearAllMocks();
  mockGoogleOAuth.getGmailClient = vi.fn().mockReturnValue(mockGmailClient);
  mockGmailClient.listMessages.mockRejectedValue(error);
}

export const TEST_ACCESS_TOKEN = 'test-access-token';