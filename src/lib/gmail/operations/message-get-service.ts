/**
 * Gmail Message Get Service
 * 
 * High-level service for retrieving Gmail message details with receipt processing
 */

import { GoogleOAuth } from '../../oauth/google-oauth';
import { OAuthException } from '../../oauth/types';
import {
  MessageDetails,
  MessageAttachment,
  MessageProcessingOptions,
  AttachmentProcessingOptions,
  DEFAULT_PROCESSING_OPTIONS
} from './message-get-types';
import {
  extractHeaders,
  extractBody,
  processAttachments,
  extractReceiptData,
  isReceiptAttachment,
  decodeBase64
} from './message-get-utils';

// ============================================================================
// MessageGetService Implementation
// ============================================================================

export class MessageGetService {
  private readonly provider: GoogleOAuth;
  private readonly processingOptions: MessageProcessingOptions;

  constructor(
    provider: GoogleOAuth,
    options: Partial<MessageProcessingOptions> = {}
  ) {
    this.provider = provider;
    this.processingOptions = {
      ...DEFAULT_PROCESSING_OPTIONS,
      ...options
    };
  }

  /**
   * Get complete message details with attachments and receipt extraction
   */
  async getMessage(
    accessToken: string,
    messageId: string,
    options: Partial<MessageProcessingOptions> = {}
  ): Promise<MessageDetails> {
    const mergedOptions = { ...this.processingOptions, ...options };
    
    return this.withRetry(async () => {
      const gmailClient = this.provider.getGmailClient(accessToken);
      
      // Get full message data
      const rawMessage = await gmailClient.getMessage(messageId, 'full');
      
      // Process message components
      const headers = extractHeaders(rawMessage);
      const body = extractBody(rawMessage);
      const attachments = mergedOptions.includeAttachments 
        ? await processAttachments(accessToken, messageId, rawMessage, this.provider, mergedOptions)
        : [];

      // Create base message details
      const messageDetails: MessageDetails = {
        id: rawMessage.id,
        threadId: rawMessage.threadId,
        snippet: rawMessage.snippet || '',
        subject: headers.subject || '',
        from: headers.from || '',
        to: headers.to || '',
        date: headers.date ? new Date(headers.date) : new Date(),
        body,
        attachments,
        headers,
        labels: rawMessage.labelIds || [],
        isReceiptCandidate: false
      };

      // Extract receipt data if requested
      if (mergedOptions.extractReceiptData) {
        const receiptData = extractReceiptData(messageDetails);
        messageDetails.receiptData = receiptData;
        messageDetails.isReceiptCandidate = receiptData.confidence > 0.3;
      }

      return messageDetails;
    });
  }

  /**
   * Get multiple messages in batch
   */
  async getMessages(
    accessToken: string,
    messageIds: string[],
    options: Partial<MessageProcessingOptions> = {}
  ): Promise<MessageDetails[]> {
    const batchSize = 10;
    const results: MessageDetails[] = [];

    for (let i = 0; i < messageIds.length; i += batchSize) {
      const batch = messageIds.slice(i, i + batchSize);
      const batchPromises = batch.map(id => 
        this.getMessage(accessToken, id, options)
      );

      try {
        const batchResults = await Promise.allSettled(batchPromises);
        
        for (const result of batchResults) {
          if (result.status === 'fulfilled') {
            results.push(result.value);
          } else {
            console.error('Failed to get message:', result.reason);
          }
        }
      } catch (error) {
        console.error('Batch processing error:', error);
      }

      // Add delay between batches
      if (i + batchSize < messageIds.length) {
        await this.delay(100);
      }
    }

    return results;
  }

  /**
   * Get message attachment data
   */
  async getAttachment(
    accessToken: string,
    messageId: string,
    attachmentId: string,
    options: AttachmentProcessingOptions = {
      downloadData: true,
      maxSize: 10 * 1024 * 1024,
      allowedTypes: ['image/png', 'image/jpeg', 'application/pdf']
    }
  ): Promise<MessageAttachment | null> {
    return this.withRetry(async () => {
      const gmailClient = this.provider.getGmailClient(accessToken);
      
      try {
        const attachment = await gmailClient.getAttachment(messageId, attachmentId);
        
        if (!attachment.data) {
          return null;
        }

        // Check size limits
        const estimatedSize = (attachment.size || 0);
        if (estimatedSize > options.maxSize) {
          console.warn(`Attachment too large: ${estimatedSize} bytes`);
          return null;
        }

        return {
          id: attachmentId,
          filename: attachment.filename || 'unknown',
          mimeType: attachment.mimeType || 'application/octet-stream',
          size: estimatedSize,
          data: options.downloadData ? attachment.data : undefined,
          isReceiptCandidate: isReceiptAttachment(attachment.filename || '', attachment.mimeType || '')
        };
      } catch (error) {
        console.error(`Failed to get attachment ${attachmentId}:`, error);
        return null;
      }
    });
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  private async withRetry<T>(operation: () => Promise<T>): Promise<T> {
    const maxRetries = 3;
    let lastError: Error = new Error('Unknown error');

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        if (error instanceof OAuthException && error.error === 'token_expired') {
          throw error;
        }

        if (attempt === maxRetries) {
          break;
        }

        const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
        console.warn(`Attempt ${attempt + 1} failed, retrying in ${delay}ms:`, error);
        await this.delay(delay);
      }
    }

    throw lastError;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}