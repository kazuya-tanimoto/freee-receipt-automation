/**
 * Gmail Error Handling
 * 
 * Comprehensive error definitions and handling utilities for Gmail API
 * operations with proper error categorization and recovery guidance.
 */

import { GmailError, GmailErrorCode } from '../types';

// Re-export for convenience
export { GmailError };
export type { GmailErrorCode };

// ============================================================================
// Error Factory Functions
// ============================================================================

/**
 * Create appropriate Gmail error based on API response
 */
export function createGmailError(
  error: any,
  operation: string,
  context?: Record<string, any>
): GmailError {
  // Handle Google API errors
  if (error.response?.status) {
    switch (error.response.status) {
      case 400:
        return new GmailError(
          'API_ERROR',
          `Bad request for ${operation}: ${error.response.data?.error?.message || error.message}`,
          error
        );
      case 401:
        return new GmailError(
          'AUTHENTICATION_FAILED',
          `Authentication failed for ${operation}: Token may be expired or invalid`,
          error
        );
      case 403:
        if (error.response.data?.error?.message?.includes('quota')) {
          return new GmailError(
            'QUOTA_EXCEEDED',
            `Quota exceeded for ${operation}: Daily limit reached`,
            error
          );
        } else if (error.response.data?.error?.message?.includes('scope')) {
          return new GmailError(
            'INSUFFICIENT_SCOPE',
            `Insufficient scope for ${operation}: Missing required permissions`,
            error
          );
        } else {
          return new GmailError(
            'AUTHENTICATION_FAILED',
            `Access forbidden for ${operation}: Insufficient permissions`,
            error
          );
        }
      case 404:
        return new GmailError(
          'NOT_FOUND',
          `Resource not found for ${operation}: The requested item may have been deleted`,
          error
        );
      case 429:
        return new GmailError(
          'RATE_LIMITED',
          `Rate limit exceeded for ${operation}: Too many requests`,
          error
        );
      case 500:
      case 502:
      case 503:
      case 504:
        return new GmailError(
          'API_ERROR',
          `Gmail API server error for ${operation}: Please try again later`,
          error
        );
      default:
        return new GmailError(
          'UNKNOWN',
          `Unknown HTTP error ${error.response.status} for ${operation}`,
          error
        );
    }
  }

  // Handle network/timeout errors
  if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
    return new GmailError(
      'API_ERROR',
      `Network error for ${operation}: Cannot reach Gmail API`,
      error
    );
  }

  if (error.code === 'ETIMEDOUT' || error.message?.includes('timeout')) {
    return new GmailError(
      'TIMEOUT',
      `Timeout error for ${operation}: Request took too long`,
      error
    );
  }

  // Handle OAuth/token errors
  if (error.message?.includes('invalid_token') || error.message?.includes('token')) {
    return new GmailError(
      'INVALID_TOKEN',
      `Invalid token for ${operation}: Please re-authenticate`,
      error
    );
  }

  // Default to unknown error
  return new GmailError(
    'UNKNOWN',
    `Unknown error for ${operation}: ${error.message || 'Unexpected error occurred'}`,
    error
  );
}

// ============================================================================
// Error Recovery Utilities
// ============================================================================

/**
 * Determine if error is retryable
 */
export function isRetryableError(error: GmailError): boolean {
  const retryableCodes: GmailErrorCode[] = [
    'RATE_LIMITED',
    'TIMEOUT',
    'API_ERROR'
  ];

  return retryableCodes.includes(error.code);
}

/**
 * Get recommended delay before retry (in milliseconds)
 */
export function getRetryDelay(error: GmailError, attempt: number): number {
  const baseDelay = 1000; // 1 second
  const maxDelay = 60000; // 1 minute

  switch (error.code) {
    case 'RATE_LIMITED':
      // Exponential backoff for rate limiting with longer delays
      return Math.min(baseDelay * Math.pow(2, attempt) * 3, maxDelay);
    
    case 'TIMEOUT':
      // Linear increase for timeouts
      return Math.min(baseDelay * (attempt + 1), maxDelay);
    
    case 'API_ERROR':
      // Standard exponential backoff
      return Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
    
    default:
      return baseDelay;
  }
}

/**
 * Get maximum retry attempts for error type
 */
export function getMaxRetryAttempts(error: GmailError): number {
  switch (error.code) {
    case 'RATE_LIMITED':
      return 5; // More attempts for rate limiting
    
    case 'TIMEOUT':
      return 3; // Moderate attempts for timeouts
    
    case 'API_ERROR':
      return 3; // Standard retry count
    
    case 'AUTHENTICATION_FAILED':
    case 'QUOTA_EXCEEDED':
    case 'NOT_FOUND':
    case 'INVALID_TOKEN':
    case 'INSUFFICIENT_SCOPE':
      return 0; // Don't retry these errors
    
    default:
      return 1; // Single retry for unknown errors
  }
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyMessage(error: GmailError): string {
  switch (error.code) {
    case 'AUTHENTICATION_FAILED':
      return 'Please sign in to your Gmail account again. Your session may have expired.';
    
    case 'QUOTA_EXCEEDED':
      return 'Gmail API quota exceeded. Please try again later or contact support.';
    
    case 'RATE_LIMITED':
      return 'Too many requests to Gmail. Please wait a moment and try again.';
    
    case 'NOT_FOUND':
      return 'The requested email or attachment could not be found. It may have been deleted.';
    
    case 'TIMEOUT':
      return 'The request took too long to complete. Please check your internet connection and try again.';
    
    case 'INVALID_TOKEN':
      return 'Your Gmail access token is invalid. Please sign in again.';
    
    case 'INSUFFICIENT_SCOPE':
      return 'Insufficient permissions to access Gmail. Please re-authorize the application.';
    
    case 'API_ERROR':
      return 'Gmail API is experiencing issues. Please try again later.';
    
    default:
      return 'An unexpected error occurred while accessing Gmail. Please try again.';
  }
}

// ============================================================================
// Error Context Utilities
// ============================================================================

/**
 * Extract relevant context from error for logging
 */
export function extractErrorContext(error: GmailError, operation: string): Record<string, any> {
  const context: Record<string, any> = {
    errorCode: error.code,
    operation,
    message: error.message,
    timestamp: new Date().toISOString()
  };

  // Add original error details if available
  if (error.originalError) {
    const original = error.originalError as any;
    
    if (original.response) {
      context.httpStatus = original.response.status;
      context.httpStatusText = original.response.statusText;
      
      if (original.response.data?.error) {
        context.apiError = original.response.data.error;
      }
    }
    
    if (original.code) {
      context.networkCode = original.code;
    }
    
    if (original.config) {
      context.requestUrl = original.config.url;
      context.requestMethod = original.config.method;
    }
  }

  return context;
}

/**
 * Check if error indicates need for re-authentication
 */
export function needsReAuthentication(error: GmailError): boolean {
  const authErrorCodes: GmailErrorCode[] = [
    'AUTHENTICATION_FAILED',
    'INVALID_TOKEN',
    'INSUFFICIENT_SCOPE'
  ];

  return authErrorCodes.includes(error.code);
}

/**
 * Check if error indicates quota issues
 */
export function isQuotaError(error: GmailError): boolean {
  return error.code === 'QUOTA_EXCEEDED' || error.code === 'RATE_LIMITED';
}

/**
 * Get error severity level
 */
export function getErrorSeverity(error: GmailError): 'low' | 'medium' | 'high' | 'critical' {
  switch (error.code) {
    case 'AUTHENTICATION_FAILED':
    case 'INVALID_TOKEN':
    case 'INSUFFICIENT_SCOPE':
      return 'high'; // User action required
    
    case 'QUOTA_EXCEEDED':
      return 'critical'; // Service degradation
    
    case 'RATE_LIMITED':
      return 'medium'; // Temporary issue
    
    case 'NOT_FOUND':
      return 'low'; // Data issue, not service issue
    
    case 'TIMEOUT':
    case 'API_ERROR':
      return 'medium'; // Potential service issue
    
    default:
      return 'medium'; // Unknown severity
  }
}