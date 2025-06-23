/**
 * Gmail API Integration Types
 * 
 * Comprehensive type definitions for Gmail API integration including
 * client configuration, message processing, error handling, and monitoring.
 */

import { gmail_v1 } from 'googleapis';
import { BusinessCategory } from '../freee/types';

// ============================================================================
// Core Gmail Types
// ============================================================================

export type Schema$Message = gmail_v1.Schema$Message;

export interface EmailAddress {
  email: string;
  name?: string;
}

export interface ProcessedEmail {
  messageId: string;
  threadId: string;
  from: string | EmailAddress;
  to: string;
  subject: string;
  body?: string;
  date: Date;
  size: number;
  labels: string[];
  snippet: string;
  attachments?: AttachmentInfo[];
}

export interface EmailMetadata {
  messageId: string;
  threadId: string;
  from: string;
  to: string;
  subject: string;
  date: Date;
  size: number;
  labels: string[];
  snippet: string;
  labelIds: string[];
  historyId: string;
  internalDate: string;
  sizeEstimate: number;
  headers: Record<string, string>;
}

export interface AttachmentInfo {
  attachmentId: string;
  filename: string;
  mimeType: string;
  size: number;
}

export interface AttachmentData {
  attachmentId: string;
  filename: string;
  mimeType: string;
  size: number;
  data: string;
  messageId: string;
}

// ============================================================================
// Gmail Client Configuration
// ============================================================================

export interface GmailClientConfig {
  defaultMaxResults?: number;
  timeoutMs?: number;
  retryAttempts?: number;
  retryDelayMs?: number;
  rateLimitBuffer?: number;
}

export interface MessageListOptions {
  maxResults?: number;
  pageToken?: string;
  query?: string;
  hasAttachment?: boolean;
  from?: string;
  subject?: string;
  after?: Date;
  before?: Date;
}

export interface MessageListResult {
  messages: Array<{ id: string; threadId: string }>;
  nextPageToken?: string;
}

export interface AttachmentDownloadOptions {
  userId: string;
  messageId: string;
  attachmentId: string;
  filename?: string;
  mimeType?: string;
}

// ============================================================================
// Error Handling Types
// ============================================================================

export type GmailErrorCode = 
  | 'AUTHENTICATION_FAILED'
  | 'QUOTA_EXCEEDED'
  | 'RATE_LIMITED'
  | 'NOT_FOUND'
  | 'API_ERROR'
  | 'TIMEOUT'
  | 'INVALID_TOKEN'
  | 'INSUFFICIENT_SCOPE'
  | 'UNKNOWN';

export class GmailError extends Error {
  public readonly code: GmailErrorCode;
  public readonly originalError?: Error;

  constructor(code: GmailErrorCode, message: string, originalError?: Error) {
    super(message);
    this.name = 'GmailError';
    this.code = code;
    this.originalError = originalError;
  }
}

export interface BackoffConfig {
  initialDelay: number;
  maxDelay: number;
  multiplier: number;
  jitter: number;
}

// ============================================================================
// Monitoring and Metrics Types
// ============================================================================

export interface OperationMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  totalQuotaUsed: number;
  averageResponseTime: number;
  lastError: GmailError | null;
  operationCounts: {
    messages_list: number;
    messages_get: number;
    attachments_get: number;
  };
}

export interface QuotaInfo {
  used: number;
  total: number;
  percentage: number;
  resetTime: Date;
}

export interface GmailApiMetrics {
  operation: string;
  success: boolean;
  quotaUsed: number;
  errorCode?: string;
  errorMessage?: string;
  rateLimitRemaining?: number;
  timestamp: Date;
}

// ============================================================================
// Receipt Detection Types
// ============================================================================

export interface ReceiptDetectionConfig {
  minConfidenceScore?: number;
  enableAttachmentAnalysis?: boolean;
  enableContentAnalysis?: boolean;
  attachmentSizeLimit?: number;
}

export interface ReceiptDetectionResult {
  isReceipt: boolean;
  confidence: number;
  category: BusinessCategory;
  indicators: ReceiptIndicator[];
  attachments: ValidatedAttachment[];
  metadata: ReceiptMetadata;
}

export interface ReceiptIndicator {
  type: 'subject' | 'sender' | 'content' | 'attachment';
  description: string;
  confidence: number;
  weight: number;
}

export interface ValidatedAttachment {
  attachmentId: string;
  filename: string;
  mimeType: string;
  size: number;
  isReceiptCandidate: boolean;
  confidence: number;
}

export interface ReceiptMetadata {
  estimatedAmount?: number;
  currency?: string;
  vendor?: string;
  date?: Date;
  category?: BusinessCategory;
}

// ============================================================================
// Email Classification Types
// ============================================================================

export interface ClassificationInput {
  from: string;
  subject: string;
  body?: string;
  snippet?: string;
}

export interface ClassificationResult {
  category: BusinessCategory;
  confidence: number;
  reasoning: string[];
  alternativeCategories: Array<{
    category: BusinessCategory;
    confidence: number;
  }>;
}

// ============================================================================
// Constants
// ============================================================================

export const GMAIL_SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly'
] as const;

export const DEFAULT_MAX_RESULTS = 100;
export const QUOTA_UNITS_PER_REQUEST = 5;
export const MAX_ATTACHMENT_SIZE = 25 * 1024 * 1024; // 25MB
export const DEFAULT_TIMEOUT_MS = 30000; // 30 seconds

export const RECEIPT_KEYWORDS = [
  'receipt', 'invoice', 'payment', 'purchase', 'order', 'transaction',
  'billing', 'charge', 'expense', 'refund', 'confirmation'
] as const;

export const BUSINESS_VENDORS = [
  'amazon', 'stripe', 'paypal', 'square', 'uber', 'lyft', 'github',
  'microsoft', 'google', 'adobe', 'slack', 'zoom', 'dropbox'
] as const;