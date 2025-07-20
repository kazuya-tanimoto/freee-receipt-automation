/**
 * OAuth2.0 Type Definitions
 * 
 * Core type definitions for OAuth2.0 authentication flows
 * with PKCE support for Gmail and Google Drive integration.
 */

// Re-export from split files
export * from './oauth-constants';
export * from './oauth-guards';
export * from './oauth-config-types';

// Import types needed in this file
import { OAuthProviderConfig } from './oauth-config-types';

// ============================================================================
// Core OAuth Types
// ============================================================================

/**
 * Supported OAuth providers
 */
export type OAuthProvider = 'google';

/**
 * OAuth grant types
 */
export type GrantType = 
  | 'authorization_code'
  | 'refresh_token';

/**
 * PKCE code challenge methods
 */
export type CodeChallengeMethod = 'S256';

/**
 * OAuth token types
 */
export type TokenType = 'Bearer';

// ============================================================================
// OAuth Request/Response Types
// ============================================================================

/**
 * OAuth authorization initiation request
 */
export interface OAuthInitiateRequest {
  /** OAuth provider identifier */
  provider: OAuthProvider;
  /** Requested OAuth scopes */
  scopes: string[];
  /** OAuth redirect URI */
  redirectUri?: string;
}

/**
 * OAuth authorization initiation response
 */
export interface OAuthInitiateResponse {
  /** Authorization URL for user consent */
  authorizationUrl: string;
  /** CSRF protection state parameter */
  state: string;
  /** PKCE code challenge */
  codeChallenge: string;
  /** PKCE code challenge method */
  codeChallengeMethod: CodeChallengeMethod;
}

/**
 * OAuth callback request
 */
export interface OAuthCallbackRequest {
  /** Authorization code from OAuth provider */
  code: string;
  /** State parameter for CSRF protection */
  state: string;
  /** PKCE code verifier */
  codeVerifier: string;
  /** OAuth redirect URI used in authorization */
  redirectUri?: string;
}

/**
 * OAuth token refresh request
 */
export interface OAuthRefreshRequest {
  /** Refresh token for obtaining new access token */
  refreshToken: string;
}

/**
 * OAuth token response
 */
export interface OAuthTokenResponse {
  /** OAuth access token */
  accessToken: string;
  /** OAuth refresh token (if available) */
  refreshToken?: string;
  /** Access token expiry time in seconds */
  expiresIn: number;
  /** Token type */
  tokenType: TokenType;
  /** Granted scopes */
  scope?: string;
}


// ============================================================================
// OAuth Provider Interface
// ============================================================================

/**
 * Abstract OAuth provider interface
 */
export interface IOAuthProvider {
  /** Provider configuration */
  readonly config: OAuthProviderConfig;
  
  /**
   * Generate authorization URL with PKCE
   */
  generateAuthorizationUrl(params: {
    scopes: string[];
    redirectUri: string;
    state: string;
    codeChallenge: string;
    codeChallengeMethod: CodeChallengeMethod;
  }): string;
  
  /**
   * Exchange authorization code for tokens
   */
  exchangeCodeForTokens(params: {
    code: string;
    redirectUri: string;
    codeVerifier: string;
  }): Promise<OAuthTokenResponse>;
  
  /**
   * Refresh access token
   */
  refreshAccessToken(refreshToken: string): Promise<OAuthTokenResponse>;
  
  /**
   * Validate token and get user info
   */
  validateToken(accessToken: string): Promise<OAuthUserInfo>;
  
  /**
   * Revoke tokens
   */
  revokeToken(token: string): Promise<void>;
}

// ============================================================================
// OAuth User Information
// ============================================================================

/**
 * OAuth user information
 */
export interface OAuthUserInfo {
  /** User ID from OAuth provider */
  id: string;
  /** User email address */
  email: string;
  /** User display name */
  name?: string;
  /** User profile picture URL */
  picture?: string;
  /** Email verification status */
  emailVerified: boolean;
  /** OAuth provider */
  provider: OAuthProvider;
}

// ============================================================================
// OAuth Error Types
// ============================================================================

/**
 * OAuth error response
 */
export interface OAuthError {
  /** Error code */
  error: string;
  /** Error description */
  errorDescription?: string;
  /** Error URI for more information */
  errorUri?: string;
}

/**
 * OAuth error codes
 */
export type OAuthErrorCode =
  | 'invalid_request'
  | 'unauthorized_client'
  | 'access_denied'
  | 'unsupported_response_type'
  | 'invalid_scope'
  | 'server_error'
  | 'temporarily_unavailable'
  | 'invalid_grant'
  | 'invalid_client'
  | 'unsupported_grant_type'
  | 'invalid_token'
  | 'insufficient_scope'
  | 'token_expired';

/**
 * OAuth exception class
 */
export class OAuthException extends Error {
  constructor(
    public readonly error: OAuthErrorCode,
    public readonly description?: string,
    public readonly uri?: string
  ) {
    super(`OAuth Error: ${error}${description ? ` - ${description}` : ''}`);
    this.name = 'OAuthException';
  }
}

