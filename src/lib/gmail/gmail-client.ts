/**
 * Gmail API Client
 * 
 * Comprehensive Gmail API integration with robust error handling, retry logic,
 * and performance monitoring for reliable email processing.
 */

import { gmail_v1 } from 'googleapis';
import { ExponentialBackoff, createDefaultBackoffConfig } from './utils/exponential-backoff';
import { 
  GmailClientConfig, 
  MessageListOptions, 
  MessageListResult,
  EmailMetadata,
  AttachmentData,
  AttachmentDownloadOptions,
  QuotaInfo,
  OperationMetrics,
  GmailError,
  Schema$Message
} from './types';
import { apiObserver } from '../monitoring/api-observer';

// ============================================================================
// Gmail API Client
// ============================================================================

export class GmailClient {
  private gmail: gmail_v1.Gmail;
  private backoff: ExponentialBackoff;
  private config: Required<GmailClientConfig>;
  private metrics: OperationMetrics;

  constructor(gmail: gmail_v1.Gmail, config: Partial<GmailClientConfig> = {}) {
    this.gmail = gmail;
    this.config = {
      defaultMaxResults: config.defaultMaxResults || 100,
      timeoutMs: config.timeoutMs || 30000,
      retryAttempts: config.retryAttempts || 3,
      retryDelayMs: config.retryDelayMs || 1000,
      rateLimitBuffer: config.rateLimitBuffer || 0.8,
      ...config
    };

    this.backoff = new ExponentialBackoff(createDefaultBackoffConfig());

    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      totalQuotaUsed: 0,
      averageResponseTime: 0,
      lastError: null,
      operationCounts: {
        messages_list: 0,
        messages_get: 0,
        attachments_get: 0
      }
    };
  }

  /**
   * List messages with optional filtering
   */
  async listMessages(userId: string, options?: MessageListOptions): Promise<MessageListResult> {
    const operation = 'messages_list';
    const startTime = Date.now();

    return this.backoff.execute(async () => {
      try {
        const query = this.buildQuery(options);
        
        apiObserver.logger.logExternalApi(
          'info', 
          'Gmail messages list initiated',
          {
            service: 'gmail',
            endpoint: '/users/me/messages',
            operation,
            apiStatusCode: 200,
            quota: { used: 5, total: 1000000000 }
          },
          {
            requestId: `gmail-${Date.now()}`,
            userId,
            path: '/users/me/messages',
            method: 'GET',
            userAgent: 'Gmail-Client/1.0'
          }
        );

        const response = await this.gmail.users.messages.list({
          userId,
          q: query,
          maxResults: options?.maxResults || this.config.defaultMaxResults,
          pageToken: options?.pageToken,
          includeSpamTrash: false
        });

        const duration = Date.now() - startTime;
        this.trackOperation(operation, true, duration);
        
        return {
          messages: response.data.messages?.map(msg => ({
            id: msg.id!,
            threadId: msg.threadId!
          })) || [],
          nextPageToken: response.data.nextPageToken || undefined
        };
        
      } catch (error) {
        const duration = Date.now() - startTime;
        const gmailError = this.handleApiError(error, operation);
        this.trackOperation(operation, false, duration, gmailError);
        throw gmailError;
      }
    });
  }

  /**
   * Get detailed message content
   */
  async getMessage(userId: string, messageId: string): Promise<EmailMetadata> {
    const operation = 'messages_get';
    const startTime = Date.now();

    return this.backoff.execute(async () => {
      try {
        apiObserver.logger.logRequest(
          'info',
          'Gmail message get initiated',
          {
            requestId: `gmail-${Date.now()}`,
            userId,
            path: `/users/me/messages/${messageId}`,
            method: 'GET',
            userAgent: 'Gmail-Client/1.0'
          }
        );

        const response = await this.gmail.users.messages.get({
          userId,
          id: messageId,
          format: 'full'
        });

        const duration = Date.now() - startTime;
        this.trackOperation(operation, true, duration);
        
        return this.parseMessageData(response.data);
        
      } catch (error) {
        const duration = Date.now() - startTime;
        const gmailError = this.handleApiError(error, operation);
        this.trackOperation(operation, false, duration, gmailError);
        throw gmailError;
      }
    });
  }

  /**
   * Download message attachment
   */
  async getAttachment(options: AttachmentDownloadOptions): Promise<AttachmentData> {
    const operation = 'attachments_get';
    const startTime = Date.now();

    return this.backoff.execute(async () => {
      try {
        apiObserver.logger.logRequest(
          'info',
          'Gmail attachment download initiated',
          {
            requestId: `gmail-${Date.now()}`,
            userId: options.userId,
            path: `/users/me/messages/${options.messageId}/attachments/${options.attachmentId}`,
            method: 'GET',
            userAgent: 'Gmail-Client/1.0'
          }
        );

        const response = await this.gmail.users.messages.attachments.get({
          userId: options.userId,
          messageId: options.messageId,
          id: options.attachmentId
        });

        const duration = Date.now() - startTime;
        this.trackOperation(operation, true, duration);
        
        return {
          attachmentId: options.attachmentId,
          filename: options.filename || 'attachment',
          mimeType: options.mimeType || 'application/octet-stream',
          size: response.data.size || 0,
          data: response.data.data || '',
          messageId: options.messageId
        };
        
      } catch (error) {
        const duration = Date.now() - startTime;
        const gmailError = this.handleApiError(error, operation);
        this.trackOperation(operation, false, duration, gmailError);
        throw gmailError;
      }
    });
  }

  /**
   * Get quota information
   */
  async getQuotaInfo(): Promise<QuotaInfo> {
    return {
      used: this.metrics.totalQuotaUsed,
      total: 1000000000, // 1 billion quota units per day
      percentage: this.metrics.totalQuotaUsed / 10000000, // Convert to percentage
      resetTime: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
    };
  }

  /**
   * Get operation metrics
   */
  getMetrics(): OperationMetrics {
    return { ...this.metrics };
  }

  /**
   * Reset operation metrics
   */
  resetMetrics(): void {
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      totalQuotaUsed: 0,
      averageResponseTime: 0,
      lastError: null,
      operationCounts: {
        messages_list: 0,
        messages_get: 0,
        attachments_get: 0
      }
    };
  }

  /**
   * List user labels (for testing)
   */
  async listLabels(userId: string): Promise<{ id: string; name: string }[]> {
    const operation = 'labels_list';
    const startTime = Date.now();

    return this.backoff.execute(async () => {
      try {
        const response = await this.gmail.users.labels.list({ userId });
        
        const duration = Date.now() - startTime;
        this.trackOperation('messages_list', true, duration); // Use existing operation type
        
        return response.data.labels?.map(label => ({
          id: label.id || '',
          name: label.name || ''
        })) || [];
        
      } catch (error) {
        const duration = Date.now() - startTime;
        const gmailError = this.handleApiError(error, operation);
        this.trackOperation('messages_list', false, duration, gmailError);
        throw gmailError;
      }
    });
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  /**
   * Build Gmail search query from options
   */
  private buildQuery(options?: MessageListOptions): string {
    if (!options) return '';
    
    const queryParts: string[] = [];
    
    if (options.hasAttachment) {
      queryParts.push('has:attachment');
    }
    
    if (options.from) {
      queryParts.push(`from:${options.from}`);
    }
    
    if (options.subject) {
      queryParts.push(`subject:"${options.subject}"`);
    }
    
    if (options.after) {
      const dateStr = options.after.toISOString().split('T')[0];
      queryParts.push(`after:${dateStr}`);
    }
    
    if (options.before) {
      const dateStr = options.before.toISOString().split('T')[0];
      queryParts.push(`before:${dateStr}`);
    }
    
    if (options.query) {
      queryParts.push(options.query);
    }
    
    return queryParts.join(' ');
  }

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
      headers: headers.reduce((acc, header) => {
        if (header.name && header.value) {
          acc[header.name] = header.value;
        }
        return acc;
      }, {} as Record<string, string>)
    };
  }

  /**
   * Track operation metrics
   */
  private trackOperation(
    operation: keyof OperationMetrics['operationCounts'], 
    success: boolean, 
    duration: number, 
    error?: GmailError
  ): void {
    this.metrics.totalRequests++;
    this.metrics.operationCounts[operation]++;
    
    if (success) {
      this.metrics.successfulRequests++;
      this.metrics.totalQuotaUsed += this.getQuotaCost(operation);
    } else {
      this.metrics.failedRequests++;
      this.metrics.lastError = error || null;
    }
    
    // Update average response time
    const total = this.metrics.averageResponseTime * (this.metrics.totalRequests - 1);
    this.metrics.averageResponseTime = (total + duration) / this.metrics.totalRequests;
  }

  /**
   * Get quota cost for operation
   */
  private getQuotaCost(operation: keyof OperationMetrics['operationCounts']): number {
    const costs = {
      messages_list: 5,
      messages_get: 2,
      attachments_get: 2
    };
    return costs[operation] || 1;
  }

  /**
   * Handle API errors and convert to GmailError
   */
  private handleApiError(error: any, operation: string): GmailError {
    if (error.code) {
      switch (error.code) {
        case 401:
          return new GmailError('AUTHENTICATION_FAILED', `Gmail authentication failed for ${operation}`, error);
        case 403:
          return new GmailError('QUOTA_EXCEEDED', `Gmail quota exceeded for ${operation}`, error);
        case 404:
          return new GmailError('NOT_FOUND', `Gmail resource not found for ${operation}`, error);
        case 429:
          return new GmailError('RATE_LIMITED', `Gmail rate limit exceeded for ${operation}`, error);
        case 500:
        case 502:
        case 503:
          return new GmailError('API_ERROR', `Gmail API error for ${operation}`, error);
        default:
          return new GmailError('UNKNOWN', `Unknown Gmail error for ${operation}: ${error.message}`, error);
      }
    }
    
    if (error.message?.includes('timeout')) {
      return new GmailError('TIMEOUT', `Gmail API timeout for ${operation}`, error);
    }
    
    return new GmailError('UNKNOWN', `Unknown error for ${operation}: ${error.message}`, error);
  }
}