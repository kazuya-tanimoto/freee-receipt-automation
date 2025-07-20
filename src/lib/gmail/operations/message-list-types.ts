/**
 * Gmail Message List Types and Interfaces
 * 
 * Type definitions for Gmail message listing operations
 */

// ============================================================================
// Core Message Types
// ============================================================================

export interface GmailMessage {
  id: string;
  threadId: string;
  snippet: string;
  subject?: string;
  from?: string;
  to?: string;
  date?: Date;
  hasAttachments: boolean;
  isReceiptCandidate: boolean;
  confidenceScore: number;
  labels: string[];
}

export interface MessageListParams {
  query?: string;
  maxResults?: number;
  pageToken?: string;
  includeSpam?: boolean;
  includeTrash?: boolean;
}

export interface MessageListResponse {
  messages: GmailMessage[];
  nextPageToken?: string;
  resultSizeEstimate: number;
}

// ============================================================================
// Receipt Detection Types
// ============================================================================

export interface ReceiptDetectionCriteria {
  senderPatterns: RegExp[];
  subjectPatterns: RegExp[];
  bodyPatterns: RegExp[];
  attachmentRequirements: {
    required: boolean;
    fileTypes: string[];
  };
}

// ============================================================================
// Processing Options
// ============================================================================

export interface BatchProcessingOptions {
  batchSize: number;
  concurrency: number;
  delayMs: number;
}

export interface RetryOptions {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}

// ============================================================================
// Default Configurations
// ============================================================================

export const DEFAULT_RECEIPT_CRITERIA: ReceiptDetectionCriteria = {
  senderPatterns: [
    /no-reply@/i,
    /noreply@/i,
    /receipt@/i,
    /order@/i,
    /billing@/i,
    /invoice@/i,
    /payment@/i,
    /@amazon\./i,
    /@paypal\./i,
    /@stripe\./i,
    /@square\./i,
    /@visa\./i,
    /@mastercard\./i
  ],
  subjectPatterns: [
    /receipt/i,
    /invoice/i,
    /order/i,
    /payment/i,
    /purchase/i,
    /transaction/i,
    /領収書/i,
    /請求書/i,
    /注文/i,
    /決済/i,
    /購入/i
  ],
  bodyPatterns: [
    /total[:\s]*\$\d+/i,
    /amount[:\s]*\$\d+/i,
    /paid[:\s]*\$\d+/i,
    /合計[:\s]*￥\d+/i,
    /金額[:\s]*￥\d+/i,
    /支払[:\s]*￥\d+/i
  ],
  attachmentRequirements: {
    required: false,
    fileTypes: ['pdf', 'png', 'jpg', 'jpeg']
  }
};

export const DEFAULT_BATCH_OPTIONS: BatchProcessingOptions = {
  batchSize: 50,
  concurrency: 3,
  delayMs: 100
};

export const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2
};