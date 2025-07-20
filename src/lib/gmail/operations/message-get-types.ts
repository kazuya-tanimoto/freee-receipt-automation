/**
 * Gmail Message Get Types and Interfaces
 * 
 * Type definitions for Gmail message detail operations
 */

// ============================================================================
// Core Message Detail Types
// ============================================================================

export interface MessageDetails {
  id: string;
  threadId: string;
  snippet: string;
  subject: string;
  from: string;
  to: string;
  date: Date;
  body: {
    text?: string;
    html?: string;
  };
  attachments: MessageAttachment[];
  headers: Record<string, string>;
  labels: string[];
  isReceiptCandidate: boolean;
  receiptData?: ReceiptData;
}

export interface MessageAttachment {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  data?: string; // Base64 encoded data
  isReceiptCandidate: boolean;
}

export interface ReceiptData {
  merchant?: string;
  total?: number;
  currency?: string;
  date?: Date;
  items?: ReceiptItem[];
  confidence: number;
  extractionMethod: 'email' | 'attachment' | 'hybrid';
}

export interface ReceiptItem {
  name: string;
  quantity?: number;
  price?: number;
  total?: number;
}

// ============================================================================
// Processing Options
// ============================================================================

export interface MessageProcessingOptions {
  includeAttachments: boolean;
  extractReceiptData: boolean;
  maxAttachmentSize: number; // in bytes
  supportedMimeTypes: string[];
}

export interface AttachmentProcessingOptions {
  downloadData: boolean;
  maxSize: number;
  allowedTypes: string[];
}

// ============================================================================
// Default Configurations
// ============================================================================

export const DEFAULT_PROCESSING_OPTIONS: MessageProcessingOptions = {
  includeAttachments: true,
  extractReceiptData: true,
  maxAttachmentSize: 10 * 1024 * 1024, // 10MB
  supportedMimeTypes: [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'application/pdf',
    'text/plain',
    'text/html'
  ]
};

export const RECEIPT_EXTRACTION_PATTERNS = {
  amount: [
    /total[:\s]*\$?(\d+\.?\d*)/i,
    /amount[:\s]*\$?(\d+\.?\d*)/i,
    /paid[:\s]*\$?(\d+\.?\d*)/i,
    /sum[:\s]*\$?(\d+\.?\d*)/i,
    /合計[:\s]*￥?(\d+\.?\d*)/i,
    /金額[:\s]*￥?(\d+\.?\d*)/i,
    /支払[:\s]*￥?(\d+\.?\d*)/i
  ],
  merchant: [
    /from[:\s]+([^<\n\r]+)/i,
    /merchant[:\s]+([^<\n\r]+)/i,
    /store[:\s]+([^<\n\r]+)/i,
    /shop[:\s]+([^<\n\r]+)/i
  ],
  currency: [
    /\$(\d+\.?\d*)/g,
    /￥(\d+\.?\d*)/g,
    /USD[:\s]*(\d+\.?\d*)/i,
    /JPY[:\s]*(\d+\.?\d*)/i
  ],
  date: [
    /(\d{4}[-/]\d{2}[-/]\d{2})/g,
    /(\d{2}[-/]\d{2}[-/]\d{4})/g,
    /(\d{1,2}\/\d{1,2}\/\d{4})/g
  ]
};