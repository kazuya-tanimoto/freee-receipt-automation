/**
 * Google OAuth Helper Methods
 */

import { GoogleOAuthAuth } from './google-oauth-auth';

// ============================================================================
// Google OAuth Helper Methods
// ============================================================================

/** Helper methods for Google OAuth provider */
export class GoogleOAuthHelpers extends GoogleOAuthAuth {
  /** Check if token is valid (returns boolean) */
  async isTokenValid(accessToken: string): Promise<boolean> {
    return this.validateAccessToken(accessToken);
  }

  /** Validate scopes */
  validateScopes(grantedScopes: string[], requiredScopes: string[]): boolean {
    return requiredScopes.every(scope => grantedScopes.includes(scope));
  }

  /** Get scope descriptions */
  getScopeDescriptions(scopes: string[]): Record<string, string> {
    const desc: Record<string, string> = {
      'https://www.googleapis.com/auth/gmail.readonly': 'Read Gmail messages',
      'https://www.googleapis.com/auth/gmail.modify': 'Modify Gmail messages',
      'https://www.googleapis.com/auth/drive.readonly': 'Read Google Drive files',
      'https://www.googleapis.com/auth/drive.file': 'Access Google Drive files',
      'https://www.googleapis.com/auth/userinfo.email': 'Access email address'
    };
    return scopes.reduce((acc, scope) => {
      if (desc[scope]) acc[scope] = desc[scope];
      return acc;
    }, {} as Record<string, string>);
  }
}