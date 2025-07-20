/**
 * Gmail Message List Utilities
 * 
 * Helper functions for message processing, receipt detection, and batch operations
 */

import { GmailMessage, ReceiptDetectionCriteria } from './message-list-types';

// ============================================================================
// Message Processing Utilities
// ============================================================================

export function extractHeaders(message: any): Record<string, string> {
  const headers: Record<string, string> = {};
  
  if (message?.payload?.headers) {
    for (const header of message.payload.headers) {
      headers[header.name.toLowerCase()] = header.value;
    }
  }

  return headers;
}

export function checkAttachments(message: any): boolean {
  if (!message?.payload) return false;

  const checkParts = (parts: any[]): boolean => {
    return parts.some(part => {
      if (part.filename && part.filename.length > 0) {
        return true;
      }
      if (part.parts) {
        return checkParts(part.parts);
      }
      return false;
    });
  };

  if (message.payload.parts) {
    return checkParts(message.payload.parts);
  }

  return false;
}

export function processMessage(
  rawMessage: any,
  receiptCriteria: ReceiptDetectionCriteria
): GmailMessage {
  if (!rawMessage) {
    return {
      id: '',
      threadId: '',
      snippet: '',
      subject: '',
      from: '',
      to: '',
      date: undefined,
      hasAttachments: false,
      isReceiptCandidate: false,
      confidenceScore: 0,
      labels: []
    };
  }

  const headers = extractHeaders(rawMessage);
  const hasAttachments = checkAttachments(rawMessage);
  const { isReceiptCandidate, confidenceScore } = detectReceipt(
    rawMessage,
    headers,
    hasAttachments,
    receiptCriteria
  );

  return {
    id: rawMessage.id || '',
    threadId: rawMessage.threadId || '',
    snippet: rawMessage.snippet || '',
    subject: headers.subject || '',
    from: headers.from || '',
    to: headers.to || '',
    date: headers.date ? new Date(headers.date) : undefined,
    hasAttachments,
    isReceiptCandidate,
    confidenceScore,
    labels: rawMessage.labelIds || []
  };
}

// ============================================================================
// Receipt Detection Utilities
// ============================================================================

export function detectReceipt(
  message: any,
  headers: Record<string, string>,
  hasAttachments: boolean,
  criteria: ReceiptDetectionCriteria
): { isReceiptCandidate: boolean; confidenceScore: number } {
  let score = 0;

  // Check sender patterns
  const from = headers.from || '';
  if (criteria.senderPatterns.some(pattern => pattern.test(from))) {
    score += 0.3;
  }

  // Check subject patterns
  const subject = headers.subject || '';
  if (criteria.subjectPatterns.some(pattern => pattern.test(subject))) {
    score += 0.4;
  }

  // Check body patterns
  const snippet = message.snippet || '';
  if (criteria.bodyPatterns.some(pattern => pattern.test(snippet))) {
    score += 0.2;
  }

  // Check attachment requirements
  if (criteria.attachmentRequirements.required) {
    if (hasAttachments) {
      score += 0.1;
    } else {
      score -= 0.2;
    }
  } else if (hasAttachments) {
    score += 0.05;
  }

  return {
    isReceiptCandidate: score > 0.3,
    confidenceScore: Math.min(score, 1.0)
  };
}

// ============================================================================
// Batch Processing Utilities
// ============================================================================

export function createBatches<T>(items: T[], batchSize: number): T[][] {
  const batches: T[][] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize));
  }
  return batches;
}

export async function processConcurrent<T>(
  promises: Promise<T>[],
  concurrency: number
): Promise<T[]> {
  const results: T[] = [];
  
  for (let i = 0; i < promises.length; i += concurrency) {
    const batch = promises.slice(i, i + concurrency);
    const batchResults = await Promise.allSettled(batch);
    
    for (const result of batchResults) {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        console.error('Concurrent processing error:', result.reason);
        results.push(null as any);
      }
    }
  }
  
  return results;
}

// ============================================================================
// Query Building Utilities
// ============================================================================

export function buildQuery(params: {
  query?: string;
  includeSpam?: boolean;
  includeTrash?: boolean;
}): string {
  const queryParts: string[] = [];

  if (params.query) {
    queryParts.push(params.query);
  }

  if (!params.includeSpam) {
    queryParts.push('-in:spam');
  }

  if (!params.includeTrash) {
    queryParts.push('-in:trash');
  }

  return queryParts.join(' ');
}

export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}/${month}/${day}`;
}

// ============================================================================
// Async Utilities
// ============================================================================

export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}