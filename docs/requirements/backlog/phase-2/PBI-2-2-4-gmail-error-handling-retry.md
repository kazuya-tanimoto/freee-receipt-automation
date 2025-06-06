# PBI-2-2-4: Gmail Error Handling and Retry Logic

## Description
Implement comprehensive error handling and retry mechanisms for Gmail API operations. This ensures robust operation under various failure conditions including API rate limits, network issues, and temporary service unavailability.

## Implementation Details

### Files to Create/Modify
1. `src/lib/gmail/error-handler.ts` - Gmail-specific error handling
2. `src/lib/gmail/retry-strategy.ts` - Retry logic implementation
3. `src/lib/gmail/circuit-breaker.ts` - Circuit breaker for Gmail API
4. `src/lib/common/retry-config.ts` - Configurable retry strategies
5. `src/lib/common/error-types.ts` - Error classification system
6. `docs/gmail/error-handling.md` - Error handling documentation

### Technical Requirements
- Implement exponential backoff for transient failures
- Handle Gmail API rate limiting with proper delays
- Implement circuit breaker pattern for sustained failures
- Classify errors as retryable vs. non-retryable
- Provide detailed error reporting and logging

### Error Classification
```typescript
export enum ErrorType {
  // Retryable errors
  RATE_LIMIT = 'RATE_LIMIT',
  NETWORK_ERROR = 'NETWORK_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  TIMEOUT = 'TIMEOUT',
  
  // Non-retryable errors
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  INVALID_REQUEST = 'INVALID_REQUEST',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED'
}

export class GmailErrorHandler {
  classifyError(error: any): { type: ErrorType; retryable: boolean; delay?: number } {
    // Google API errors
    if (error.code === 429 || error.status === 429) {
      return {
        type: ErrorType.RATE_LIMIT,
        retryable: true,
        delay: this.calculateRateLimitDelay(error)
      };
    }
    
    if (error.code === 401 || error.status === 401) {
      return {
        type: ErrorType.AUTHENTICATION_ERROR,
        retryable: false
      };
    }
    
    if (error.code === 403 || error.status === 403) {
      return {
        type: ErrorType.PERMISSION_DENIED,
        retryable: false
      };
    }
    
    if (error.code >= 500 || error.status >= 500) {
      return {
        type: ErrorType.SERVICE_UNAVAILABLE,
        retryable: true,
        delay: 1000 // Start with 1 second delay
      };
    }
    
    // Network errors
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNRESET') {
      return {
        type: ErrorType.NETWORK_ERROR,
        retryable: true,
        delay: 2000
      };
    }
    
    // Default to non-retryable
    return {
      type: ErrorType.INVALID_REQUEST,
      retryable: false
    };
  }
  
  private calculateRateLimitDelay(error: any): number {
    // Check for Retry-After header
    const retryAfter = error.response?.headers['retry-after'];
    if (retryAfter) {
      return parseInt(retryAfter) * 1000; // Convert to milliseconds
    }
    
    // Default exponential backoff
    return 60000; // 1 minute for rate limits
  }
}
```

### Retry Strategy Implementation
```typescript
export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  exponentialFactor: number;
  jitterFactor: number;
}

export class RetryStrategy {
  constructor(private config: RetryConfig, private errorHandler: GmailErrorHandler) {}
  
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    context: string
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= this.config.maxAttempts; attempt++) {
      try {
        const result = await operation();
        
        // Log successful retry
        if (attempt > 1) {
          this.logger.info('Operation succeeded after retry', {
            context,
            attempt,
            totalAttempts: this.config.maxAttempts
          });
        }
        
        return result;
      } catch (error) {
        lastError = error;
        
        // Classify error
        const errorInfo = this.errorHandler.classifyError(error);
        
        // Log error
        this.logger.warn('Operation failed', {
          context,
          attempt,
          errorType: errorInfo.type,
          retryable: errorInfo.retryable,
          error: error.message
        });
        
        // Don't retry non-retryable errors
        if (!errorInfo.retryable) {
          throw new NonRetryableError(errorInfo.type, error.message);
        }
        
        // Don't retry on last attempt
        if (attempt === this.config.maxAttempts) {
          break;
        }
        
        // Calculate delay
        const delay = this.calculateDelay(attempt, errorInfo.delay);
        
        this.logger.info('Retrying operation', {
          context,
          attempt: attempt + 1,
          delayMs: delay
        });
        
        await this.sleep(delay);
      }
    }
    
    throw new MaxRetriesExceededError(this.config.maxAttempts, lastError);
  }
  
  private calculateDelay(attempt: number, errorDelay?: number): number {
    // Use error-specific delay if provided
    if (errorDelay) {
      return errorDelay;
    }
    
    // Exponential backoff with jitter
    const exponentialDelay = this.config.baseDelay * 
      Math.pow(this.config.exponentialFactor, attempt - 1);
    
    const jitter = exponentialDelay * this.config.jitterFactor * Math.random();
    const totalDelay = exponentialDelay + jitter;
    
    return Math.min(totalDelay, this.config.maxDelay);
  }
  
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

### Circuit Breaker Pattern
```typescript
export class GmailCircuitBreaker {
  private failureCount = 0;
  private lastFailureTime?: Date;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  
  constructor(
    private failureThreshold: number = 5,
    private timeoutMs: number = 60000, // 1 minute
    private logger: Logger
  ) {}
  
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (this.shouldAttemptReset()) {
        this.state = 'HALF_OPEN';
        this.logger.info('Circuit breaker transitioning to HALF_OPEN');
      } else {
        throw new CircuitBreakerOpenError('Gmail API circuit breaker is OPEN');
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
  
  private shouldAttemptReset(): boolean {
    return this.lastFailureTime && 
      (Date.now() - this.lastFailureTime.getTime()) > this.timeoutMs;
  }
  
  private onSuccess(): void {
    this.failureCount = 0;
    this.state = 'CLOSED';
    this.logger.info('Circuit breaker reset to CLOSED');
  }
  
  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = new Date();
    
    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
      this.logger.error('Circuit breaker opened due to failures', {
        failureCount: this.failureCount,
        threshold: this.failureThreshold
      });
    }
  }
}
```

### Integration with Gmail Operations
```typescript
export class RobustGmailOperations extends GmailOperations {
  constructor(
    client: gmail_v1.Gmail,
    private retryStrategy: RetryStrategy,
    private circuitBreaker: GmailCircuitBreaker
  ) {
    super(client);
  }
  
  async searchEmails(options: GmailSearchOptions): Promise<EmailSearchResult> {
    return this.circuitBreaker.execute(() =>
      this.retryStrategy.executeWithRetry(
        () => super.searchEmails(options),
        'gmail.searchEmails'
      )
    );
  }
  
  async getEmailDetails(messageId: string): Promise<EmailDetails> {
    return this.circuitBreaker.execute(() =>
      this.retryStrategy.executeWithRetry(
        () => super.getEmailDetails(messageId),
        'gmail.getEmailDetails'
      )
    );
  }
  
  async getEmailAttachments(messageId: string): Promise<EmailAttachment[]> {
    return this.circuitBreaker.execute(() =>
      this.retryStrategy.executeWithRetry(
        () => super.getEmailAttachments(messageId),
        'gmail.getEmailAttachments'
      )
    );
  }
}
```

### Error Configuration
```typescript
export const GMAIL_RETRY_CONFIG: Record<string, RetryConfig> = {
  search: {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    exponentialFactor: 2,
    jitterFactor: 0.1
  },
  download: {
    maxAttempts: 5,
    baseDelay: 2000,
    maxDelay: 30000,
    exponentialFactor: 2,
    jitterFactor: 0.2
  },
  rateLimit: {
    maxAttempts: 3,
    baseDelay: 60000, // 1 minute
    maxDelay: 300000, // 5 minutes
    exponentialFactor: 2,
    jitterFactor: 0.1
  }
};
```

### Interface Specifications
- **Input Interfaces**: Wraps Gmail operations from PBI-2-2-2
- **Output Interfaces**: Provides robust Gmail operations
  ```typescript
  export interface ErrorContext {
    operation: string;
    attempt: number;
    maxAttempts: number;
    errorType: ErrorType;
    retryDelay?: number;
  }
  
  export class NonRetryableError extends Error {
    constructor(public errorType: ErrorType, message: string) {
      super(message);
      this.name = 'NonRetryableError';
    }
  }
  
  export class MaxRetriesExceededError extends Error {
    constructor(public maxAttempts: number, public lastError: Error) {
      super(`Max retries (${maxAttempts}) exceeded. Last error: ${lastError.message}`);
      this.name = 'MaxRetriesExceededError';
    }
  }
  ```

## Metadata
- **Status**: Not Started
- **Actual Story Points**: [To be filled after completion]
- **Created**: 2025-06-04
- **Started**: [Date]
- **Completed**: [Date]
- **Owner**: [AI Assistant ID or Human]
- **Reviewer**: [Who reviewed this PBI]
- **Implementation Notes**: [Post-completion learnings]

## Acceptance Criteria
- [ ] Rate limiting errors are handled with appropriate delays
- [ ] Transient failures are retried with exponential backoff
- [ ] Non-retryable errors fail immediately without retry
- [ ] Circuit breaker opens after sustained failures
- [ ] All error scenarios are logged with appropriate detail
- [ ] Error handling configuration is externally configurable

### Verification Commands
```bash
# Test error handling scenarios
npm run test:gmail -- --grep "error handling"
# Test retry mechanisms
npm run test:retry-logic
# Simulate rate limiting
npm run test:rate-limit-simulation
```

## Dependencies
- **Required**: PBI-2-2-2 - Gmail basic operations to wrap
- **Required**: PBI-2-1-3 - Observability for error logging

## Testing Requirements
- Unit tests: Test error classification and retry logic
- Integration tests: Test error handling with mock failures
- Test data: Various Gmail API error responses

## Estimate
1 story point

## Priority
High - Robust error handling critical for production reliability

## Implementation Notes
- Monitor Gmail API quotas and adjust retry strategies accordingly
- Implement proper error aggregation for monitoring dashboards
- Consider implementing jitter in retry delays to avoid thundering herd
- Add metrics for error rates and retry success rates
- Test error handling scenarios in staging environment
- Document common error scenarios and troubleshooting steps
