/**
 * Gmail Message Get Operations
 * 
 * Detailed message retrieval with comprehensive parsing, attachment handling,
 * and optimized content extraction for receipt processing workflows.
 */

import { gmail_v1 } from 'googleapis';
import { 
  EmailMetadata, 
  ProcessedEmail, 
  AttachmentInfo,
  GmailError 
} from '../types';
import { parseEmailString } from '../utils/email-helpers';

// ============================================================================
// Message Get Service
// ============================================================================

export class MessageGetService {
  constructor(private gmail: gmail_v1.Gmail) {}

  /**
   * Get detailed message information
   */
  async getMessage(userId: string, messageId: string): Promise<EmailMetadata> {
    try {
      const response = await this.gmail.users.messages.get({
        userId,
        id: messageId,
        format: 'full'
      });

      return this.parseMessageData(response.data);
      
    } catch (error) {
      throw new GmailError('API_ERROR', `Failed to get message ${messageId}: ${error}`, error instanceof Error ? error : undefined);
    }
  }

  /**
   * Get message formatted for receipt processing
   */
  async getMessageForReceipt(userId: string, messageId: string): Promise<ProcessedEmail> {
    try {
      const response = await this.gmail.users.messages.get({
        userId,
        id: messageId,
        format: 'full'
      });

      return this.parseMessageToProcessedEmail(response.data);
      
    } catch (error) {
      throw new GmailError('API_ERROR', `Failed to get message for receipt ${messageId}: ${error}`, error instanceof Error ? error : undefined);
    }
  }

  /**
   * Get message metadata only (lightweight)
   */
  async getMessageMetadata(userId: string, messageId: string): Promise<EmailMetadata> {
    try {
      const response = await this.gmail.users.messages.get({
        userId,
        id: messageId,
        format: 'metadata',
        metadataHeaders: [
          'From', 'To', 'Subject', 'Date', 'Message-ID',
          'In-Reply-To', 'References', 'Content-Type'
        ]
      });

      return this.parseMessageData(response.data);
      
    } catch (error) {
      throw new GmailError('API_ERROR', `Failed to get message metadata ${messageId}: ${error}`, error instanceof Error ? error : undefined);
    }
  }

  /**
   * Get multiple messages in batch
   */
  async getMessagesBatch(
    userId: string, 
    messageIds: string[],
    format: 'full' | 'metadata' = 'full'
  ): Promise<(EmailMetadata | ProcessedEmail)[]> {
    const results: (EmailMetadata | ProcessedEmail)[] = [];
    const batchSize = 10; // Process in batches to respect rate limits
    
    for (let i = 0; i < messageIds.length; i += batchSize) {
      const batch = messageIds.slice(i, i + batchSize);
      const batchPromises = batch.map(async id => {
        try {
          if (format === 'full') {
            return await this.getMessageForReceipt(userId, id);
          } else {
            return await this.getMessageMetadata(userId, id);
          }
        } catch (error) {
          console.warn(`Failed to get message ${id}:`, error);
          return null;
        }
      });
      
      const batchResults = await Promise.allSettled(batchPromises);
      
      batchResults.forEach(result => {
        if (result.status === 'fulfilled' && result.value) {
          results.push(result.value);
        }
      });
      
      // Add delay between batches
      if (i + batchSize < messageIds.length) {
        await this.delay(1000);
      }
    }
    
    return results;
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  /**
   * Parse Gmail message data into EmailMetadata
   */
  private parseMessageData(message: gmail_v1.Schema$Message): EmailMetadata {
    const payload = message.payload;
    const headers = payload?.headers || [];
    
    // Extract headers
    const getHeader = (name: string) => 
      headers.find(h => h.name?.toLowerCase() === name.toLowerCase())?.value || '';

    return {
      messageId: message.id || '',
      threadId: message.threadId || '',
      from: getHeader('from'),
      to: getHeader('to'),
      subject: getHeader('subject'),
      date: new Date(parseInt(message.internalDate || '0')),
      size: message.sizeEstimate || 0,
      labels: message.labelIds || [],
      snippet: message.snippet || '',
      labelIds: message.labelIds || [],
      historyId: message.historyId || '',
      internalDate: message.internalDate || '',
      sizeEstimate: message.sizeEstimate || 0,
      headers: this.extractHeaders(headers)
    };
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
    
    // Extract and parse the from header
    const fromHeader = getHeader('from');
    const fromParsed = fromHeader ? parseEmailString(fromHeader) : fromHeader;
    
    // Extract body content
    const body = this.extractBodyContent(payload);
    
    // Extract attachments
    const attachments: AttachmentInfo[] = [];
    this.extractAttachments(payload, attachments);

    return {
      messageId: message.id || '',
      threadId: message.threadId || '',
      from: fromParsed,
      to: getHeader('to'),
      subject: getHeader('subject'),
      body,
      date: new Date(parseInt(message.internalDate || '0')),
      size: message.sizeEstimate || 0,
      labels: message.labelIds || [],
      snippet: message.snippet || '',
      attachments
    };
  }

  /**
   * Extract headers into a record
   */
  private extractHeaders(headers: Array<{ name?: string | null; value?: string | null }>): Record<string, string> {
    const headerMap: Record<string, string> = {};
    headers.forEach(header => {
      if (header.name && header.value) {
        headerMap[header.name] = header.value;
      }
    });
    return headerMap;
  }

  /**
   * Extract body content from message payload
   */
  private extractBodyContent(payload?: gmail_v1.Schema$MessagePart): string {
    if (!payload) return '';
    
    let textContent = '';
    let htmlContent = '';
    
    // Extract content recursively
    this.extractContentRecursive(payload, { textContent: '', htmlContent: '' });
    
    // Prefer text content, fall back to HTML
    return textContent || htmlContent || '';
  }

  /**
   * Recursively extract content from message parts
   */
  private extractContentRecursive(
    payload: gmail_v1.Schema$MessagePart, 
    content: { textContent: string; htmlContent: string }
  ): void {
    // Check if this part has body data
    if (payload.body?.data && payload.mimeType) {
      try {
        const decodedContent = Buffer.from(payload.body.data, 'base64').toString('utf-8');
        
        if (payload.mimeType === 'text/plain') {
          content.textContent += decodedContent;
        } else if (payload.mimeType === 'text/html') {
          content.htmlContent += decodedContent;
        }
      } catch (error) {
        console.warn('Failed to decode body data:', error);
      }
    }
    
    // Recursively process parts
    if (payload.parts) {
      payload.parts.forEach(part => this.extractContentRecursive(part, content));
    }
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
   * Clean HTML content (basic cleanup)
   */
  private cleanHtmlContent(html: string): string {
    return html
      .replace(/<[^>]*>/g, ' ') // Remove HTML tags
      .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
      .replace(/&amp;/g, '&') // Replace &amp; with &
      .replace(/&lt;/g, '<') // Replace &lt; with <
      .replace(/&gt;/g, '>') // Replace &gt; with >
      .replace(/&quot;/g, '"') // Replace &quot; with "
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim();
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}