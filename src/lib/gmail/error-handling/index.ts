/**
 * Gmail Error Handling Module
 * 
 * Centralized exports for all Gmail error handling components including
 * error definitions, retry logic, and monitoring integration.
 */

// Error definitions and utilities
export { 
  createGmailError,
  isRetryableError,
  getRetryDelay,
  getMaxRetryAttempts,
  getUserFriendlyMessage,
  extractErrorContext,
  needsReAuthentication,
  isQuotaError,
  getErrorSeverity
} from './gmail-errors';

// Retry managers and logic
export {
  RetryManager,
  QuotaRetryManager,
  AuthRetryManager,
  defaultRetryManager,
  quotaRetryManager,
  createAuthRetryManager
} from './retry-logic';

// Monitoring and metrics
export {
  GmailMonitor,
  gmailMonitor,
  recordGmailOperation,
  getGmailStats,
  isGmailQuotaNearlyExhausted,
  resetGmailQuota
} from './monitoring';

// Re-export types for convenience
export type {
  RetryConfig,
  RetryContext,
  RetryResult
} from './retry-logic';

export type {
  GmailOperationMetrics,
  GmailQuotaAlert,
  GmailMonitoringStats
} from './monitoring';

/**
 * Unified Error Handler
 * 
 * Provides a single interface for handling all Gmail errors with
 * automatic retry logic, monitoring, and recovery strategies.
 */
import { GmailError } from '../types';
import { 
  RetryManager as RM, 
  QuotaRetryManager as QRM, 
  AuthRetryManager as ARM, 
  defaultRetryManager as drm, 
  quotaRetryManager as qrm, 
  createAuthRetryManager as carm 
} from './retry-logic';
import { 
  createGmailError as cge, 
  isRetryableError, 
  getRetryDelay, 
  getMaxRetryAttempts, 
  getUserFriendlyMessage, 
  extractErrorContext, 
  needsReAuthentication, 
  isQuotaError, 
  getErrorSeverity 
} from './gmail-errors';
import { 
  gmailMonitor as gm, 
  recordGmailOperation as rgo, 
  getGmailStats as ggs, 
  isGmailQuotaNearlyExhausted, 
  resetGmailQuota as rgq 
} from './monitoring';
import type { 
  GmailMonitoringStats as GMS 
} from './monitoring';

export interface ErrorHandlerConfig {
  enableRetry?: boolean;
  enableMonitoring?: boolean;
  enableCircuitBreaker?: boolean;
  maxRetryAttempts?: number;
  authRefreshCallback?: () => Promise<void>;
}

export class GmailErrorHandler {
  private retryManager: RM;
  private authRetryManager?: ARM;
  private config: Required<Omit<ErrorHandlerConfig, 'authRefreshCallback'>>;

  constructor(config: ErrorHandlerConfig = {}) {
    this.config = {
      enableRetry: config.enableRetry ?? true,
      enableMonitoring: config.enableMonitoring ?? true,
      enableCircuitBreaker: config.enableCircuitBreaker ?? true,
      maxRetryAttempts: config.maxRetryAttempts ?? 3
    };

    this.retryManager = new RM({
      maxAttempts: this.config.maxRetryAttempts,
      enableCircuitBreaker: this.config.enableCircuitBreaker
    });

    if (config.authRefreshCallback) {
      this.authRetryManager = carm(config.authRefreshCallback);
    }
  }

  /**
   * Execute operation with comprehensive error handling
   */
  async executeWithErrorHandling<T>(
    operation: () => Promise<T>,
    operationName: string,
    options: {
      quotaUsed?: number;
      enableAuthRetry?: boolean;
      customRetryStrategy?: 'aggressive' | 'conservative' | 'quota-aware';
    } = {}
  ): Promise<T> {
    const startTime = Date.now();
    let result: T;
    let error: GmailError | undefined;

    try {
      // Choose retry strategy
      if (options.customRetryStrategy && this.config.enableRetry) {
        result = await this.retryManager.executeWithStrategy(
          operation, 
          operationName, 
          options.customRetryStrategy
        );
      } else if (options.enableAuthRetry && this.authRetryManager) {
        result = await this.authRetryManager.executeWithAuth(operation, operationName);
      } else if (this.config.enableRetry) {
        result = await this.retryManager.execute(operation, operationName);
      } else {
        result = await operation();
      }
    } catch (err) {
      error = err instanceof GmailError ? err : cge(err, operationName);
      throw error;
    } finally {
      // Record metrics if monitoring is enabled
      if (this.config.enableMonitoring) {
        rgo(
          operationName,
          !error,
          options.quotaUsed || 0,
          error
        );
      }
    }

    return result;
  }

  /**
   * Handle specific error types with specialized logic
   */
  async handleSpecificError<T>(
    operation: () => Promise<T>,
    operationName: string,
    errorType: 'quota' | 'auth' | 'network'
  ): Promise<T> {
    switch (errorType) {
      case 'quota':
        return this.executeWithErrorHandling(operation, operationName, {
          customRetryStrategy: 'quota-aware'
        });
      
      case 'auth':
        return this.executeWithErrorHandling(operation, operationName, {
          enableAuthRetry: true
        });
      
      case 'network':
        return this.executeWithErrorHandling(operation, operationName, {
          customRetryStrategy: 'aggressive'
        });
      
      default:
        return this.executeWithErrorHandling(operation, operationName);
    }
  }

  /**
   * Get error handler statistics
   */
  getStats(): {
    circuitBreakerState: string;
    gmailStats: GMS;
  } {
    return {
      circuitBreakerState: this.retryManager.getCircuitBreakerState(),
      gmailStats: ggs()
    };
  }

  /**
   * Reset error handler state
   */
  reset(): void {
    this.retryManager.resetCircuitBreaker();
    rgq();
  }
}

/**
 * Create default error handler instance
 */
export function createDefaultErrorHandler(
  authRefreshCallback?: () => Promise<void>
): GmailErrorHandler {
  return new GmailErrorHandler({
    enableRetry: true,
    enableMonitoring: true,
    enableCircuitBreaker: true,
    maxRetryAttempts: 3,
    authRefreshCallback
  });
}