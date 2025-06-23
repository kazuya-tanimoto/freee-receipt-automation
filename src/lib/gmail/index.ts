/**
 * Gmail Integration Module
 * 
 * Comprehensive Gmail API integration for receipt processing automation
 * with robust error handling, monitoring, and business logic processing.
 */

// Core client and authentication
export { GmailClient } from './gmail-client';
export { GmailAuth, gmailAuth } from './gmail-auth';

// Operations
export { 
  MessageListService,
  MessageGetService,
  AttachmentGetService,
  GmailOperations
} from './operations';

// Processors
export {
  ReceiptDetector,
  EmailClassifier,
  AttachmentValidator,
  GmailProcessingPipeline
} from './processors';

// Error handling
export {
  GmailErrorHandler,
  createDefaultErrorHandler,
  RetryManager,
  gmailMonitor,
  recordGmailOperation
} from './error-handling';

// Utilities
export { ExponentialBackoff, CircuitBreaker } from './utils/exponential-backoff';
export * from './utils/email-helpers';

// Types
export type * from './types';

/**
 * Gmail Service Factory
 * 
 * Main entry point for creating Gmail service instances with
 * proper configuration and error handling.
 */
import { gmail_v1 } from 'googleapis';
import { GmailClientConfig } from './types';
import { GmailClient } from './gmail-client';
import { GmailAuth, gmailAuth } from './gmail-auth';
import { GmailOperations } from './operations';
import { GmailProcessingPipeline } from './processors';
import { GmailErrorHandler, createDefaultErrorHandler } from './error-handling';

export interface GmailServiceConfig {
  client?: Partial<GmailClientConfig>;
  enableErrorHandling?: boolean;
  enableMonitoring?: boolean;
  authRefreshCallback?: () => Promise<void>;
}

export class GmailService {
  public readonly client: GmailClient;
  public readonly operations: GmailOperations;
  public readonly pipeline: GmailProcessingPipeline;
  public readonly errorHandler: GmailErrorHandler;

  constructor(
    gmail: gmail_v1.Gmail, 
    config: GmailServiceConfig = {}
  ) {
    // Initialize client
    this.client = new GmailClient(gmail, config.client);

    // Initialize operations
    this.operations = new GmailOperations(gmail);

    // Initialize processing pipeline
    this.pipeline = new GmailProcessingPipeline();

    // Initialize error handler
    this.errorHandler = createDefaultErrorHandler(config.authRefreshCallback);
  }

  /**
   * Health check for all Gmail services
   */
  async healthCheck(userId: string): Promise<{
    client: boolean;
    operations: boolean;
    auth: boolean;
    overall: boolean;
  }> {
    const results = {
      client: false,
      operations: false,
      auth: false,
      overall: false
    };

    try {
      // Test client
      const metrics = this.client.getMetrics();
      results.client = true;

      // Test operations
      const opsHealth = await this.operations.healthCheck(userId);
      results.operations = opsHealth.messageList && opsHealth.messageGet;

      // Test auth
      results.auth = await gmailAuth.isAuthenticated(userId);

      // Overall health
      results.overall = results.client && results.operations && results.auth;
    } catch (error) {
      console.warn('Gmail service health check failed:', error);
    }

    return results;
  }

  /**
   * Get comprehensive service statistics
   */
  getStats(): {
    client: import('./types').OperationMetrics;
    operations: { cacheSize: number; lastCleanup: Date | null };
    errorHandler: { circuitBreakerState: string; gmailStats: any };
  } {
    return {
      client: this.client.getMetrics(),
      operations: this.operations.getOperationStats(),
      errorHandler: this.errorHandler.getStats()
    };
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.client.resetMetrics();
    this.operations.cleanup();
    this.errorHandler.reset();
  }
}

/**
 * Create Gmail service with authentication
 */
export async function createGmailService(
  userId: string,
  config: GmailServiceConfig = {}
): Promise<GmailService> {
  // Get authenticated Gmail client
  const gmail = await gmailAuth.getGmailClient(userId);
  
  // Create service instance
  return new GmailService(gmail, config);
}

/**
 * Quick setup for common use cases
 */
export const GmailQuickSetup = {
  /**
   * Setup for receipt processing
   */
  async forReceiptProcessing(userId: string): Promise<GmailService> {
    return createGmailService(userId, {
      client: {
        defaultMaxResults: 50,
        retryAttempts: 3
      },
      enableErrorHandling: true,
      enableMonitoring: true
    });
  },

  /**
   * Setup for high-volume processing
   */
  async forHighVolume(userId: string): Promise<GmailService> {
    return createGmailService(userId, {
      client: {
        defaultMaxResults: 100,
        retryAttempts: 5,
        rateLimitBuffer: 0.9
      },
      enableErrorHandling: true,
      enableMonitoring: true
    });
  },

  /**
   * Setup for testing
   */
  async forTesting(userId: string): Promise<GmailService> {
    return createGmailService(userId, {
      client: {
        defaultMaxResults: 10,
        retryAttempts: 1,
        timeoutMs: 10000
      },
      enableErrorHandling: false,
      enableMonitoring: false
    });
  }
};