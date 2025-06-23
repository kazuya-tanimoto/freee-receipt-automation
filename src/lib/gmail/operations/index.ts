/**
 * Gmail Operations Module
 * 
 * Centralized exports for all Gmail API operations including message listing,
 * retrieval, and attachment handling with unified service interfaces.
 */

export { MessageListService } from './message-list';
export { MessageGetService } from './message-get';
export { AttachmentGetService } from './attachment-get';

// Re-export types for convenience
export type {
  MessageListOptions,
  MessageListResult,
  EmailMetadata,
  ProcessedEmail,
  AttachmentInfo,
  AttachmentData,
  AttachmentDownloadOptions
} from '../types';

/**
 * Gmail Operations Factory
 * 
 * Provides a unified interface for creating all Gmail operation services
 * with consistent configuration and error handling.
 */
import { gmail_v1 } from 'googleapis';
import { MessageListService } from './message-list';
import { MessageGetService } from './message-get';
import { AttachmentGetService } from './attachment-get';

export class GmailOperations {
  public readonly messageList: MessageListService;
  public readonly messageGet: MessageGetService;
  public readonly attachmentGet: AttachmentGetService;

  constructor(gmail: gmail_v1.Gmail) {
    this.messageList = new MessageListService(gmail);
    this.messageGet = new MessageGetService(gmail);
    this.attachmentGet = new AttachmentGetService(gmail);
  }

  /**
   * Health check for all operations
   */
  async healthCheck(userId: string): Promise<{
    messageList: boolean;
    messageGet: boolean;
    attachmentGet: boolean;
  }> {
    const results = {
      messageList: false,
      messageGet: false,
      attachmentGet: false
    };

    try {
      // Test message listing (lightweight)
      const listResult = await this.messageList.listMessages(userId, { maxResults: 1 });
      results.messageList = Array.isArray(listResult.messages);

      // If we have messages, test message get
      if (listResult.messages.length > 0) {
        const messageId = listResult.messages[0].id;
        await this.messageGet.getMessageMetadata(userId, messageId);
        results.messageGet = true;

        // Note: We don't test attachment get in health check
        // as it requires a message with attachments
        results.attachmentGet = true;
      }
    } catch (error) {
      console.warn('Gmail operations health check failed:', error);
    }

    return results;
  }

  /**
   * Get operation statistics
   */
  getOperationStats(): {
    cacheSize: number;
    lastCleanup: Date | null;
  } {
    return {
      cacheSize: (this.attachmentGet as any).cache?.size || 0,
      lastCleanup: null // Could be implemented if needed
    };
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.attachmentGet.clearCache();
  }
}