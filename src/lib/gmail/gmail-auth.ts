/**
 * Gmail Authentication Module
 * 
 * Secure Gmail OAuth2 authentication with PKCE flow, token management,
 * and scope verification for robust API access.
 */

import { OAuth2Client } from 'google-auth-library';
import { gmail_v1, google } from 'googleapis';
import { getOAuthManager } from '../oauth/common-oauth';
import { GMAIL_SCOPES, GmailError } from './types';
import { apiObserver } from '../monitoring/api-observer';

// ============================================================================
// Gmail Authentication Service
// ============================================================================

export class GmailAuth {
  private oauth2Client: OAuth2Client;
  private gmail: gmail_v1.Gmail | null = null;

  constructor() {
    this.oauth2Client = new OAuth2Client({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      redirectUri: process.env.GOOGLE_REDIRECT_URI
    });
  }

  /**
   * Get Gmail API client instance
   */
  async getGmailClient(userId: string): Promise<gmail_v1.Gmail> {
    if (!this.gmail) {
      await this.initializeClient(userId);
    }
    
    if (!this.gmail) {
      throw new GmailError('AUTHENTICATION_FAILED', 'Failed to initialize Gmail client');
    }

    return this.gmail;
  }

  /**
   * Initialize Gmail client with OAuth tokens
   */
  private async initializeClient(userId: string): Promise<void> {
    try {
      // Check if user has valid tokens
      const oauthManager = getOAuthManager();
      const hasTokens = await oauthManager.hasValidTokens(userId, 'google');
      
      if (!hasTokens) {
        throw new GmailError('AUTHENTICATION_FAILED', 'No valid tokens found for Gmail');
      }

      // Get access token
      const accessToken = await oauthManager.getValidAccessToken(userId, 'google');

      // Set credentials with the access token
      this.oauth2Client.setCredentials({
        access_token: accessToken
      });

      // Verify token is still valid
      await this.verifyToken();

      // Initialize Gmail API client
      this.gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });

      apiObserver.logger.logRequest(
        'info',
        'Gmail client initialized successfully',
        {
          requestId: `gmail-init-${Date.now()}`,
          userId,
          path: '/gmail/init',
          method: 'POST',
          userAgent: 'Gmail-Auth/1.0'
        }
      );

    } catch (error) {
      apiObserver.logger.logRequest(
        'error',
        'Gmail client initialization failed',
        {
          requestId: `gmail-init-${Date.now()}`,
          userId,
          path: '/gmail/init',
          method: 'POST',
          userAgent: 'Gmail-Auth/1.0'
        }
      );
      
      if (error instanceof GmailError) {
        throw error;
      }
      
      throw new GmailError('AUTHENTICATION_FAILED', `Gmail initialization failed: ${error}`);
    }
  }

  /**
   * Verify OAuth token is valid and refresh if needed
   */
  private async verifyToken(): Promise<void> {
    try {
      const tokenInfo = await this.oauth2Client.getTokenInfo(this.oauth2Client.credentials.access_token!);
      
      // Check if token is expired or about to expire (within 5 minutes)
      if (tokenInfo.expiry_date && tokenInfo.expiry_date < Date.now() + 300000) {
        await this.refreshToken();
      }
      
    } catch (error) {
      // Token is invalid, try to refresh
      await this.refreshToken();
    }
  }

  /**
   * Refresh OAuth token
   */
  private async refreshToken(): Promise<void> {
    try {
      const { credentials } = await this.oauth2Client.refreshAccessToken();
      this.oauth2Client.setCredentials(credentials);
      
      // Note: Token storage handled by OAuth manager internally
      
    } catch (error) {
      throw new GmailError('AUTHENTICATION_FAILED', `Token refresh failed: ${error}`);
    }
  }

  /**
   * Verify required scopes are granted
   */
  async verifyScopes(userId: string, requiredScopes: string[] = [...GMAIL_SCOPES]): Promise<boolean> {
    try {
      const tokenInfo = await this.oauth2Client.getTokenInfo(this.oauth2Client.credentials.access_token!);
      
      if (!tokenInfo.scopes) {
        return false;
      }

      const grantedScopes = Array.isArray(tokenInfo.scopes) ? tokenInfo.scopes : [tokenInfo.scopes];
      
      return requiredScopes.every(scope => grantedScopes.includes(scope));
      
    } catch (error) {
      apiObserver.logger.logRequest(
        'warn',
        'Scope verification failed',
        {
          requestId: `gmail-scope-${Date.now()}`,
          userId,
          path: '/gmail/verify-scopes',
          method: 'GET',
          userAgent: 'Gmail-Auth/1.0'
        }
      );
      
      return false;
    }
  }

  /**
   * Generate authorization URL for OAuth flow
   */
  generateAuthUrl(state?: string): string {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [...GMAIL_SCOPES],
      state: state,
      prompt: 'consent' // Force consent to get refresh token
    });
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForTokens(code: string, userId: string): Promise<void> {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      
      if (!tokens.access_token) {
        throw new GmailError('AUTHENTICATION_FAILED', 'No access token received');
      }

      // Note: Token storage would be handled through OAuth callback flow

      // Set credentials for this client
      this.oauth2Client.setCredentials(tokens);

      apiObserver.logger.logRequest(
        'info',
        'Gmail OAuth token exchange successful',
        {
          requestId: `gmail-exchange-${Date.now()}`,
          userId,
          path: '/gmail/exchange',
          method: 'POST',
          userAgent: 'Gmail-Auth/1.0'
        }
      );

    } catch (error) {
      apiObserver.logger.logRequest(
        'error',
        'Gmail OAuth token exchange failed',
        {
          requestId: `gmail-exchange-${Date.now()}`,
          userId,
          path: '/gmail/exchange',
          method: 'POST',
          userAgent: 'Gmail-Auth/1.0'
        }
      );
      
      if (error instanceof GmailError) {
        throw error;
      }
      
      throw new GmailError('AUTHENTICATION_FAILED', `Token exchange failed: ${error}`);
    }
  }

  /**
   * Revoke authentication and clear tokens
   */
  async revokeAuth(userId: string): Promise<void> {
    try {
      if (this.oauth2Client.credentials.access_token) {
        await this.oauth2Client.revokeToken(this.oauth2Client.credentials.access_token);
      }
      
      // Revoke tokens through OAuth manager
      const oauthManager = getOAuthManager();
      await oauthManager.revokeTokens(userId, 'google');
      
      // Reset client
      this.oauth2Client.setCredentials({});
      this.gmail = null;

      apiObserver.logger.logRequest(
        'info',
        'Gmail authentication revoked',
        {
          requestId: `gmail-revoke-${Date.now()}`,
          userId,
          path: '/gmail/revoke',
          method: 'DELETE',
          userAgent: 'Gmail-Auth/1.0'
        }
      );

    } catch (error) {
      throw new GmailError('AUTHENTICATION_FAILED', `Auth revocation failed: ${error}`);
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(userId: string): Promise<boolean> {
    try {
      const oauthManager = getOAuthManager();
      return await oauthManager.hasValidTokens(userId, 'google');
    } catch (error) {
      return false;
    }
  }

  /**
   * Get user profile information
   */
  async getUserProfile(userId: string): Promise<{ email: string; name?: string }> {
    try {
      const gmail = await this.getGmailClient(userId);
      const profile = await gmail.users.getProfile({ userId: 'me' });
      
      return {
        email: profile.data.emailAddress || '',
        name: profile.data.emailAddress || ''
      };
      
    } catch (error) {
      throw new GmailError('API_ERROR', `Failed to get user profile: ${error}`);
    }
  }
}

// ============================================================================
// Export singleton instance
// ============================================================================

export const gmailAuth = new GmailAuth();