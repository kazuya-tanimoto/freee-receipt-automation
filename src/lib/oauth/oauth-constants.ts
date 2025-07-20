/**
 * OAuth Constants and Scope Definitions
 * 
 * OAuth configuration constants and Google API scope definitions
 */

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