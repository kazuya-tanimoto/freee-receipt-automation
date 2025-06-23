/**
 * Gmail Attachment Get Operations
 * 
 * Secure attachment downloading with validation, caching, and optimized
 * processing for receipt files and business documents.
 */

import { gmail_v1 } from 'googleapis';
import { 
  AttachmentData, 
  AttachmentDownloadOptions, 
  AttachmentInfo,
  GmailError,
  MAX_ATTACHMENT_SIZE 
} from '../types';

// ============================================================================
// Attachment Get Service
// ============================================================================

export class AttachmentGetService {
  private cache: Map<string, { data: AttachmentData; timestamp: number }>;
  private readonly cacheTtl: number = 300000; // 5 minutes

  constructor(private gmail: gmail_v1.Gmail) {
    this.cache = new Map();
  }

  /**
   * Download single attachment
   */
  async downloadAttachment(options: AttachmentDownloadOptions): Promise<AttachmentData> {
    // Check cache first
    const cacheKey = `${options.messageId}-${options.attachmentId}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTtl) {
      return cached.data;
    }

    try {
      // Validate attachment size before download
      if (options.mimeType && this.isUnsupportedType(options.mimeType)) {
        throw new GmailError('API_ERROR', `Unsupported attachment type: ${options.mimeType}`);
      }

      const response = await this.gmail.users.messages.attachments.get({
        userId: options.userId,
        messageId: options.messageId,
        id: options.attachmentId
      });

      const attachmentData: AttachmentData = {
        attachmentId: options.attachmentId,
        filename: options.filename || 'attachment',
        mimeType: options.mimeType || 'application/octet-stream',
        size: response.data.size || 0,
        data: response.data.data || '',
        messageId: options.messageId
      };

      // Validate attachment
      this.validateAttachment(attachmentData);

      // Cache the result
      this.cache.set(cacheKey, { data: attachmentData, timestamp: Date.now() });

      return attachmentData;
      
    } catch (error) {
      throw new GmailError('API_ERROR', `Failed to download attachment ${options.attachmentId}: ${error}`, error instanceof Error ? error : undefined);
    }
  }

  /**
   * Download multiple attachments from a message
   */
  async downloadMessageAttachments(
    userId: string,
    messageId: string,
    attachments: AttachmentInfo[]
  ): Promise<AttachmentData[]> {
    const results: AttachmentData[] = [];
    const batchSize = 3; // Limit concurrent downloads

    for (let i = 0; i < attachments.length; i += batchSize) {
      const batch = attachments.slice(i, i + batchSize);
      const batchPromises = batch.map(async attachment => {
        try {
          return await this.downloadAttachment({
            userId,
            messageId,
            attachmentId: attachment.attachmentId,
            filename: attachment.filename,
            mimeType: attachment.mimeType
          });
        } catch (error) {
          console.warn(`Failed to download attachment ${attachment.attachmentId}:`, error);
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
      if (i + batchSize < attachments.length) {
        await this.delay(1000);
      }
    }

    return results;
  }

  /**
   * Download attachments with filtering for receipt files
   */
  async downloadReceiptAttachments(
    userId: string,
    messageId: string,
    attachments: AttachmentInfo[]
  ): Promise<AttachmentData[]> {
    // Filter for potential receipt files
    const receiptAttachments = attachments.filter(attachment => 
      this.isReceiptFile(attachment)
    );

    if (receiptAttachments.length === 0) {
      return [];
    }

    return this.downloadMessageAttachments(userId, messageId, receiptAttachments);
  }

  /**
   * Get attachment metadata without downloading
   */
  async getAttachmentInfo(
    userId: string,
    messageId: string,
    attachmentId: string
  ): Promise<{ size: number; mimeType?: string }> {
    try {
      // Use the messages.attachments.get endpoint to get metadata
      const response = await this.gmail.users.messages.attachments.get({
        userId,
        messageId,
        id: attachmentId
      });

      return {
        size: response.data.size || 0,
        mimeType: undefined // Gmail API doesn't return MIME type in attachment metadata
      };
      
    } catch (error) {
      throw new GmailError('API_ERROR', `Failed to get attachment info: ${error}`, error instanceof Error ? error : undefined);
    }
  }

  /**
   * Clear attachment cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Clean expired cache entries
   */
  cleanExpiredCache(): void {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());
    
    for (const [key, entry] of entries) {
      if (now - entry.timestamp > this.cacheTtl) {
        this.cache.delete(key);
      }
    }
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  /**
   * Validate attachment before processing
   */
  private validateAttachment(attachment: AttachmentData): void {
    // Check file size
    if (attachment.size > MAX_ATTACHMENT_SIZE) {
      throw new GmailError('API_ERROR', 
        `Attachment ${attachment.filename} is too large: ${attachment.size} bytes`);
    }

    // Check for potentially malicious files
    if (this.isMaliciousFile(attachment.filename)) {
      throw new GmailError('API_ERROR', 
        `Potentially malicious file type: ${attachment.filename}`);
    }

    // Validate base64 data if present
    if (attachment.data && !this.isValidBase64(attachment.data)) {
      throw new GmailError('API_ERROR', 
        `Invalid attachment data for ${attachment.filename}`);
    }
  }

  /**
   * Check if file is a potential receipt
   */
  private isReceiptFile(attachment: AttachmentInfo): boolean {
    const filename = attachment.filename.toLowerCase();
    const mimeType = attachment.mimeType.toLowerCase();

    // Check file extensions
    const receiptExtensions = ['.pdf', '.png', '.jpg', '.jpeg', '.gif', '.tiff'];
    const hasReceiptExtension = receiptExtensions.some(ext => filename.endsWith(ext));

    // Check MIME types
    const receiptMimeTypes = [
      'application/pdf',
      'image/png',
      'image/jpeg',
      'image/gif',
      'image/tiff'
    ];
    const hasReceiptMimeType = receiptMimeTypes.includes(mimeType);

    // Check filename patterns
    const receiptPatterns = [
      /receipt/i,
      /invoice/i,
      /bill/i,
      /statement/i,
      /payment/i,
      /purchase/i
    ];
    const hasReceiptPattern = receiptPatterns.some(pattern => pattern.test(filename));

    // File should have appropriate extension/type AND reasonable size
    const reasonableSize = attachment.size > 1024 && attachment.size < MAX_ATTACHMENT_SIZE;

    return (hasReceiptExtension || hasReceiptMimeType) && reasonableSize || hasReceiptPattern;
  }

  /**
   * Check if MIME type is unsupported
   */
  private isUnsupportedType(mimeType: string): boolean {
    const unsupportedTypes = [
      'application/x-msdownload',
      'application/x-msdos-program',
      'application/x-executable',
      'application/x-winexe',
      'application/x-winhlp',
      'application/x-msi'
    ];

    return unsupportedTypes.includes(mimeType.toLowerCase());
  }

  /**
   * Check if filename indicates a potentially malicious file
   */
  private isMaliciousFile(filename: string): boolean {
    const maliciousExtensions = [
      '.exe', '.bat', '.cmd', '.scr', '.pif', '.vbs', '.js',
      '.jar', '.com', '.msi', '.dll', '.scf', '.lnk'
    ];

    const lowerFilename = filename.toLowerCase();
    return maliciousExtensions.some(ext => lowerFilename.endsWith(ext));
  }

  /**
   * Validate base64 data
   */
  private isValidBase64(data: string): boolean {
    try {
      return btoa(atob(data)) === data;
    } catch (error) {
      return false;
    }
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}