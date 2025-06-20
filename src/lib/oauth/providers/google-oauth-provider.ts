/**
 * Google OAuth2.0 Provider Implementation
 * 
 * Implements the IOAuthProvider interface for Google OAuth2.0 authentication
 * with Gmail and Google Drive API integration.
 */

import type {
  IOAuthProvider,
  GoogleOAuthConfig,
  OAuthTokenResponse,
  OAuthUserInfo,
  OAuthException,
  CodeChallengeMethod
} from '../types';

// ============================================================================
// Google OAuth Provider Implementation
// ============================================================================

/**
 * Google OAuth2.0 provider implementation
 */
export class GoogleOAuthProvider implements IOAuthProvider {
  readonly config: GoogleOAuthConfig;

  constructor(config: GoogleOAuthConfig) {
    this.config = config;
    this.validateConfig();
  }

  /**
   * Validate provider configuration
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
   * Generate authorization URL with PKCE
   */
  generateAuthorizationUrl(params: {
    scopes: string[];
    redirectUri: string;
    state: string;
    codeChallenge: string;
    codeChallengeMethod: CodeChallengeMethod;
  }): string {
    const searchParams = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: params.redirectUri,
      response_type: 'code',
      scope: params.scopes.join(' '),
      state: params.state,
      code_challenge: params.codeChallenge,
      code_challenge_method: params.codeChallengeMethod,
      access_type: 'offline', // Request refresh token
      prompt: 'consent' // Ensure refresh token is always returned
    });

    return `${this.config.authorizationEndpoint}?${searchParams.toString()}`;
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForTokens(params: {
    code: string;
    redirectUri: string;
    codeVerifier: string;
  }): Promise<OAuthTokenResponse> {
    const tokenRequest = {
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      code: params.code,
      grant_type: 'authorization_code',
      redirect_uri: params.redirectUri,
      code_verifier: params.codeVerifier
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
          data.error || 'token_exchange_failed',
          data.error_description || 'Failed to exchange authorization code'
        );
      }

      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in,
        tokenType: data.token_type || 'Bearer',
        scope: data.scope
      };
    } catch (error) {
      if (error instanceof OAuthException) {
        throw error;
      }
      throw new OAuthException(
        'server_error',
        `Token exchange failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<OAuthTokenResponse> {
    const refreshRequest = {
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
        body: new URLSearchParams(refreshRequest).toString()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new OAuthException(
          data.error || 'token_refresh_failed',
          data.error_description || 'Failed to refresh access token'
        );
      }

      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token || refreshToken, // Keep existing if not rotated
        expiresIn: data.expires_in,
        tokenType: data.token_type || 'Bearer',
        scope: data.scope
      };
    } catch (error) {
      if (error instanceof OAuthException) {
        throw error;
      }
      throw new OAuthException(
        'server_error',
        `Token refresh failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Validate token and get user information
   */
  async validateToken(accessToken: string): Promise<OAuthUserInfo> {
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new OAuthException(
          'invalid_token',
          error.error_description || 'Token validation failed'
        );
      }

      const userInfo = await response.json();

      return {
        id: userInfo.id,
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
        emailVerified: userInfo.verified_email || false,
        provider: 'google'
      };
    } catch (error) {
      if (error instanceof OAuthException) {
        throw error;
      }
      throw new OAuthException(
        'server_error',
        `Token validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Revoke OAuth token
   */
  async revokeToken(token: string): Promise<void> {
    try {
      const response = await fetch('https://oauth2.googleapis.com/revoke', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({ token }).toString()
      });

      // Google returns 200 for successful revocation, even if token was already invalid
      if (!response.ok && response.status !== 400) {
        throw new Error(`Revocation failed with status ${response.status}`);
      }
    } catch (error) {
      throw new OAuthException(
        'server_error',
        `Token revocation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  // ============================================================================
  // Google API Helper Methods
  // ============================================================================

  /**
   * Make authenticated API request to Google services
   */
  async makeAuthenticatedRequest(
    accessToken: string,
    endpoint: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const defaultHeaders = {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json'
    };

    const response = await fetch(endpoint, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers
      }
    });

    // Handle common error responses
    if (response.status === 401) {
      throw new OAuthException('invalid_token', 'Access token is invalid or expired');
    }
    
    if (response.status === 403) {
      const error = await response.json().catch(() => ({}));
      throw new OAuthException(
        'insufficient_scope',
        error.error?.message || 'Insufficient permissions for this operation'
      );
    }

    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      throw new OAuthException(
        'temporarily_unavailable',
        `Rate limit exceeded. Retry after ${retryAfter} seconds`
      );
    }

    return response;
  }

  /**
   * Get Gmail API client
   */
  getGmailApiClient(accessToken: string) {
    return {
      /**
       * List Gmail messages
       */
      listMessages: async (params: {
        q?: string;
        maxResults?: number;
        pageToken?: string;
      } = {}) => {
        const searchParams = new URLSearchParams();
        if (params.q) searchParams.set('q', params.q);
        if (params.maxResults) searchParams.set('maxResults', params.maxResults.toString());
        if (params.pageToken) searchParams.set('pageToken', params.pageToken);

        const endpoint = `https://gmail.googleapis.com/gmail/v1/users/me/messages?${searchParams}`;
        const response = await this.makeAuthenticatedRequest(accessToken, endpoint);
        
        if (!response.ok) {
          throw new Error(`Gmail API error: ${response.status} ${response.statusText}`);
        }
        
        return response.json();
      },

      /**
       * Get Gmail message details
       */
      getMessage: async (messageId: string, format: string = 'full') => {
        const endpoint = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=${format}`;
        const response = await this.makeAuthenticatedRequest(accessToken, endpoint);
        
        if (!response.ok) {
          throw new Error(`Gmail API error: ${response.status} ${response.statusText}`);
        }
        
        return response.json();
      },

      /**
       * Get Gmail message attachment
       */
      getAttachment: async (messageId: string, attachmentId: string) => {
        const endpoint = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/attachments/${attachmentId}`;
        const response = await this.makeAuthenticatedRequest(accessToken, endpoint);
        
        if (!response.ok) {
          throw new Error(`Gmail API error: ${response.status} ${response.statusText}`);
        }
        
        return response.json();
      }
    };
  }

  /**
   * Get Google Drive API client
   */
  getDriveApiClient(accessToken: string) {
    return {
      /**
       * List Drive files
       */
      listFiles: async (params: {
        q?: string;
        pageSize?: number;
        pageToken?: string;
        fields?: string;
      } = {}) => {
        const searchParams = new URLSearchParams();
        if (params.q) searchParams.set('q', params.q);
        if (params.pageSize) searchParams.set('pageSize', params.pageSize.toString());
        if (params.pageToken) searchParams.set('pageToken', params.pageToken);
        if (params.fields) searchParams.set('fields', params.fields);

        const endpoint = `https://www.googleapis.com/drive/v3/files?${searchParams}`;
        const response = await this.makeAuthenticatedRequest(accessToken, endpoint);
        
        if (!response.ok) {
          throw new Error(`Drive API error: ${response.status} ${response.statusText}`);
        }
        
        return response.json();
      },

      /**
       * Get Drive file metadata
       */
      getFile: async (fileId: string, fields: string = '*') => {
        const endpoint = `https://www.googleapis.com/drive/v3/files/${fileId}?fields=${encodeURIComponent(fields)}`;
        const response = await this.makeAuthenticatedRequest(accessToken, endpoint);
        
        if (!response.ok) {
          throw new Error(`Drive API error: ${response.status} ${response.statusText}`);
        }
        
        return response.json();
      },

      /**
       * Download Drive file content
       */
      downloadFile: async (fileId: string) => {
        const endpoint = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
        const response = await this.makeAuthenticatedRequest(accessToken, endpoint);
        
        if (!response.ok) {
          throw new Error(`Drive API error: ${response.status} ${response.statusText}`);
        }
        
        return response;
      },

      /**
       * Upload file to Drive
       */
      uploadFile: async (metadata: any, content: Blob | Buffer) => {
        const boundary = '-------314159265358979323846';
        const delimiter = `\r\n--${boundary}\r\n`;
        const closeDelimiter = `\r\n--${boundary}--`;

        const metadataHeader = `Content-Type: application/json\r\n\r\n${JSON.stringify(metadata)}`;
        const contentHeader = `Content-Type: ${metadata.mimeType || 'application/octet-stream'}\r\n\r\n`;

        const body = delimiter + metadataHeader + delimiter + contentHeader;
        
        const endpoint = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
        const response = await this.makeAuthenticatedRequest(accessToken, endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': `multipart/related; boundary="${boundary}"`
          },
          body: body + content + closeDelimiter
        });
        
        if (!response.ok) {
          throw new Error(`Drive API error: ${response.status} ${response.statusText}`);
        }
        
        return response.json();
      },

      /**
       * Delete Drive file
       */
      deleteFile: async (fileId: string) => {
        const endpoint = `https://www.googleapis.com/drive/v3/files/${fileId}`;
        const response = await this.makeAuthenticatedRequest(accessToken, endpoint, {
          method: 'DELETE'
        });
        
        if (!response.ok && response.status !== 404) {
          throw new Error(`Drive API error: ${response.status} ${response.statusText}`);
        }
      }
    };
  }

  // ============================================================================
  // Scope Validation Methods
  // ============================================================================

  /**
   * Validate that required scopes are granted
   */
  validateScopes(grantedScopes: string[], requiredScopes: string[]): boolean {
    return requiredScopes.every(scope => grantedScopes.includes(scope));
  }

  /**
   * Get scope descriptions for user consent
   */
  getScopeDescriptions(scopes: string[]): Record<string, string> {
    const descriptions: Record<string, string> = {
      'https://www.googleapis.com/auth/gmail.readonly': 'Read your Gmail messages and attachments',
      'https://www.googleapis.com/auth/gmail.compose': 'Compose and send emails on your behalf',
      'https://www.googleapis.com/auth/gmail.modify': 'Manage your Gmail messages (add/remove labels)',
      'https://www.googleapis.com/auth/drive.file': 'Access files created by this app in your Google Drive',
      'https://www.googleapis.com/auth/drive.metadata.readonly': 'View metadata of files in your Google Drive',
      'https://www.googleapis.com/auth/drive.readonly': 'View files in your Google Drive',
      'https://www.googleapis.com/auth/userinfo.email': 'View your email address',
      'https://www.googleapis.com/auth/userinfo.profile': 'View your basic profile information'
    };

    return scopes.reduce((result, scope) => {
      if (descriptions[scope]) {
        result[scope] = descriptions[scope];
      }
      return result;
    }, {} as Record<string, string>);
  }
}