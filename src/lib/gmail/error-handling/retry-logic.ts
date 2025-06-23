/**
 * Gmail Retry Logic
 * 
 * Advanced retry mechanisms with exponential backoff, circuit breaker patterns,
 * and intelligent error handling for robust Gmail API operations.
 */

import { GmailError } from '../types';
import { 
  isRetryableError, 
  getRetryDelay, 
  getMaxRetryAttempts,
  createGmailError 
} from './gmail-errors';
import { CircuitBreaker } from '../utils/exponential-backoff';

// ============================================================================
// Types
// ============================================================================

export interface RetryConfig {
  maxAttempts?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  jitter?: boolean;
  enableCircuitBreaker?: boolean;
}

export interface RetryContext {
  operation: string;
  attempt: number;
  maxAttempts: number;
  lastError?: GmailError;
  totalDuration: number;
  startTime: number;
}

export interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: GmailError;
  context: RetryContext;
}

// ============================================================================
// Retry Manager
// ============================================================================

export class RetryManager {
  private config: Required<RetryConfig>;
  private circuitBreaker: CircuitBreaker | null = null;

  constructor(config: Partial<RetryConfig> = {}) {
    this.config = {
      maxAttempts: config.maxAttempts || 3,
      baseDelay: config.baseDelay || 1000,
      maxDelay: config.maxDelay || 30000,
      backoffMultiplier: config.backoffMultiplier || 2,
      jitter: config.jitter ?? true,
      enableCircuitBreaker: config.enableCircuitBreaker ?? true
    };

    if (this.config.enableCircuitBreaker) {
      this.circuitBreaker = new CircuitBreaker(5, 60000); // 5 failures, 1 minute timeout
    }
  }

  /**
   * Execute operation with retry logic
   */
  async execute<T>(
    operation: () => Promise<T>,
    operationName: string,
    customConfig?: Partial<RetryConfig>
  ): Promise<T> {
    const config = { ...this.config, ...customConfig };
    const startTime = Date.now();
    
    let lastError: GmailError | undefined;
    let attempt = 0;

    while (attempt < config.maxAttempts) {
      const context: RetryContext = {
        operation: operationName,
        attempt: attempt + 1,
        maxAttempts: config.maxAttempts,
        lastError,
        totalDuration: Date.now() - startTime,
        startTime
      };

      try {
        // Check circuit breaker if enabled
        if (this.circuitBreaker) {
          const result = await this.circuitBreaker.execute(operation);
          return result;
        } else {
          const result = await operation();
          return result;
        }
      } catch (error) {
        attempt++;
        
        // Convert to GmailError if needed
        const gmailError = error instanceof GmailError 
          ? error 
          : createGmailError(error, operationName);
        
        lastError = gmailError;
        context.lastError = gmailError;

        // Check if error is retryable
        if (!isRetryableError(gmailError)) {
          throw gmailError;
        }

        // Check if we've exceeded max attempts
        if (attempt >= config.maxAttempts) {
          throw this.createRetryExhaustedError(gmailError, context);
        }

        // Calculate delay and wait
        const delay = this.calculateDelay(gmailError, attempt, config);
        await this.sleep(delay);
      }
    }

    // This should never be reached, but TypeScript requires it
    throw lastError || new GmailError('UNKNOWN', `Retry failed for ${operationName}`);
  }

  /**
   * Execute with custom retry strategy for specific error types
   */
  async executeWithStrategy<T>(
    operation: () => Promise<T>,
    operationName: string,
    strategy: 'aggressive' | 'conservative' | 'quota-aware'
  ): Promise<T> {
    let config: Partial<RetryConfig>;

    switch (strategy) {
      case 'aggressive':
        config = {
          maxAttempts: 5,
          baseDelay: 500,
          maxDelay: 10000,
          backoffMultiplier: 1.5
        };
        break;
      
      case 'conservative':
        config = {
          maxAttempts: 2,
          baseDelay: 2000,
          maxDelay: 60000,
          backoffMultiplier: 3
        };
        break;
      
      case 'quota-aware':
        config = {
          maxAttempts: 3,
          baseDelay: 5000,
          maxDelay: 300000, // 5 minutes
          backoffMultiplier: 2.5
        };
        break;
    }

    return this.execute(operation, operationName, config);
  }

  /**
   * Reset circuit breaker
   */
  resetCircuitBreaker(): void {
    this.circuitBreaker?.reset();
  }

  /**
   * Get circuit breaker state
   */
  getCircuitBreakerState(): 'closed' | 'open' | 'half-open' | 'disabled' {
    if (!this.circuitBreaker) {
      return 'disabled';
    }
    return this.circuitBreaker.getState();
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  /**
   * Calculate delay with backoff and jitter
   */
  private calculateDelay(
    error: GmailError, 
    attempt: number, 
    config: Required<RetryConfig>
  ): number {
    // Use error-specific delay if available
    const errorDelay = getRetryDelay(error, attempt);
    if (errorDelay > 0) {
      return this.applyJitter(errorDelay, config.jitter);
    }

    // Use configured backoff
    const delay = Math.min(
      config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1),
      config.maxDelay
    );

    return this.applyJitter(delay, config.jitter);
  }

  /**
   * Apply jitter to delay
   */
  private applyJitter(delay: number, enableJitter: boolean): number {
    if (!enableJitter) {
      return delay;
    }

    // Add random jitter of ±25%
    const jitterRange = delay * 0.25;
    const jitter = (Math.random() - 0.5) * 2 * jitterRange;
    
    return Math.max(0, delay + jitter);
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Create error when retries are exhausted
   */
  private createRetryExhaustedError(
    lastError: GmailError, 
    context: RetryContext
  ): GmailError {
    return new GmailError(
      'UNKNOWN',
      `Operation ${context.operation} failed after ${context.maxAttempts} attempts. ` +
      `Last error: ${lastError.message}`,
      lastError
    );
  }
}

// ============================================================================
// Specialized Retry Utilities
// ============================================================================

/**
 * Retry specifically for quota/rate limit errors
 */
export class QuotaRetryManager extends RetryManager {
  constructor() {
    super({
      maxAttempts: 3,
      baseDelay: 5000, // 5 seconds
      maxDelay: 300000, // 5 minutes
      backoffMultiplier: 2.5,
      jitter: true,
      enableCircuitBreaker: true
    });
  }

  /**
   * Execute with quota-aware retry logic
   */
  async executeQuotaAware<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    return this.execute(operation, operationName);
  }
}

/**
 * Retry specifically for authentication errors
 */
export class AuthRetryManager extends RetryManager {
  private authRefreshCallback?: () => Promise<void>;

  constructor(authRefreshCallback?: () => Promise<void>) {
    super({
      maxAttempts: 2,
      baseDelay: 1000,
      maxDelay: 5000,
      backoffMultiplier: 2,
      jitter: false,
      enableCircuitBreaker: false
    });
    
    this.authRefreshCallback = authRefreshCallback;
  }

  /**
   * Execute with authentication retry logic
   */
  async executeWithAuth<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      const gmailError = error instanceof GmailError 
        ? error 
        : createGmailError(error, operationName);

      // Try to refresh auth if we have a callback
      if (this.shouldRefreshAuth(gmailError) && this.authRefreshCallback) {
        try {
          await this.authRefreshCallback();
          return await operation(); // Retry once after auth refresh
        } catch (refreshError) {
          throw gmailError; // Return original error if refresh fails
        }
      }

      throw gmailError;
    }
  }

  /**
   * Check if error indicates need for auth refresh
   */
  private shouldRefreshAuth(error: GmailError): boolean {
    return error.code === 'AUTHENTICATION_FAILED' || 
           error.code === 'INVALID_TOKEN';
  }
}

// ============================================================================
// Default Retry Managers
// ============================================================================

export const defaultRetryManager = new RetryManager();
export const quotaRetryManager = new QuotaRetryManager();

/**
 * Create auth retry manager with refresh callback
 */
export function createAuthRetryManager(
  authRefreshCallback: () => Promise<void>
): AuthRetryManager {
  return new AuthRetryManager(authRefreshCallback);
}