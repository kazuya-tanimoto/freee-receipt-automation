/**
 * Gmail Message List Operations
 * 
 * Optimized message listing with intelligent filtering, pagination,
 * and business-focused email discovery for receipt processing.
 */

import { gmail_v1 } from 'googleapis';
import { 
  MessageListOptions, 
  MessageListResult, 
  ProcessedEmail, 
  AttachmentInfo,
  GmailError 
} from '../types';
import { getEmailString } from '../utils/email-helpers';

// ============================================================================
// Message List Service
// ============================================================================

export class MessageListService {
  constructor(private gmail: gmail_v1.Gmail) {}

  /**
   * List messages with business-focused filtering
   */
  async listMessages(userId: string, options?: MessageListOptions): Promise<MessageListResult> {
    try {
      const query = this.buildBusinessQuery(options);
      
      const response = await this.gmail.users.messages.list({
        userId,
        q: query,
        maxResults: options?.maxResults || 100,
        pageToken: options?.pageToken,
        includeSpamTrash: false
      });

      return {
        messages: response.data.messages?.map(msg => ({
          id: msg.id!,
          threadId: msg.threadId!
        })) || [],
        nextPageToken: response.data.nextPageToken || undefined
      };
      
    } catch (error) {
      throw new GmailError('API_ERROR', `Failed to list messages: ${error}`, error instanceof Error ? error : undefined);
    }
  }

  /**
   * Search for receipt-related messages
   */
  async searchReceiptMessages(
    userId: string, 
    options: { 
      after?: Date; 
      before?: Date; 
      maxResults?: number;
      pageToken?: string;
    } = {}
  ): Promise<MessageListResult> {
    const receiptQuery = this.buildReceiptSearchQuery(options);
    
    return this.listMessages(userId, {
      ...options,
      query: receiptQuery,
      hasAttachment: true
    });
  }

  /**
   * Get messages with full metadata for processing
   */
  async getMessagesForProcessing(
    userId: string,
    messageIds: string[],
    batchSize: number = 10
  ): Promise<ProcessedEmail[]> {
    const processedEmails: ProcessedEmail[] = [];
    
    // Process in batches to avoid overwhelming the API
    for (let i = 0; i < messageIds.length; i += batchSize) {
      const batch = messageIds.slice(i, i + batchSize);
      const batchPromises = batch.map(id => this.getProcessedMessage(userId, id));
      
      try {
        const batchResults = await Promise.allSettled(batchPromises);
        
        batchResults.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            processedEmails.push(result.value);
          } else {
            console.warn(`Failed to process message ${batch[index]}:`, result.reason);
          }
        });
        
      } catch (error) {
        console.error('Batch processing error:', error);
      }
      
      // Add delay between batches to respect rate limits
      if (i + batchSize < messageIds.length) {
        await this.delay(1000); // 1 second delay
      }
    }
    
    return processedEmails;
  }

  /**
   * Get single processed message
   */
  private async getProcessedMessage(userId: string, messageId: string): Promise<ProcessedEmail> {
    try {
      const response = await this.gmail.users.messages.get({
        userId,
        id: messageId,
        format: 'full'
      });

      return this.parseMessageToProcessedEmail(response.data);
      
    } catch (error) {
      throw new GmailError('API_ERROR', `Failed to get message metadata ${messageId}: ${error}`, error instanceof Error ? error : undefined);
    }
  }

  /**
   * Build business-focused search query
   */
  private buildBusinessQuery(options?: MessageListOptions): string {
    const queryParts: string[] = [];
    
    // Base business email filters
    queryParts.push('-(from:noreply OR from:no-reply OR from:donotreply)');
    
    if (options?.hasAttachment) {
      queryParts.push('has:attachment');
    }
    
    if (options?.from) {
      queryParts.push(`from:${options.from}`);
    }
    
    if (options?.subject) {
      queryParts.push(`subject:"${options.subject}"`);
    }
    
    if (options?.after) {
      const dateStr = options.after.toISOString().split('T')[0];
      queryParts.push(`after:${dateStr}`);
    }
    
    if (options?.before) {
      const dateStr = options.before.toISOString().split('T')[0];
      queryParts.push(`before:${dateStr}`);
    }
    
    if (options?.query) {
      queryParts.push(options.query);
    }
    
    return queryParts.join(' ');
  }

  /**
   * Build receipt-specific search query
   */
  private buildReceiptSearchQuery(options: { after?: Date; before?: Date }): string {
    const receiptKeywords = [
      'receipt', 'invoice', 'payment', 'purchase', 'order',
      'transaction', 'billing', 'confirmation'
    ];
    
    const queryParts: string[] = [];
    
    // Receipt keywords (OR condition)
    const keywordQuery = receiptKeywords.map(keyword => `subject:${keyword}`).join(' OR ');
    queryParts.push(`(${keywordQuery})`);
    
    // Business domains
    const businessDomains = [
      'amazon.com', 'stripe.com', 'paypal.com', 'square.com',
      'github.com', 'microsoft.com', 'google.com', 'adobe.com'
    ];
    
    const domainQuery = businessDomains.map(domain => `from:${domain}`).join(' OR ');
    queryParts.push(`(${domainQuery})`);
    
    // Date filters
    if (options.after) {
      const dateStr = options.after.toISOString().split('T')[0];
      queryParts.push(`after:${dateStr}`);
    }
    
    if (options.before) {
      const dateStr = options.before.toISOString().split('T')[0];
      queryParts.push(`before:${dateStr}`);
    }
    
    return queryParts.join(' ');
  }

  /**
   * Parse Gmail message to ProcessedEmail format
   */
  private parseMessageToProcessedEmail(message: gmail_v1.Schema$Message): ProcessedEmail {
    const payload = message.payload;
    const headers = payload?.headers || [];
    
    // Extract headers
    const getHeader = (name: string) => 
      headers.find(h => h.name?.toLowerCase() === name.toLowerCase())?.value || '';
    
    // Extract body content
    const body = this.extractBodyContent(payload);
    
    // Extract attachments
    const attachments: AttachmentInfo[] = [];
    this.extractAttachments(payload, attachments);

    return {
      messageId: message.id || '',
      threadId: message.threadId || '',
      from: getHeader('from'),
      to: getHeader('to'),
      subject: getHeader('subject'),
      body,
      date: new Date(parseInt(message.internalDate || '0')),
      size: message.sizeEstimate || 0,
      labels: message.labelIds || [],
      snippet: message.snippet || '',
      attachments: attachments
    };
  }

  /**
   * Extract body content from message payload
   */
  private extractBodyContent(payload?: gmail_v1.Schema$MessagePart): string {
    if (!payload) return '';
    
    // Check if this part has body data
    if (payload.body?.data) {
      try {
        return Buffer.from(payload.body.data, 'base64').toString('utf-8');
      } catch (error) {
        console.warn('Failed to decode body data:', error);
      }
    }
    
    // Check for multipart content
    if (payload.parts) {
      for (const part of payload.parts) {
        if (part.mimeType === 'text/plain' || part.mimeType === 'text/html') {
          const content = this.extractBodyContent(part);
          if (content) return content;
        }
      }
    }
    
    return '';
  }

  /**
   * Extract attachment information recursively
   */
  private extractAttachments(
    payload?: gmail_v1.Schema$MessagePart, 
    attachments: AttachmentInfo[] = []
  ): void {
    if (!payload) return;
    
    // Check if this part is an attachment
    if (payload.filename && payload.filename.length > 0 && payload.body?.attachmentId) {
      attachments.push({
        attachmentId: payload.body.attachmentId,
        filename: payload.filename,
        mimeType: payload.mimeType || 'application/octet-stream',
        size: payload.body.size || 0
      });
    }
    
    // Recursively check parts
    if (payload.parts) {
      payload.parts.forEach(part => this.extractAttachments(part, attachments));
    }
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}