/**
 * Google OAuth2.0 Authentication Core
 */

import {
  IOAuthProvider,
  GoogleOAuthConfig,
  OAuthTokenResponse,
  OAuthUserInfo,
  OAuthException,
  CodeChallengeMethod
} from '../types';
import { GoogleOAuthTokenManager } from './google-oauth-token';

// ============================================================================
// Google OAuth Authentication Core
// ============================================================================

/** Google OAuth2.0 authentication core implementation */
export class GoogleOAuthAuth extends GoogleOAuthTokenManager implements IOAuthProvider {
  readonly config: GoogleOAuthConfig;

  constructor(config: GoogleOAuthConfig) {
    super(config);
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
      scope: params.scopes.join(' '),
      response_type: 'code',
      state: params.state,
      code_challenge: params.codeChallenge,
      code_challenge_method: params.codeChallengeMethod,
      access_type: 'offline',
      prompt: 'consent'
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
          data.error || 'server_error',
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
      throw new OAuthException('server_error', 'Failed to exchange authorization code');
    }
  }


}