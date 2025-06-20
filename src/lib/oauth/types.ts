/**
 * OAuth2.0 Type Definitions
 * 
 * Comprehensive type definitions for OAuth2.0 authentication flows
 * with PKCE support for Gmail and Google Drive integration.
 */

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

// ============================================================================
// Service Scope Definitions
// ============================================================================

/**
 * Gmail API scopes
 */
export const GMAIL_SCOPES = {
  /** Read Gmail messages and attachments */
  READONLY: 'https://www.googleapis.com/auth/gmail.readonly',
  /** Compose and send Gmail messages */
  COMPOSE: 'https://www.googleapis.com/auth/gmail.compose',
  /** Modify Gmail messages (labels, etc.) */
  MODIFY: 'https://www.googleapis.com/auth/gmail.modify',
  /** Full Gmail access */
  FULL: 'https://www.googleapis.com/auth/gmail'
} as const;

/**
 * Google Drive API scopes
 */
export const DRIVE_SCOPES = {
  /** Access files created by this app */
  FILE: 'https://www.googleapis.com/auth/drive.file',
  /** Read-only access to file metadata */
  METADATA_READONLY: 'https://www.googleapis.com/auth/drive.metadata.readonly',
  /** Read-only access to files */
  READONLY: 'https://www.googleapis.com/auth/drive.readonly',
  /** Full Drive access */
  FULL: 'https://www.googleapis.com/auth/drive'
} as const;

/**
 * Google API scope definitions
 */
export const GOOGLE_SCOPES = {
  ...GMAIL_SCOPES,
  ...DRIVE_SCOPES,
  /** User profile information */
  USERINFO_EMAIL: 'https://www.googleapis.com/auth/userinfo.email',
  USERINFO_PROFILE: 'https://www.googleapis.com/auth/userinfo.profile'
} as const;

// ============================================================================
// OAuth Configuration Constants
// ============================================================================

/**
 * OAuth flow configuration constants
 */
export const OAUTH_CONFIG = {
  /** PKCE code verifier length (43-128 characters) */
  CODE_VERIFIER_LENGTH: 64,
  /** State parameter length */
  STATE_LENGTH: 32,
  /** PKCE parameters storage duration (seconds) */
  PKCE_STORAGE_DURATION: 600, // 10 minutes
  /** Token refresh buffer time (seconds) */
  TOKEN_REFRESH_BUFFER: 300, // 5 minutes
  /** Maximum retry attempts for token refresh */
  MAX_REFRESH_RETRIES: 3,
  /** Default redirect URI */
  DEFAULT_REDIRECT_URI: '/auth/callback'
} as const;

/**
 * Google API endpoints
 */
export const GOOGLE_ENDPOINTS = {
  /** Authorization endpoint */
  AUTHORIZATION: 'https://accounts.google.com/o/oauth2/v2/auth',
  /** Token endpoint */
  TOKEN: 'https://oauth2.googleapis.com/token',
  /** Token revocation endpoint */
  REVOKE: 'https://oauth2.googleapis.com/revoke',
  /** User info endpoint */
  USERINFO: 'https://www.googleapis.com/oauth2/v2/userinfo',
  /** Gmail API base */
  GMAIL_API: 'https://gmail.googleapis.com/gmail/v1',
  /** Drive API base */
  DRIVE_API: 'https://www.googleapis.com/drive/v3'
} as const;

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