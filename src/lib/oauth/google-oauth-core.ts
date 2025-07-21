/**
 * Google OAuth Core Implementation
 * 
 * Core Google OAuth functionality without API clients.
 */

import { google } from 'googleapis';
import {
  IOAuthProvider,
  GoogleOAuthConfig,
  OAuthTokenResponse,
  OAuthUserInfo,
  OAuthException,
  CodeChallengeMethod
} from './types';

// ============================================================================
// Google OAuth Core Provider
// ============================================================================

/**
 * Core Google OAuth provider implementation
 */
export class GoogleOAuthCore implements IOAuthProvider {
  readonly config: GoogleOAuthConfig;
  protected oauth2Client: any;

  constructor(config: GoogleOAuthConfig) {
    this.config = config;
    this.validateConfig();
    this.oauth2Client = new google.auth.OAuth2(
      config.clientId,
      config.clientSecret,
      'http://localhost:3000/api/auth/callback'
    );
  }

  /**
   * Validate configuration
   */
  private validateConfig(): void {
    if (!this.config.clientId) {
      throw new Error('Google OAuth client ID is required');
    }
    if (!this.config.clientSecret) {
      throw new Error('Google OAuth client secret is required');
    }
  }

  /**
   * Generate authorization URL
   */
  generateAuthorizationUrl(params: {
    scopes: string[];
    redirectUri: string;
    state: string;
    codeChallenge: string;
    codeChallengeMethod: CodeChallengeMethod;
  }): string {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: params.scopes,
      redirect_uri: params.redirectUri,
      state: params.state,
      code_challenge: params.codeChallenge,
      code_challenge_method: params.codeChallengeMethod,
      prompt: 'consent'
    });
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForTokens(params: {
    code: string;
    redirectUri: string;
    codeVerifier: string;
  }): Promise<OAuthTokenResponse> {
    try {
      const { tokens } = await this.oauth2Client.getToken({
        code: params.code,
        redirect_uri: params.redirectUri,
        code_verifier: params.codeVerifier
      });

      return {
        accessToken: tokens.access_token!,
        refreshToken: tokens.refresh_token || '',
        expiresIn: tokens.expiry_date ? Math.floor((tokens.expiry_date - Date.now()) / 1000) : 3600,
        tokenType: tokens.token_type || 'Bearer',
        scope: tokens.scope || ''
      };
    } catch (error: any) {
      throw new OAuthException('TOKEN_EXCHANGE_FAILED', error?.message || 'Token exchange failed');
    }
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken: string): Promise<OAuthTokenResponse> {
    try {
      this.oauth2Client.setCredentials({ refresh_token: refreshToken });
      const { credentials } = await this.oauth2Client.refreshAccessToken();

      return {
        accessToken: credentials.access_token!,
        refreshToken: credentials.refresh_token || refreshToken,
        expiresIn: credentials.expiry_date ? Math.floor((credentials.expiry_date - Date.now()) / 1000) : 3600,
        tokenType: credentials.token_type || 'Bearer',
        scope: credentials.scope || ''
      };
    } catch (error: any) {
      throw new OAuthException('TOKEN_REFRESH_FAILED', error?.message || 'Token refresh failed');
    }
  }

  /**
   * Validate access token and get user info
   */
  async validateAccessToken(accessToken: string): Promise<boolean> {
    try {
      this.oauth2Client.setCredentials({ access_token: accessToken });
      const oauth2 = google.oauth2({ version: 'v2', auth: this.oauth2Client });
      await oauth2.userinfo.get();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get user information
   */
  async getUserInfo(accessToken: string): Promise<OAuthUserInfo> {
    try {
      this.oauth2Client.setCredentials({ access_token: accessToken });
      const oauth2 = google.oauth2({ version: 'v2', auth: this.oauth2Client });
      const { data } = await oauth2.userinfo.get();

      return {
        id: data.id!,
        email: data.email!,
        name: data.name || '',
        picture: data.picture || ''
      };
    } catch (error: any) {
      throw new OAuthException('USER_INFO_FAILED', error?.message || 'Failed to get user info');
    }
  }

  /**
   * Revoke tokens
   */
  async revokeTokens(accessToken: string): Promise<void> {
    try {
      this.oauth2Client.setCredentials({ access_token: accessToken });
      await this.oauth2Client.revokeCredentials();
    } catch (error: any) {
      throw new OAuthException('TOKEN_REVOCATION_FAILED', error?.message || 'Token revocation failed');
    }
  }

  /**
   * Validate token (backwards compatibility)
   */
  async validateToken(accessToken: string): Promise<OAuthUserInfo> {
    return this.getUserInfo(accessToken);
  }

  /**
   * Validate scopes
   */
  validateScopes(grantedScopes: string[], requiredScopes: string[]): boolean {
    return requiredScopes.every(scope => grantedScopes.includes(scope));
  }

  /**
   * Get scope descriptions
   */
  getScopeDescriptions(scopes: string[]): Record<string, string> {
    const descriptions: Record<string, string> = {
      'https://www.googleapis.com/auth/gmail.readonly': 'Read Gmail messages',
      'https://www.googleapis.com/auth/gmail.modify': 'Modify Gmail messages',
      'https://www.googleapis.com/auth/drive.readonly': 'Read Google Drive files',
      'https://www.googleapis.com/auth/drive.file': 'Access Google Drive files',
      'https://www.googleapis.com/auth/userinfo.email': 'Access email address',
      'https://www.googleapis.com/auth/userinfo.profile': 'Access profile information'
    };
    
    return scopes.reduce((acc, scope) => {
      if (descriptions[scope]) acc[scope] = descriptions[scope];
      return acc;
    }, {} as Record<string, string>);
  }
}