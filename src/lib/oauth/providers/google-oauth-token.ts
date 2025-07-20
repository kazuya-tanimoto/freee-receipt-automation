/**
 * Google OAuth2.0 Token Management
 * 
 * Token validation, refresh, and user info retrieval
 */

import {
  GoogleOAuthConfig,
  OAuthTokenResponse,
  OAuthUserInfo,
  OAuthException
} from '../types';

// ============================================================================
// Google OAuth Token Management
// ============================================================================

export class GoogleOAuthTokenManager {
  protected readonly config: GoogleOAuthConfig;

  constructor(config: GoogleOAuthConfig) {
    this.config = config;
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken: string): Promise<OAuthTokenResponse> {
    const tokenRequest = {
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    };

    try {
      const response = await fetch(this.config.tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: new URLSearchParams(tokenRequest).toString()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new OAuthException(
          data.error || 'server_error',
          data.error_description || 'Failed to refresh access token'
        );
      }

      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token || refreshToken, // Some providers don't return new refresh token
        expiresIn: data.expires_in,
        tokenType: data.token_type || 'Bearer',
        scope: data.scope
      };
    } catch (error) {
      if (error instanceof OAuthException) {
        throw error;
      }
      throw new OAuthException('server_error', 'Failed to refresh access token');
    }
  }

  /**
   * Get user information
   */
  async getUserInfo(accessToken: string): Promise<OAuthUserInfo> {
    try {
      const response = await this.makeAuthenticatedRequest(
        accessToken,
        this.config.userInfoEndpoint || 'https://www.googleapis.com/oauth2/v2/userinfo'
      );

      return {
        id: response.id,
        name: response.name,
        email: response.email,
        picture: response.picture,
        emailVerified: response.verified_email || false,
        provider: 'google' as const
      };
    } catch (error) {
      if (error instanceof OAuthException) {
        throw error;
      }
      throw new OAuthException('server_error', 'Failed to fetch user information');
    }
  }

  /**
   * Revoke access token
   */
  async revokeToken(accessToken: string): Promise<void> {
    try {
      const response = await fetch(
        `${this.config.revokeEndpoint || 'https://oauth2.googleapis.com/revoke'}?token=${accessToken}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new OAuthException(
          data.error || 'server_error',
          data.error_description || 'Failed to revoke token'
        );
      }
    } catch (error) {
      if (error instanceof OAuthException) {
        throw error;
      }
      throw new OAuthException('server_error', 'Failed to revoke token');
    }
  }

  /**
   * Make authenticated HTTP request
   */
  protected async makeAuthenticatedRequest(accessToken: string, url: string): Promise<any> {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new OAuthException('token_expired', 'Access token has expired');
      }
      throw new OAuthException('server_error', `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Validate token and get user info
   */
  async validateToken(accessToken: string): Promise<OAuthUserInfo> {
    return this.getUserInfo(accessToken);
  }

  /**
   * Validate access token
   */
  async validateAccessToken(accessToken: string): Promise<boolean> {
    try {
      await this.makeAuthenticatedRequest(
        accessToken,
        'https://www.googleapis.com/oauth2/v1/tokeninfo'
      );
      return true;
    } catch (error) {
      return false;
    }
  }
}