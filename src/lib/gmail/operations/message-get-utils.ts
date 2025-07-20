/**
 * Gmail Message Get Utilities
 * 
 * Helper functions for message processing, attachment handling, and receipt extraction
 */

import { GoogleOAuthProvider } from '../../oauth/providers/google-oauth-provider';
import {
  MessageDetails,
  MessageAttachment,
  ReceiptData,
  MessageProcessingOptions,
  RECEIPT_EXTRACTION_PATTERNS
} from './message-get-types';

// ============================================================================
// Message Processing Utilities
// ============================================================================

export function extractHeaders(message: any): Record<string, string> {
  const headers: Record<string, string> = {};
  
  if (message.payload?.headers) {
    for (const header of message.payload.headers) {
      const name = header.name.toLowerCase();
      headers[name] = header.value;
    }
  }

  return headers;
}

export function extractBody(message: any): { text?: string; html?: string } {
  const body: { text?: string; html?: string } = {};

  const extractFromPart = (part: any): void => {
    if (part.mimeType === 'text/plain' && part.body?.data) {
      body.text = decodeBase64(part.body.data);
    } else if (part.mimeType === 'text/html' && part.body?.data) {
      body.html = decodeBase64(part.body.data);
    } else if (part.parts) {
      part.parts.forEach(extractFromPart);
    }
  };

  if (message.payload) {
    if (message.payload.body?.data) {
      // Single part message
      if (message.payload.mimeType === 'text/plain') {
        body.text = decodeBase64(message.payload.body.data);
      } else if (message.payload.mimeType === 'text/html') {
        body.html = decodeBase64(message.payload.body.data);
      }
    } else if (message.payload.parts) {
      // Multi-part message
      message.payload.parts.forEach(extractFromPart);
    }
  }

  return body;
}

export function decodeBase64(data: string): string {
  try {
    // Gmail uses URL-safe base64 encoding
    const normalizedData = data.replace(/-/g, '+').replace(/_/g, '/');
    return atob(normalizedData);
  } catch (error) {
    console.error('Failed to decode base64 data:', error);
    return '';
  }
}

// ============================================================================
// Attachment Processing Utilities
// ============================================================================

export async function processAttachments(
  accessToken: string,
  messageId: string,
  message: any,
  provider: GoogleOAuthProvider,
  options: MessageProcessingOptions
): Promise<MessageAttachment[]> {
  const attachments: MessageAttachment[] = [];

  const processAttachmentPart = async (part: any): Promise<void> => {
    if (part.filename && part.filename.length > 0 && part.body?.attachmentId) {
      const mimeType = part.mimeType || 'application/octet-stream';
      const size = part.body.size || 0;

      // Check if we should process this attachment
      if (size <= options.maxAttachmentSize &&
          options.supportedMimeTypes.includes(mimeType)) {
        
        const gmailClient = provider.getGmailApiClient(accessToken);
        
        try {
          const attachment = await gmailClient.getAttachment(messageId, part.body.attachmentId);
          
          if (attachment) {
            attachments.push({
              id: part.body.attachmentId,
              filename: part.filename,
              mimeType,
              size,
              data: size <= 1024 * 1024 ? attachment.data : undefined, // Only download if < 1MB
              isReceiptCandidate: isReceiptAttachment(part.filename, mimeType)
            });
          }
        } catch (error) {
          console.error(`Failed to get attachment ${part.body.attachmentId}:`, error);
        }
      } else {
        // Add metadata only for large or unsupported files
        attachments.push({
          id: part.body.attachmentId,
          filename: part.filename,
          mimeType,
          size,
          isReceiptCandidate: isReceiptAttachment(part.filename, mimeType)
        });
      }
    }

    if (part.parts) {
      for (const subPart of part.parts) {
        await processAttachmentPart(subPart);
      }
    }
  };

  if (message.payload?.parts) {
    for (const part of message.payload.parts) {
      await processAttachmentPart(part);
    }
  }

  return attachments;
}

export function isReceiptAttachment(filename: string, mimeType: string): boolean {
  const receiptKeywords = [
    'receipt', 'invoice', 'bill', 'payment', 'order',
    '領収書', '請求書', '明細', 'レシート'
  ];

  const lowercaseFilename = filename.toLowerCase();
  const hasReceiptKeyword = receiptKeywords.some(keyword => 
    lowercaseFilename.includes(keyword)
  );

  const isDocumentType = [
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/jpg'
  ].includes(mimeType);

  return hasReceiptKeyword || (isDocumentType && filename.length > 0);
}

// ============================================================================
// Receipt Data Extraction Utilities
// ============================================================================

export function extractReceiptData(message: MessageDetails): ReceiptData {
  const receiptData: ReceiptData = {
    confidence: 0,
    extractionMethod: 'email'
  };

  // Combine all text sources for analysis
  const textSources = [
    message.snippet,
    message.subject,
    message.body.text || '',
    message.body.html?.replace(/<[^>]*>/g, ' ') || '' // Strip HTML tags
  ];

  const fullText = textSources.join(' ');

  // Extract amount
  const amountMatches = extractPattern(fullText, RECEIPT_EXTRACTION_PATTERNS.amount);
  if (amountMatches.length > 0) {
    receiptData.total = parseFloat(amountMatches[0]);
    receiptData.confidence += 0.4;
  }

  // Extract merchant
  const merchantMatches = extractPattern(fullText, RECEIPT_EXTRACTION_PATTERNS.merchant);
  if (merchantMatches.length > 0) {
    receiptData.merchant = merchantMatches[0].trim();
    receiptData.confidence += 0.2;
  }

  // Extract currency
  const currencyMatches = extractPattern(fullText, RECEIPT_EXTRACTION_PATTERNS.currency);
  if (currencyMatches.length > 0) {
    if (fullText.includes('$') || fullText.includes('USD')) {
      receiptData.currency = 'USD';
    } else if (fullText.includes('¥') || fullText.includes('JPY')) {
      receiptData.currency = 'JPY';
    }
    receiptData.confidence += 0.1;
  }

  // Extract date
  const dateMatches = extractPattern(fullText, RECEIPT_EXTRACTION_PATTERNS.date);
  if (dateMatches.length > 0) {
    try {
      receiptData.date = new Date(dateMatches[0]);
      receiptData.confidence += 0.1;
    } catch (error) {
      // Invalid date format
    }
  }

  // Check for receipt attachments
  const receiptAttachments = message.attachments.filter(att => att.isReceiptCandidate);
  if (receiptAttachments.length > 0) {
    receiptData.confidence += 0.2;
    receiptData.extractionMethod = receiptData.confidence > 0.5 ? 'hybrid' : 'attachment';
  }

  return receiptData;
}

function extractPattern(text: string, patterns: RegExp[]): string[] {
  const matches: string[] = [];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      matches.push(match[1]);
    }
  }

  return matches;
}