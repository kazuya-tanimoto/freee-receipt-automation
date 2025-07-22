/**
 * OAuth2.0 Type Definitions
 * 
 * Unified type definitions for OAuth2.0 authentication flows.
 */

// ============================================================================
// OAuth Configuration Constants
// ============================================================================

/**
 * Gmail API scopes
 */
export const GMAIL_SCOPES = {
  /** Read Gmail messages and attachments */
  READONLY: 'https://www.googleapis.com/auth/gmail.readonly',
} as const;

/**
 * Google Drive API scopes  
 */
export const DRIVE_SCOPES = {
  /** Read-only access to files */
  READONLY: 'https://www.googleapis.com/auth/drive.readonly',
} as const;

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
} as const;

// ============================================================================
// Core OAuth Types
// ============================================================================

export type OAuthProvider = 'google';
export type GrantType = 'authorization_code' | 'refresh_token';
export type CodeChallengeMethod = 'S256';
export type TokenType = 'Bearer';

// ============================================================================
// Configuration Types
// ============================================================================

export interface GoogleOAuthConfig {
  name: string;
  clientId: string;
  clientSecret: string;
  authorizationEndpoint: string;
  tokenEndpoint: string;
  defaultScopes: string[];
  supportedScopes: string[];
}

export interface IOAuthProvider {
  readonly config: GoogleOAuthConfig;
  generateAuthorizationUrl(params: {
    scopes: string[];
    redirectUri: string;
    state: string;
    codeChallenge: string;
    codeChallengeMethod: CodeChallengeMethod;
  }): string;
  exchangeCodeForTokens(params: {
    code: string;
    redirectUri: string;
    codeVerifier: string;
  }): Promise<OAuthTokenResponse>;
  refreshAccessToken(refreshToken: string): Promise<OAuthTokenResponse>;
  validateAccessToken(accessToken: string): Promise<boolean>;
  getUserInfo(accessToken: string): Promise<OAuthUserInfo>;
  revokeTokens(accessToken: string): Promise<void>;
}

// ============================================================================
// Request/Response Types
// ============================================================================

export interface OAuthInitiateRequest {
  provider: OAuthProvider;
  scopes: string[];
  redirectUri?: string;
}

export interface OAuthInitiateResponse {
  authorizationUrl: string;
  state: string;
  codeChallenge: string;
  codeChallengeMethod: CodeChallengeMethod;
}

export interface OAuthCallbackRequest {
  code: string;
  state: string;
  codeVerifier: string;
  redirectUri?: string;
}

export interface OAuthRefreshRequest {
  refreshToken: string;
}

export interface OAuthTokenResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  tokenType: TokenType;
  scope: string;
}

export interface OAuthUserInfo {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

// ============================================================================
// Storage Types
// ============================================================================

export interface PKCEParams {
  codeVerifier: string;
  codeChallenge: string;
  codeChallengeMethod: CodeChallengeMethod;
  state: string;
  expiresAt: Date;
}

export interface StoredOAuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt: Date;
  scope: string;
  tokenType: TokenType;
  provider: OAuthProvider;
}

// ============================================================================
// Error Types
// ============================================================================

export interface OAuthError {
  error: string;
  error_description?: string;
  error_uri?: string;
}

export class OAuthException extends Error {
  public error: string;
  public description?: string;
  
  constructor(
    public code: string,
    message: string,
    public statusCode?: number
  ) {
    super(`${code}: ${message}`);
    this.name = 'OAuthException';
    this.error = code;
    this.description = message;
  }
}