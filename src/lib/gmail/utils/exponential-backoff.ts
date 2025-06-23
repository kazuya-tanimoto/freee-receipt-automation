/**
 * Exponential Backoff Utility
 * 
 * Robust retry mechanism with exponential backoff, jitter, and circuit breaker patterns
 * for reliable Gmail API operations under various failure conditions.
 */

import { BackoffConfig } from '../types';

// ============================================================================
// Exponential Backoff Implementation
// ============================================================================

export class ExponentialBackoff {
  private config: BackoffConfig;
  private attempt: number = 0;

  constructor(config: BackoffConfig) {
    this.config = {
      initialDelay: Math.max(100, config.initialDelay),
      maxDelay: Math.max(config.initialDelay, config.maxDelay),
      multiplier: Math.max(1.1, config.multiplier),
      jitter: Math.max(0, Math.min(1, config.jitter))
    };
  }

  /**
   * Execute operation with exponential backoff retry logic
   */
  async execute<T>(
    operation: () => Promise<T>,
    maxAttempts: number = 3,
    shouldRetry?: (error: any) => boolean
  ): Promise<T> {
    this.attempt = 0;
    let lastError: any;

    while (this.attempt < maxAttempts) {
      try {
        const result = await operation();
        this.attempt = 0; // Reset on success
        return result;
      } catch (error) {
        lastError = error;
        this.attempt++;

        // Check if we should retry this error
        if (shouldRetry && !shouldRetry(error)) {
          throw error;
        }

        // Don't retry on the last attempt
        if (this.attempt >= maxAttempts) {
          break;
        }

        // Calculate delay with exponential backoff and jitter
        const delay = this.calculateDelay();
        await this.sleep(delay);
      }
    }

    throw lastError;
  }

  /**
   * Calculate delay with exponential backoff and jitter
   */
  private calculateDelay(): number {
    const exponentialDelay = this.config.initialDelay * 
      Math.pow(this.config.multiplier, this.attempt - 1);
    
    const clampedDelay = Math.min(exponentialDelay, this.config.maxDelay);
    
    // Add jitter to prevent thundering herd
    const jitterAmount = clampedDelay * this.config.jitter;
    const jitter = (Math.random() - 0.5) * 2 * jitterAmount;
    
    return Math.max(0, clampedDelay + jitter);
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Reset attempt counter
   */
  reset(): void {
    this.attempt = 0;
  }

  /**
   * Get current attempt number
   */
  getCurrentAttempt(): number {
    return this.attempt;
  }
}

// ============================================================================
// Circuit Breaker Pattern
// ============================================================================

export class CircuitBreaker {
  private failures: number = 0;
  private lastFailureTime: number = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';

  constructor(
    private failureThreshold: number = 5,
    private timeout: number = 60000 // 1 minute
  ) {}

  /**
   * Execute operation with circuit breaker protection
   */
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'half-open';
      } else {
        throw new Error('Circuit breaker is open');
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  /**
   * Handle successful operation
   */
  private onSuccess(): void {
    this.failures = 0;
    this.state = 'closed';
  }

  /**
   * Handle failed operation
   */
  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.failureThreshold) {
      this.state = 'open';
    }
  }

  /**
   * Get current state
   */
  getState(): 'closed' | 'open' | 'half-open' {
    return this.state;
  }

  /**
   * Reset circuit breaker
   */
  reset(): void {
    this.failures = 0;
    this.lastFailureTime = 0;
    this.state = 'closed';
  }
}

// ============================================================================
// Retry Utilities
// ============================================================================

/**
 * Check if error is retryable for Gmail operations
 */
export function isRetryableGmailError(error: any): boolean {
  // Network errors are retryable
  if (error.code === 'ENOTFOUND' || error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
    return true;
  }

  // HTTP status codes that are retryable
  const retryableStatusCodes = [429, 500, 502, 503, 504];
  if (error.status && retryableStatusCodes.includes(error.status)) {
    return true;
  }

  // Gmail API specific errors that are retryable
  if (error.message) {
    const retryableMessages = [
      'rateLimitExceeded',
      'userRateLimitExceeded',
      'quotaExceeded',
      'backendError',
      'internalError'
    ];
    
    return retryableMessages.some(msg => error.message.includes(msg));
  }

  return false;
}

/**
 * Create default backoff config for Gmail operations
 */
export function createDefaultBackoffConfig(): BackoffConfig {
  return {
    initialDelay: 1000,    // 1 second
    maxDelay: 30000,       // 30 seconds
    multiplier: 2.0,       // Double each time
    jitter: 0.1            // 10% jitter
  };
}

/**
 * Create aggressive backoff config for quota issues
 */
export function createQuotaBackoffConfig(): BackoffConfig {
  return {
    initialDelay: 5000,    // 5 seconds
    maxDelay: 300000,      // 5 minutes
    multiplier: 2.5,       // More aggressive
    jitter: 0.2            // 20% jitter
  };
}