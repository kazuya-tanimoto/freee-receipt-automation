/**
 * OAuth2.0 Type Definitions
 * 
 * Unified type definitions for OAuth2.0 authentication flows.
 */

// Re-export from remaining files
export * from './oauth-constants';
export * from './oauth-guards';

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