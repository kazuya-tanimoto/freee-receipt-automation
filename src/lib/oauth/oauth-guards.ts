/**
 * OAuth Type Guards
 * 
 * Type guard functions for OAuth type validation
 */

import {
  OAuthError,
  OAuthTokenResponse,
  OAuthProvider
} from './types';
import { GOOGLE_SCOPES } from './oauth-constants';

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard for OAuth error response
 */
export function isOAuthError(value: unknown): value is OAuthError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'error' in value &&
    typeof (value as any).error === 'string'
  );
}

/**
 * Type guard for OAuth token response
 */
export function isOAuthTokenResponse(value: unknown): value is OAuthTokenResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    'accessToken' in value &&
    'expiresIn' in value &&
    'tokenType' in value &&
    typeof (value as any).accessToken === 'string' &&
    typeof (value as any).expiresIn === 'number' &&
    typeof (value as any).tokenType === 'string'
  );
}

/**
 * Type guard for valid OAuth provider
 */
export function isValidOAuthProvider(value: string): value is OAuthProvider {
  return value === 'google';
}

/**
 * Type guard for valid OAuth scope
 */
export function isValidGoogleScope(scope: string): scope is string {
  return Object.values(GOOGLE_SCOPES).includes(scope as any);
}