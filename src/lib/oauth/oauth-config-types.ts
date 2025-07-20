/**
 * OAuth Configuration Types
 * 
 * Configuration, storage, and rate limiting type definitions
 */

import {
  OAuthProvider,
  CodeChallengeMethod,
  TokenType
} from './types';

// ============================================================================
// Internal OAuth Storage Types
// ============================================================================

/**
 * PKCE parameters for temporary storage
 */
export interface PKCEParams {
  /** PKCE code verifier */
  codeVerifier: string;
  /** PKCE code challenge */
  codeChallenge: string;
  /** Code challenge method */
  codeChallengeMethod: CodeChallengeMethod;
  /** CSRF state parameter */
  state: string;
  /** Expiry timestamp */
  expiresAt: Date;
}

/**
 * Stored OAuth tokens
 */
export interface StoredOAuthTokens {
  /** Encrypted access token */
  accessToken: string;
  /** Encrypted refresh token */
  refreshToken?: string;
  /** Token expiry timestamp */
  expiresAt: Date;
  /** Granted scopes */
  scope: string;
  /** Token type */
  tokenType: TokenType;
  /** Provider identifier */
  provider: OAuthProvider;
}

// ============================================================================
// Provider Configuration Types
// ============================================================================

/**
 * OAuth provider configuration
 */
export interface OAuthProviderConfig {
  /** Provider name */
  name: OAuthProvider;
  /** Client ID */
  clientId: string;
  /** Client secret */
  clientSecret: string;
  /** Authorization endpoint */
  authorizationEndpoint: string;
  /** Token endpoint */
  tokenEndpoint: string;
  /** Default scopes */
  defaultScopes: string[];
  /** Supported scopes */
  supportedScopes: string[];
}

/**
 * Google OAuth provider configuration
 */
export interface GoogleOAuthConfig extends OAuthProviderConfig {
  name: 'google';
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth';
  tokenEndpoint: 'https://oauth2.googleapis.com/token';
  userInfoEndpoint?: string;
  revokeEndpoint?: string;
}

// ============================================================================
// Rate Limiting Types
// ============================================================================

/**
 * Rate limit information
 */
export interface RateLimitInfo {
  /** Remaining requests in current window */
  remaining: number;
  /** Total requests allowed in window */
  limit: number;
  /** Window reset timestamp */
  resetAt: Date;
  /** Current window duration in seconds */
  windowDuration: number;
}

/**
 * API quota information
 */
export interface QuotaInfo {
  /** Used quota units */
  used: number;
  /** Total quota units */
  total: number;
  /** Quota reset timestamp */
  resetAt: Date;
  /** Quota user identifier */
  quotaUser?: string;
}