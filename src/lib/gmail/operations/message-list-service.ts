/**
 * Gmail Message List Service
 * 
 * High-level service for Gmail message listing, filtering, and receipt detection
 * with comprehensive error handling and retry mechanisms.
 */

import { GoogleOAuthProvider } from '../../oauth/providers/google-oauth-provider';
import { OAuthException } from '../../oauth/types';
import {
  GmailMessage,
  MessageListParams,
  MessageListResponse,
  ReceiptDetectionCriteria,
  BatchProcessingOptions,
  RetryOptions,
  DEFAULT_RECEIPT_CRITERIA,
  DEFAULT_BATCH_OPTIONS,
  DEFAULT_RETRY_OPTIONS
} from './message-list-types';
import {
  processMessage,
  createBatches,
  processConcurrent,
  buildQuery,
  formatDate,
  delay
} from './message-list-utils';

// ============================================================================
// MessageListService Implementation
// ============================================================================

export class MessageListService {
  private readonly provider: GoogleOAuthProvider;
  private readonly receiptCriteria: ReceiptDetectionCriteria;
  private readonly batchOptions: BatchProcessingOptions;
  private readonly retryOptions: RetryOptions;

  constructor(
    provider: GoogleOAuthProvider,
    options: {
      receiptCriteria?: Partial<ReceiptDetectionCriteria>;
      batchOptions?: Partial<BatchProcessingOptions>;
      retryOptions?: Partial<RetryOptions>;
    } = {}
  ) {
    this.provider = provider;
    this.receiptCriteria = {
      ...DEFAULT_RECEIPT_CRITERIA,
      ...options.receiptCriteria
    };
    this.batchOptions = {
      ...DEFAULT_BATCH_OPTIONS,
      ...options.batchOptions
    };
    this.retryOptions = {
      ...DEFAULT_RETRY_OPTIONS,
      ...options.retryOptions
    };
  }

  /**
   * List Gmail messages with filtering and receipt detection
   */
  async listMessages(
    accessToken: string,
    params: MessageListParams = {}
  ): Promise<MessageListResponse> {
    return this.withRetry(async () => {
      const gmailClient = this.provider.getGmailApiClient(accessToken);
      
      // Build query with filters
      const query = buildQuery(params);
      
      // Get message list
      const listResponse = await gmailClient.listMessages({
        q: query,
        maxResults: params.maxResults || 50,
        pageToken: params.pageToken
      });

      if (!listResponse.messages) {
        return {
          messages: [],
          resultSizeEstimate: 0
        };
      }

      // Fetch full message details in batches
      const messages = await this.fetchMessagesBatch(
        accessToken,
        listResponse.messages.map((msg: any) => msg.id)
      );

      return {
        messages,
        nextPageToken: listResponse.nextPageToken,
        resultSizeEstimate: listResponse.resultSizeEstimate || 0
      };
    });
  }

  /**
   * Filter messages by receipt detection criteria
   */
  async filterReceiptCandidates(
    accessToken: string,
    params: MessageListParams = {}
  ): Promise<MessageListResponse> {
    const allMessages = await this.listMessages(accessToken, params);
    
    const receiptCandidates = allMessages.messages.filter(
      message => message.isReceiptCandidate && message.confidenceScore > 0.5
    );

    return {
      ...allMessages,
      messages: receiptCandidates
    };
  }

  /**
   * Search messages with custom query
   */
  async searchMessages(
    accessToken: string,
    searchQuery: string,
    params: Omit<MessageListParams, 'query'> = {}
  ): Promise<MessageListResponse> {
    return this.listMessages(accessToken, {
      ...params,
      query: searchQuery
    });
  }

  /**
   * Get messages from specific date range
   */
  async getMessagesInDateRange(
    accessToken: string,
    startDate: Date,
    endDate: Date,
    params: Omit<MessageListParams, 'query'> = {}
  ): Promise<MessageListResponse> {
    const query = `after:${formatDate(startDate)} before:${formatDate(endDate)}`;
    return this.searchMessages(accessToken, query, params);
  }

  /**
   * Get recent receipt candidates
   */
  async getRecentReceipts(
    accessToken: string,
    daysBack: number = 7,
    maxResults: number = 100
  ): Promise<MessageListResponse> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);
    
    const messages = await this.getMessagesInDateRange(
      accessToken,
      startDate,
      new Date(),
      { maxResults }
    );

    return {
      ...messages,
      messages: messages.messages.filter(m => m.isReceiptCandidate)
    };
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  private async fetchMessagesBatch(
    accessToken: string,
    messageIds: string[]
  ): Promise<GmailMessage[]> {
    const gmailClient = this.provider.getGmailApiClient(accessToken);
    const batches = createBatches(messageIds, this.batchOptions.batchSize);
    const allMessages: GmailMessage[] = [];

    for (const batch of batches) {
      const batchPromises = batch.map(messageId =>
        this.withRetry(() => gmailClient.getMessage(messageId))
      );

      const batchResults = await processConcurrent(
        batchPromises,
        this.batchOptions.concurrency
      );

      const processedMessages = batchResults
        .filter(result => result !== null)
        .map(message => processMessage(message, this.receiptCriteria));

      allMessages.push(...processedMessages);

      // Add delay between batches to respect rate limits
      if (batches.length > 1) {
        await delay(this.batchOptions.delayMs);
      }
    }

    return allMessages;
  }

  private async withRetry<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: Error = new Error('Unknown error');
    
    for (let attempt = 0; attempt <= this.retryOptions.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on authentication errors
        if (error instanceof OAuthException && error.error === 'token_expired') {
          throw error;
        }
        
        // Don't retry on the last attempt
        if (attempt === this.retryOptions.maxRetries) {
          break;
        }
        
        // Calculate delay with exponential backoff
        const delayMs = Math.min(
          this.retryOptions.initialDelayMs * Math.pow(this.retryOptions.backoffMultiplier, attempt),
          this.retryOptions.maxDelayMs
        );
        
        console.warn(`Attempt ${attempt + 1} failed, retrying in ${delayMs}ms:`, error);
        await delay(delayMs);
      }
    }
    
    throw lastError;
  }
}